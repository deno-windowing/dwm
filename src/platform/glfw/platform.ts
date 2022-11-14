import { Platform } from "../../core/platform.ts";
import {
  getProcAddress,
  mainloop,
  pollEvents,
  WindowGlfw as Window,
} from "./window.ts";

export default <Platform> {
  Window,
  pollEvents,
  getProcAddress,
  mainloop,
};
