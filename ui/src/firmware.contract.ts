/**
 * Everything the UI and the firmware say to each other.
 *
 * The firmware owns the oven: it reads the thermocouple, runs the control loop,
 * switches the SSR and decides when a cycle ends. The UI shows what the
 * firmware reports and asks it to start or stop.
 */
import { action, bool, i16, signal, str, u16, u8 } from "rippel/contract";

/** Set once the firmware has finished starting up. The splash screen shows until then. */
export const ready = signal(bool);

/** Shown on the splash screen. */
export const firmwareVersion = signal(str(16), { initial: "v0.2.0" });

/** Oven temperature from the thermocouple, in tenths of a degree C. */
export const ovenDeciC = signal(i16, { initial: 210 });

/**
 * The thermocouple amplifier's fault, if any: 0 none, 1 open circuit,
 * 2 shorted to ground, 3 shorted to VCC. These are the MAX31855's three fault bits.
 */
export const thermocoupleFault = signal(u8);

/** Where the cycle is: 0 idle, 1 preheat, 2 soak, 3 heat, 4 reflow, 5 cool, 6 finished. */
export const phase = signal(u8);

/** Seconds since the cycle started. Stays at its last value when the cycle ends. */
export const elapsedS = signal(u16);

/** The temperature the controller is aiming for right now, in degrees C. */
export const targetC = signal(i16);

/** Whether the SSR is on. */
export const heaterOn = signal(bool);

/**
 * Starts a cycle. Each zone ramps linearly from the previous zone's target
 * (the oven's temperature at the start, for preheat) to its own target over
 * its duration. The firmware ends the cycle after the cool zone.
 */
export const startCycle = action({
  preheatC: u16,
  preheatS: u16,
  soakC: u16,
  soakS: u16,
  heatC: u16,
  heatS: u16,
  reflowC: u16,
  reflowS: u16,
  coolC: u16,
  coolS: u16,
});

/** Stops the running cycle and turns the heater off. The firmware returns `phase` to idle. */
export const stopCycle = action({});

/** Tells the firmware the user has seen the finished cycle. Returns `phase` to idle. */
export const ackCycle = action({});
