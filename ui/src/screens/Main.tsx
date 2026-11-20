import { Show } from "rippel";
import { Chart } from "../components/Chart";
import { Stat } from "../components/Stat";
import { elapsedS, heaterOn, ovenDeciC, phase, targetC, thermocoupleFault } from "../firmware.contract";
import { PHASE, PHASE_NAMES } from "../profiles";
import {
  canStart,
  clock,
  dismissFinished,
  faulted,
  peakDeciC,
  profile,
  running,
  setScreen,
  start,
  stop,
} from "../state";

const FAULTS = ["", "Thermocouple open", "Thermocouple shorted to GND", "Thermocouple shorted to VCC"];

export function Main() {
  const status = () => {
    if (faulted()) return "Fault";
    return PHASE_NAMES[phase()];
  };

  return (
    <view class="screen">
      <view class="header">
        <label class="profile-name">{profile().name}</label>
        <view class="status">
          <view class="heater" checked={heaterOn()} />
          <label class={`status-text ${faulted() ? "status-fault" : "status-ok"}`}>{status()}</label>
        </view>
      </view>

      <Chart />

      <Show
        when={!faulted()}
        fallback={
          <view class="readout">
            <label class="fault">{FAULTS[thermocoupleFault()]}</label>
          </view>
        }
      >
        <view class="readout">
          <label class="temperature">{(ovenDeciC() / 10).toFixed(1)}°C</label>
        </view>
      </Show>

      <view class="stats">
        <Stat caption="TARGET">
          <label class="stat-value">{running() ? `${targetC()}°` : "--"}</label>
        </Stat>
        <Stat caption="TIME">
          <label class="stat-value">{clock(elapsedS())}</label>
        </Stat>
        <Stat caption="PEAK">
          <label class="stat-value">{peakDeciC() > 0 ? `${Math.round(peakDeciC() / 10)}°` : "--"}</label>
        </Stat>
      </view>

      <view class="actions">
        <Show
          when={running()}
          fallback={
            <button class="action action-start" disabled={!canStart()} onClick={start}>
              {phase() === PHASE.done ? "AGAIN" : "START"}
            </button>
          }
        >
          <button class="action action-stop" onClick={stop}>
            STOP
          </button>
        </Show>
        <button
          class="action"
          disabled={running()}
          onClick={() => {
            if (phase() === PHASE.done) dismissFinished();
            setScreen("profiles");
          }}
        >
          PROFILE
        </button>
      </view>
    </view>
  );
}
