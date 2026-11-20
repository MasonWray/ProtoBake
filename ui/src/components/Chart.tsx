import { For } from "rippel";
import { COLUMNS, TARGET_PX, hotAt, profileIndex, sampleAt } from "../state";

/**
 * The profile's target curve in grey, with the oven's measured temperature drawn
 * over it. A bar turns red when the oven ran more than a few degrees over target.
 *
 * Bars stand in for lines until Rippel has a chart element.
 */
export function Chart() {
  const target = (col: number) => TARGET_PX[profileIndex()][col];

  return (
    <view class="chart">
      <For each={COLUMNS}>
        {(col) => (
          <>
            <view class="chart-target" style={{ height: target(col) }} />
            <view
              class={`chart-live ${hotAt(col) ? "chart-live-hot" : "chart-live-ok"}`}
              style={{ height: sampleAt(col) }}
            />
          </>
        )}
      </For>
    </view>
  );
}
