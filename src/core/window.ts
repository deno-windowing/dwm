import { Position, Size } from "./common.ts";

export interface CreateWindowOptions {
  /**
   * Title of the window
   */
  title?: string;

  /**
   * Window's width
   */
  width?: number;

  /**
   * Window's height
   */
  height?: number;

  /**
   * Whether the window is maximized
   */
  maximized?: boolean;

  /**
   * Whether the window is minimized
   */
  minimized?: boolean;

  /**
   * Whether the window is focused
   */
  focused?: boolean;

  /**
   * Window's visibility
   */
  visible?: boolean;

  /**
   * Whether the window is resizable
   */
  resizable?: boolean;

  /**
   * Whether event loop should exit when window is closed.
   * Defaults to true.
   * Only works for non-child windows.
   */
  autoExitEventLoop?: boolean;

  glVersion?: [number, number];
  gles?: boolean;
  vsync?: boolean;
  noClientAPI?: boolean;
}

export type CursorIcon =
  | "arrow"
  | "ibeam"
  | "crosshair"
  | "hand"
  | "hresize"
  | "vresize";

/**
 * Represents a Window
 */
export abstract class DwmWindow {
  /**
   * Window's unique identifier
   */
  id = crypto.randomUUID();

  /**
   * The window's pointer
   */
  abstract readonly nativeHandle: Deno.PointerValue;

  /**
   * Title of the window
   */
  abstract title: string;

  /**
   * Window's position
   */
  abstract position: Position;

  /**
   * Window's size
   */
  abstract size: Size;

  abstract readonly framebufferSize: Size;

  /**
   * Change whether the window is maximized
   */
  abstract maximized: boolean;

  /**
   * Change whether the window is minimized
   */
  abstract minimized: boolean;

  /**
   * Check if the window is fullscreen
   */
  abstract fullScreen: boolean;

  /**
   * Check if the window is focused
   */
  abstract focused: boolean;

  /**
   * Change whether the window is visible
   */
  abstract visible: boolean;

  abstract opacity: number;

  abstract readonly shouldClose: boolean;

  constructor(_options: CreateWindowOptions) {}

  /**
   * Close the window
   */
  abstract close(): void;

  abstract swapBuffers(): void;

  abstract makeContextCurrent(): void;

  abstract requestUserAttention(): void;

  abstract setCursor(icon?: CursorIcon): void;

  /**
   * Check if the window is closed
   */
  abstract readonly closed: boolean;
}
