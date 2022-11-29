import { Platform } from "../../core/platform.ts";
import {
  getInstanceProcAddress,
  getPhysicalDevicePresentationSupport,
  getProcAddress,
  getRequiredInstanceExtensions,
  mainloop,
  pollEvents,
  vulkanSupported,
  WindowGlfw as Window,
} from "./window.ts";

export default <Platform> {
  Window,
  pollEvents,
  getProcAddress,
  mainloop,
  vulkanSupported,
  getRequiredInstanceExtensions,
  getInstanceProcAddress,
  getPhysicalDevicePresentationSupport,
};
