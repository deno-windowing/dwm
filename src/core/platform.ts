import { CreateWindowOptions, DwmWindow } from "./window.ts";

export interface Platform {
  readonly Window: {
    new (options: CreateWindowOptions): DwmWindow;
  } & typeof DwmWindow;

  pollEvents(): void;
}
