import { StylePlatform } from "./platform.ts";
import WIN from "./windows.ts";
import DARWIN from "./darwin.ts";
import LINUX from "./linux.ts";

let platform: StylePlatform;

switch (Deno.build.os) {
  case "windows":
    platform = WIN;
    break;
  case "darwin":
    platform = DARWIN;
    break;
  case "linux":
    platform = LINUX;
    break;
  default:
    throw new Error(`Unsupported platform: ${Deno.build.os}`);
}
const {
  applyBlur,
  clearBlur,
  applyMica,
  applyDark,
  applyLight,
  applyMicaAlt,
  clearMica,
} = platform;

export {
  applyBlur,
  applyDark,
  applyLight,
  applyMica,
  applyMicaAlt,
  clearBlur,
  clearMica,
};
