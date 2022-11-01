import { Platform } from "../../core/platform.ts";
import { pollEvents } from "./event.ts";
import { WindowWin32 as Window } from "./window.ts";

export default <Platform> {
  Window,
  pollEvents,
};
