import { Platform } from "../core/platform.ts";
import { CreateWindowOptions } from "../core/window.ts";
import Glfw from "./glfw/platform.ts";

let platform: Platform;

switch (Deno.build.os) {
  case "windows":
  case "darwin":
  case "linux":
    platform = Glfw;
    break;
  default:
    throw new Error(`Unsupported platform: ${Deno.build.os}`);
}

const {
  Window,
  pollEvents,
  getProcAddress,
  mainloop,
  getInstanceProcAddress,
  getPhysicalDevicePresentationSupport,
  getRequiredInstanceExtensions,
  vulkanSupported,
} = platform;

export function createWindow(options: CreateWindowOptions) {
  return new Window(options);
}

export {
  getInstanceProcAddress,
  getPhysicalDevicePresentationSupport,
  getProcAddress,
  getRequiredInstanceExtensions,
  mainloop,
  pollEvents,
  vulkanSupported,
  Window,
};
