import { ImageStruct, LTRB, Position, Size } from "./common.ts";
import { RawPlatform } from "./mod.ts";
import { DwmMonitor } from "./monitor.ts";

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

  /**
   * Which GL version to use
   */
  glVersion?: [number, number] | string;

  /**
   * Should GLES be used (only for OpenGL)
   */
  gles?: boolean;

  /**
   * Whether to limit the number of frames per second (only for OpenGL)
   */
  vsync?: boolean;

  /**
   * Whether to not use any Client API.
   */
  noClientAPI?: boolean;

  /**
   * Remove decorations from the window (title, frame, etc)
   */
  removeDecorations?: boolean;

  /**
   * Whether the window should be transparent
   */
  transparent?: boolean;

  /**
   * Whether the window is a floating window/ topmost window
   */
  floating?: boolean;
}

export type CursorIcon =
  | "arrow"
  | "ibeam"
  | "crosshair"
  | "hand"
  | "hresize"
  | "vresize";

export type InputMode =
  | "cursor"
  | "cursorDisabled"
  | "cursorHidden"
  | "stickyKeys"
  | "stickyMouseButtons"
  | "lockKeyMods"
  | "rawMouseMotion";

export type InputModeValue = "normal" | "hidden" | "disabled";

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

  /**
   * Frame size
   */
  abstract readonly frameSize: LTRB;

  /**
   * Window's framebuffer size
   */
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

  /**
   * Opacity of the window
   */
  abstract opacity: number;

  /**
   * Window's content scale
   */
  abstract readonly contentScale: Position;

  /**
   * Whether the window should close
   */
  abstract readonly shouldClose: boolean;

  constructor(_options: CreateWindowOptions) {}

  /**
   * Close the window
   */
  abstract close(): void;

  /**
   * Swaps the window's buffers (Only for OpenGL)
   */
  abstract swapBuffers(): void;

  /**
   * Sets this window's context as the current context (Only for OpenGL)
   */
  abstract makeContextCurrent(): void;

  /**
   * Requests the User's attention
   */
  abstract requestUserAttention(): void;

  /**
   * Sets the cursor icon
   * ```ts
   * win.setCursor("hand");
   * ```
   */
  abstract setCursor(icon?: CursorIcon): void;

  /**
   * Create a VkSurfaceKHR for this window (Only for Vulkan)
   */
  abstract createSurface(
    instance: Deno.PointerValue,
    allocator?: Deno.PointerValue,
  ): Deno.PointerValue;

  /**
   * Get the monitor that the window is on (undefined if not fullscreen)
   */
  abstract getMonitor(): DwmMonitor | undefined;

  /**
   * Set the monitor that the window is on
   */
  abstract setMonitor(
    monitor: DwmMonitor | undefined,
    xpos?: number,
    ypos?: number,
    width?: number,
    height?: number,
    refreshRate?: number,
  ): void;

  /**
   * Set the window's aspect ratio
   */
  abstract setAspectRatio(numerator: number, denominator: number): void;

  /**
   * Set the window's size limits
   */
  abstract setSizeLimits(
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): void;

  /**
   * Set the window's input mode
   */
  abstract setInputMode(mode: InputMode, value: InputModeValue | boolean): void;

  /**
   * Get the window's input mode
   */
  abstract getInputMode(mode: InputMode): InputModeValue;

  /**
   * Check if the window has raw mouse motion
   */
  abstract rawMouseMotionSupported(): boolean;

  /**
   * Sets the cursor to a specific position
   */
  abstract setCursorPos(xpos: number, ypos: number): void;

  /**
   * Sets the cursor to a custom image
   * ```ts
   * const cursor = new Uint8Array(16 * 16 * 4);
   * for (let i = 0; i < 16; i++) {
   *   cursor[i * 16 * 4 + i * 4 + 3] = 255;
   *   cursor[i * 16 * 4 + (15 - i) * 4 + 3] = 255;
   * }
   *
   * win.setCustomCursor(cursor, {
   *   width: 16,
   *   height: 16,
   * }, {
   *   x: 0,
   *   y: 0,
   * });
   * ```
   */
  abstract setCustomCursor(
    image: Uint8Array,
    hotspot: Size,
    position: Position,
  ): void;

  /**
   * Sets the window icon to a custom icon
   * ```ts
   * import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";
   *
   * win.setIcon(decode(await Deno.readFile("./path/to/icon/icon.png")));
   * ```
   */
  abstract setIcon(
    image: Uint8Array,
    sizes: Size,
  ): void;
  abstract setIcon(
    image: ImageStruct,
  ): void;

  /**
   * Retrieves the window and display/instance handles required for WebGPU
   * ```ts
   * const [window, display, instance] = win.rawHandle();
   * ```
   */
  abstract rawHandle(): [
    RawPlatform,
    Deno.UnsafePointerView,
    Deno.UnsafePointerView | null,
  ];

  /**
   * Creates a Window Surface for Use with WebGPU
   * ```ts
   * const surface = win.createWindowSurface();
   * const context = surface.getContext("webgpu");
   * ```
   */
  abstract createWindowSurface(): Deno.UnsafeWindowSurface;
  /**
   * Check if the window is closed
   */
  abstract readonly closed: boolean;
}
