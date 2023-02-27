import { StylePlatform } from "./platform.ts";
import { DwmWindow } from "../../mod.ts";

function applyBlur(win: DwmWindow) {
  console.warn("blur not implemented for this system");
}

function clearBlur(win: DwmWindow) {
  console.warn("blur not implemented for this system");
}

function applyDark(win: DwmWindow) {
  console.warn("themes not implemented for this system");
}

function applyLight(win: DwmWindow) {
  console.warn("themes not implemented for this system");
}

function applyMica(win: DwmWindow) {
  console.warn("mica not implemented for this system");
}

function applyMicaAlt(win: DwmWindow) {
  console.warn("mica not implemented for this system");
}

function clearMica(win: DwmWindow) {
  console.warn("mica not implemented for this system");
}

export default {
  applyBlur,
  clearBlur,
  applyMica,
  applyMicaAlt,
  clearMica,
  applyDark,
  applyLight,
} as StylePlatform;
