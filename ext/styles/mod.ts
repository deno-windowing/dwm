import { StylePlatform } from "./platform.ts";
import WIN from "./windows.ts";

let platform: StylePlatform;

switch (Deno.build.os) {
  case "windows":
    platform = WIN;
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
