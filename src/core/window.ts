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
   * Window's x coordinate
   */
  x?: number;

  /**
   * Window's y coordinate
   */
  y?: number;

  /**
   * Whether the window is maximized
   */
  maximized?: boolean;

  /**
   * Whether the window is minimized
   */
  minimized?: boolean;

  /**
   * Whether the window is fullscreen
   */
  fullScreen?: boolean;

  /**
   * Whether the window is focused
   */
  focused?: boolean;

  /**
   * Whether the window should stay on top
   */
  alwaysOnTop?: boolean;

  /**
   * Window's visibility
   */
  visible?: boolean;

  /**
   * Whether the window is resizable
   */
  resizable?: boolean;

  /**
   * Whether the window is a child of another window
   */
  parent?: DwmWindow;

  /**
   * Whether to add a scrollBar specify "horizonal" for a horizontal scrollbar.
   * will default to vertical if "vertical" specified or value is true
   */
  scrollBar?: boolean | "horizontal" | "vertical";

  /**
   * Whether the window is disabled
   */
  disabled?: boolean;

  /**
   * Whether the window accepts files
   */
  acceptFiles?: boolean;

  /**
   * Whether the window is a toolbar window
   */
  toolbar?: boolean;

  /**
   * Whether the window is palette
   */
  palette?: boolean;

  /**
   * whether to remove the system menu
   */
  removeSystemMenu?: boolean;
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

  constructor(_options: CreateWindowOptions) {}

  /**
   * Close the window
   */
  abstract close(): void;

  /**
   * Requests a redraw
   */
  abstract requestRedraw(): void;

  /**
   * Check if the window is closed
   */
  abstract readonly closed: boolean;
}
