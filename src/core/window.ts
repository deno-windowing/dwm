import { Position, Size } from "./common.ts";

export interface CreateWindowOptions {
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  maximized?: boolean;
  minimized?: boolean;
  fullScreen?: boolean;
  focused?: boolean;
  alwaysOnTop?: boolean;
  visible?: boolean;
  resizable?: boolean;
  parent?: DwmWindow;
  scrollBar?: boolean | "horizontal" | "vertical";
  disabled?: boolean;
  acceptFiles?: boolean;
  toolbar?: boolean;
  pallette?: boolean;
}

export abstract class DwmWindow {
  id = crypto.randomUUID();
  abstract readonly nativeHandle: Deno.PointerValue;

  abstract title: string;
  abstract position: Position;
  abstract size: Size;
  abstract maximized: boolean;
  abstract minimized: boolean;
  abstract fullScreen: boolean;
  abstract focused: boolean;
  abstract visible: boolean;

  constructor(_options: CreateWindowOptions) {}

  abstract close(): void;
  abstract readonly closed: boolean;
}
