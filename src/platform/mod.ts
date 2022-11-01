import { Platform } from "../core/platform.ts";
import { CreateWindowOptions } from "../core/window.ts";
import Win32 from "./win/platform.ts";

let platform: Platform;

switch (Deno.build.os) {
  case "windows":
    platform = Win32;
    break;
  default:
    throw new Error(`Unsupported platform: ${Deno.build.os}`);
}

const { Window, pollEvents } = platform;

export function createWindow(options: CreateWindowOptions) {
  return new Window(options);
}

export { pollEvents, Window };
