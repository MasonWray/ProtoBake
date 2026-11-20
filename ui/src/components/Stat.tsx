import type { ParentComponent } from "rippel";

/** A small caption over a value. Pass the value as a label child. */
export const Stat: ParentComponent<{ caption: string }> = (props) => (
  <view class="stat">
    <label class="stat-caption">{props.caption}</label>
    {props.children}
  </view>
);
