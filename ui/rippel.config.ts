import { defineConfig } from "rippel";
import { dpiFromDiagonal } from "rippel/displays";
import { esp32s3 } from "rippel/mcu";

export default defineConfig({
  entry: "src/App.tsx",
  contract: "src/firmware.contract.ts",
  // The prototype's display: Adafruit 2.4" TFT, ILI9341, used in portrait.
  display: {
    name: 'Adafruit 2.4" TFT (ILI9341)',
    width: 240,
    height: 320,
    colorFormat: "RGB565",
    dpi: dpiFromDiagonal(240, 320, 2.4),
  },
  // Placeholder until the new board's MCU is chosen.
  mcu: esp32s3(),
  output: {
    // Move this under the new firmware's components/ folder once it exists.
    dir: "build/ui",
    integration: "esp-idf",
  },
});
