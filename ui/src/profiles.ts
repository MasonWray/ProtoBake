/**
 * Solder profiles. Each zone ramps linearly to its target over its duration,
 * starting from the previous zone's target. The values are the prototype
 * firmware's (ProfileView.cpp), with its "heat" and "flow" zones named heat and reflow.
 */

export interface Zone {
  name: string;
  targetC: number;
  seconds: number;
}

export interface Profile {
  name: string;
  zones: Zone[];
}

/** The temperature a cycle is assumed to start from, for drawing the target curve. */
export const START_C = 20;

const zones = (preheat: number[], soak: number[], heat: number[], reflow: number[], cool: number[]): Zone[] => [
  { name: "Preheat", targetC: preheat[0], seconds: preheat[1] },
  { name: "Soak", targetC: soak[0], seconds: soak[1] },
  { name: "Heat", targetC: heat[0], seconds: heat[1] },
  { name: "Reflow", targetC: reflow[0], seconds: reflow[1] },
  { name: "Cool", targetC: cool[0], seconds: cool[1] },
];

export const PROFILES: Profile[] = [
  { name: "Sn63/Pb37", zones: zones([150, 60], [165, 120], [230, 30], [230, 20], [START_C, 60]) },
  { name: "SAC305", zones: zones([150, 60], [180, 120], [250, 30], [250, 15], [START_C, 60]) },
];

/** Names for the contract's `phase` values. */
export const PHASE_NAMES = ["Ready", "Preheat", "Soak", "Heat", "Reflow", "Cool", "Done"];
export const PHASE = { idle: 0, cool: 5, done: 6 };

// These run at build time, so they stick to what Rippel's compiler can evaluate:
// const, early returns and recursion, but no loops or reduce.

export function totalSeconds(profile: Profile): number {
  const z = profile.zones;
  return z[0].seconds + z[1].seconds + z[2].seconds + z[3].seconds + z[4].seconds;
}

export function peakC(profile: Profile): number {
  const z = profile.zones;
  return Math.max(z[0].targetC, Math.max(z[1].targetC, Math.max(z[2].targetC, Math.max(z[3].targetC, z[4].targetC))));
}

/** The temperature the profile asks for at this moment of the cycle. */
export function targetAt(profile: Profile, seconds: number): number {
  return rampFrom(profile, seconds, 0, START_C, 0);
}

/** Zone `i` ramps from `from` degrees, starting `start` seconds into the cycle. */
function rampFrom(profile: Profile, seconds: number, i: number, from: number, start: number): number {
  const zone = profile.zones[i];
  const end = start + zone.seconds;
  if (i === profile.zones.length - 1 || seconds < end) {
    return from + (zone.targetC - from) * Math.min(1, (seconds - start) / zone.seconds);
  }
  return rampFrom(profile, seconds, i + 1, zone.targetC, end);
}
