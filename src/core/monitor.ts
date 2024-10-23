import type { Position, Rect, Size } from "./common.ts";

export interface VideoMode {
  width: number;
  height: number;
  redBits: number;
  greenBits: number;
  blueBits: number;
  refreshRate: number;
}

export abstract class DwmMonitor {
  /**
   * Monitor's name
   */
  abstract readonly name: string;

  /**
   * Monitor's pointer
   */
  abstract readonly nativeHandle: Deno.PointerValue;

  /**
   * Monitor's position
   */
  abstract readonly position: Position;

  /**
   * Monitor's work area
   */
  abstract readonly workArea: Rect;

  /**
   * Content scale
   */
  abstract readonly contentScale: Position;

  /**
   * Monitor's video mode
   */
  abstract readonly videoMode: VideoMode;

  /**
   * Monitor's physical size
   */
  abstract readonly physicalSize: Size;

  /**
   * Monitor's list of video modes
   */
  abstract readonly videoModes: VideoMode[];
}
