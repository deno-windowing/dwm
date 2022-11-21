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

  /**
   * Which GL version to use
   */
  glVersion?: [number, number];

  /**
   * Should GLES be used
   */
  gles?: boolean;

  /**
   * Whether to limit the number of fps
   */
  vsync?: boolean;

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
   * Whether the window should close
   */
  abstract readonly shouldClose: boolean;

  constructor(_options: CreateWindowOptions) {}

  /**
   * Close the window
   */
  abstract close(): void;

  /**
   * Swaps the window's buffers
   */
  abstract swapBuffers(): void;

  /**
   * Sets this window's context as the current context
   */
  abstract makeContextCurrent(): void;

  /**
   * Requests the User's attention
   */
  abstract requestUserAttention(): void;

  /**
   * Check if the window is closed
   */
  abstract readonly closed: boolean;
}
