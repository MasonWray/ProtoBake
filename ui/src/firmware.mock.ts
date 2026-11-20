/**
 * Plays the oven's firmware in the simulator. Runs only in the browser; on the
 * device the real firmware does this.
 *
 * The oven is a two-part thermal model: the heating elements warm up and cool
 * down with some lag, and the cavity follows them while losing heat to the room.
 * That gives the overshoot and slow cooling of a real toaster oven. Control is
 * the prototype's on/off rule: heater on whenever the oven is below target.
 *
 * Time runs SPEED times faster than real time, so a cycle takes about a minute and a half.
 */
import { defineMock } from "rippel/mock";
import * as fw from "./firmware.contract";

const SPEED = 3;
const ROOM_C = 21;
/** How fast the elements heat with the SSR on, in degrees C per second. */
const ELEMENT_RATE = 15;
/** Element time constant, in seconds. */
const ELEMENT_LAG = 6;
/** How strongly the cavity follows the elements, per second. */
const COUPLING = 0.035;
/** Heat lost to the room, per second. */
const LOSS = 0.006;

interface Zone {
  targetC: number;
  seconds: number;
}

export default defineMock(({ set, on, every }) => {
  let ovenC = ROOM_C;
  let elementC = ROOM_C;
  let heater = false;
  let zones: Zone[] = [];
  let startC = ROOM_C;
  let seconds = 0;
  let running = false;

  every(1500, () => set(fw.ready, true));

  const target = () => {
    let from = startC;
    let start = 0;
    for (let i = 0; i < zones.length; i++) {
      const end = start + zones[i].seconds;
      if (seconds < end) return { phase: i + 1, c: from + ((zones[i].targetC - from) * (seconds - start)) / zones[i].seconds };
      from = zones[i].targetC;
      start = end;
    }
    return { phase: 6, c: from };
  };

  const setHeater = (onOff: boolean) => {
    heater = onOff;
    set(fw.heaterOn, onOff);
  };

  on(fw.startCycle, (a) => {
    zones = [
      { targetC: a.preheatC, seconds: a.preheatS },
      { targetC: a.soakC, seconds: a.soakS },
      { targetC: a.heatC, seconds: a.heatS },
      { targetC: a.reflowC, seconds: a.reflowS },
      { targetC: a.coolC, seconds: a.coolS },
    ];
    startC = ovenC;
    seconds = 0;
    running = true;
    set(fw.elapsedS, 0);
    set(fw.phase, 1);
  });

  on(fw.stopCycle, () => {
    running = false;
    setHeater(false);
    set(fw.phase, 0);
  });

  on(fw.ackCycle, () => set(fw.phase, 0));

  every(50, (ms) => {
    const dt = (ms / 1000) * SPEED;

    if (running && fw.thermocoupleFault() > 0) {
      // A real controller can't see the oven, so it shuts the heater off.
      running = false;
      setHeater(false);
      set(fw.phase, 0);
    }

    if (running) {
      seconds += dt;
      const t = target();
      if (t.phase === 6) {
        running = false;
        setHeater(false);
        set(fw.phase, 6);
      } else {
        set(fw.phase, t.phase);
        set(fw.targetC, Math.round(t.c));
        setHeater(ovenC < t.c);
      }
      set(fw.elapsedS, Math.floor(seconds));
    }

    const elementGoal = heater ? ovenC + ELEMENT_RATE * ELEMENT_LAG : ovenC;
    elementC += (elementGoal - elementC) * Math.min(1, dt / ELEMENT_LAG);
    ovenC += ((elementC - ovenC) * COUPLING - (ovenC - ROOM_C) * LOSS) * dt;

    const noise = (Math.random() - 0.5) * 0.5;
    set(fw.ovenDeciC, Math.round((ovenC + noise) * 10));
  });
});
