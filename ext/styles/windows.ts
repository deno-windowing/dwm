import { StylePlatform } from "./platform.ts";
import { ffi } from "../../src/platform/glfw/ffi.ts";
import {
  allocDWM_BLURBEHIND,
  DWM_BB_ENABLE,
  DwmEnableBlurBehindWindow,
  DwmSetWindowAttribute,
  DWMWA_USE_IMMERSIVE_DARK_MODE,
} from "https://win32.deno.dev/0.4.1/Graphics.Dwm";
import { DwmWindow } from "../../mod.ts";


function applyBlur(win: DwmWindow) {
  DwmEnableBlurBehindWindow(
    ffi.glfwGetWin32Window!(win.nativeHandle),
    allocDWM_BLURBEHIND({
      dwFlags: DWM_BB_ENABLE,
      fEnable: true,
      hRgnBlur: null,
      fTransitionOnMaximized: false,
    }),
  );
}

function clearBlur(win: DwmWindow) {
  DwmEnableBlurBehindWindow(
    ffi.glfwGetWin32Window!(win.nativeHandle),
    allocDWM_BLURBEHIND({
      dwFlags: DWM_BB_ENABLE,
      fEnable: false,
      hRgnBlur: null,
      fTransitionOnMaximized: false,
    }),
  );
}

function applyDark(win: DwmWindow) {
  DwmSetWindowAttribute(
    ffi.glfwGetWin32Window!(win.nativeHandle),
    DWMWA_USE_IMMERSIVE_DARK_MODE,
    Uint8Array.of(2),
    4,
  );
}

function applyLight(win: DwmWindow) {
  DwmSetWindowAttribute(
    ffi.glfwGetWin32Window!(win.nativeHandle),
    DWMWA_USE_IMMERSIVE_DARK_MODE,
    Uint8Array.of(0),
    4,
  );
}

function applyMica(win: DwmWindow) {
  DwmSetWindowAttribute(
    ffi.glfwGetWin32Window!(win.nativeHandle),
    38,
    Uint8Array.of(2),
    4,
  );
}

function applyMicaAlt(win: DwmWindow) {
  DwmSetWindowAttribute(
    ffi.glfwGetWin32Window!(win.nativeHandle),
    38,
    Uint8Array.of(4),
    4,
  );
}

function clearMica(win: DwmWindow) {
  DwmSetWindowAttribute(
    ffi.glfwGetWin32Window!(win.nativeHandle),
    38,
    Uint8Array.of(0),
    4,
  );
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
