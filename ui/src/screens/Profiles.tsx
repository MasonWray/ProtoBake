import { For } from "rippel";
import { PROFILES } from "../profiles";
import { PROFILE_INFO, chooseProfile, clock, profileIndex, setScreen } from "../state";

export function Profiles() {
  return (
    <view class="screen">
      <label class="title">Solder profile</label>
      <view class="profile-list">
        <For each={PROFILES}>
          {(p, index) => (
            <view class="profile-row" checked={profileIndex() === index()} onClick={() => chooseProfile(index())}>
              <label class="profile-row-name">{p.name}</label>
              <label class="profile-row-detail">
                Peak {PROFILE_INFO[index()].peakC}°C • {clock(PROFILE_INFO[index()].totalS)}
              </label>
            </view>
          )}
        </For>
      </view>
      <view class="actions">
        <button class="action" onClick={() => setScreen("main")}>
          CANCEL
        </button>
      </view>
    </view>
  );
}
