import { createEffect, Match, Switch } from "rippel";
import { ready } from "./firmware.contract";
import { Main } from "./screens/Main";
import { Profiles } from "./screens/Profiles";
import { Splash } from "./screens/Splash";
import { recordSample, screen } from "./state";
import "./styles.css";

export default function App() {
  createEffect(recordSample);

  return (
    <view class="app">
      {/* Only the open screen's objects exist on the device. The others are built when they open. */}
      <Switch lazy>
        <Match when={!ready()}>
          <Splash />
        </Match>
        <Match when={screen() === "profiles"}>
          <Profiles />
        </Match>
        <Match when={screen() === "main"}>
          <Main />
        </Match>
      </Switch>
    </view>
  );
}
