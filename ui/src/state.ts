/** State shared across screens. */
import { batch, createSignal } from "rippel";
import { ackCycle, elapsedS, ovenDeciC, phase, startCycle, stopCycle, targetC, thermocoupleFault } from "./firmware.contract";
import { PHASE, PROFILES, peakC, targetAt, totalSeconds } from "./profiles";

export const [screen, setScreen] = createSignal<"main" | "profiles">("main");

// Profile

export const [profileIndex, setProfileIndex] = createSignal(0);
export const profile = () => PROFILES[profileIndex()];

/** Facts about each profile, worked out at build time. */
export const PROFILE_INFO = PROFILES.map((p) => ({ totalS: totalSeconds(p), peakC: peakC(p) }));

export function chooseProfile(index: number) {
  batch(() => {
    setProfileIndex(index);
    setScreen("main");
  });
}

// Cycle

export const running = () => phase() > PHASE.idle && phase() < PHASE.done;
export const faulted = () => thermocoupleFault() > 0;
export const canStart = () => !running() && !faulted();

/** Each profile's zones, flattened into the arguments `startCycle` takes. */
const CYCLE_ARGS = PROFILES.map((p) => ({
  preheatC: p.zones[0].targetC,
  preheatS: p.zones[0].seconds,
  soakC: p.zones[1].targetC,
  soakS: p.zones[1].seconds,
  heatC: p.zones[2].targetC,
  heatS: p.zones[2].seconds,
  reflowC: p.zones[3].targetC,
  reflowS: p.zones[3].seconds,
  coolC: p.zones[4].targetC,
  coolS: p.zones[4].seconds,
}));

export function start() {
  clearChart();
  startCycle({
    preheatC: CYCLE_ARGS[profileIndex()].preheatC,
    preheatS: CYCLE_ARGS[profileIndex()].preheatS,
    soakC: CYCLE_ARGS[profileIndex()].soakC,
    soakS: CYCLE_ARGS[profileIndex()].soakS,
    heatC: CYCLE_ARGS[profileIndex()].heatC,
    heatS: CYCLE_ARGS[profileIndex()].heatS,
    reflowC: CYCLE_ARGS[profileIndex()].reflowC,
    reflowS: CYCLE_ARGS[profileIndex()].reflowS,
    coolC: CYCLE_ARGS[profileIndex()].coolC,
    coolS: CYCLE_ARGS[profileIndex()].coolS,
  });
}

export function stop() {
  stopCycle({});
}

export function dismissFinished() {
  ackCycle({});
}

/** "3:05" from a number of seconds. */
export const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" : ""}${seconds % 60}`;

// Chart. The target curve is worked out at build time for every profile. The
// live trace keeps one signal per column, so each new sample redraws one bar.

export const CHART_COLUMNS = 52;
export const CHART_HEIGHT = 104;
/** The chart's vertical scale, in degrees C. */
export const CHART_MAX_C = 300;

export const COLUMNS = Array.from({ length: CHART_COLUMNS }, (_, i) => i);

/** Bar heights for each profile's target curve, sampled at the middle of each column. */
export const TARGET_PX = PROFILES.map((p) =>
  COLUMNS.map((col) => Math.round((targetAt(p, ((col + 0.5) / CHART_COLUMNS) * totalSeconds(p)) * CHART_HEIGHT) / CHART_MAX_C)),
);

/** How far over target the oven can run before the chart marks it hot, in degrees C. */
export const HOT_MARGIN_C = 5;

const columns = COLUMNS.map(() => createSignal(0));
const hotColumns = COLUMNS.map(() => createSignal(false));
/** The live trace's bar height in one column. */
export const sampleAt = (col: number) => columns[col][0]();
/** Whether the oven was over target, by more than the margin, when the column was last sampled. */
export const hotAt = (col: number) => hotColumns[col][0]();

export const [peakDeciC, setPeakDeciC] = createSignal(0);

function clearChart() {
  batch(() => {
    for (const [, set] of columns) set(0);
    for (const [, set] of hotColumns) set(false);
    setPeakDeciC(0);
  });
}

/** The chart column the current moment of the cycle falls in. */
function currentColumn() {
  return Math.min(CHART_COLUMNS - 1, Math.floor((elapsedS() * CHART_COLUMNS) / PROFILE_INFO[profileIndex()].totalS));
}

/** Copies the oven temperature into the chart. Runs in an effect. */
export function recordSample() {
  if (!running()) return;
  columns[currentColumn()][1](Math.min(CHART_HEIGHT, Math.round((ovenDeciC() * CHART_HEIGHT) / (CHART_MAX_C * 10))));
  hotColumns[currentColumn()][1](ovenDeciC() > (targetC() + HOT_MARGIN_C) * 10);
  setPeakDeciC(Math.max(peakDeciC(), ovenDeciC()));
}
