import { Position, Size } from "./common.ts";

export interface CreateWindowOptions {
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  maximized?: boolean;
  mnimized?: boolean;
  fullScreen?: boolean;
  focused?: boolean;
  alwaysOnTop?: boolean;
  visible?: boolean;
  parent?: DwmWindow;
}

export abstract class DwmWindow {
  abstract readonly nativeHandle: Deno.PointerValue;

  abstract title: string;
  abstract position: Position;
  abstract size: Size;
  abstract maximized: boolean;
  abstract mnimized: boolean;
  abstract fullScreen: boolean;
  abstract focused: boolean;
  abstract alwaysOnTop: boolean;
  abstract visible: boolean;

  constructor(_options: CreateWindowOptions) {}

  abstract close(): void;
  abstract readonly closed: boolean;
}
