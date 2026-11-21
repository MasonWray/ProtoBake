import { firmwareVersion } from "../firmware.contract";

export function Splash() {
  return (
    <view class="splash">
      <label class="splash-title">ProtoBake</label>
      <view class="splash-footer">
        <label class="splash-version">{firmwareVersion()}</label>
      </view>
    </view>
  );
}
