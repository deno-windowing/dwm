import { CreateWindowOptions, DwmWindow } from "./window.ts";

export interface Platform {
  readonly Window: {
    new (options: CreateWindowOptions): DwmWindow;
  } & typeof DwmWindow;

  pollEvents(wait?: boolean): void;

  getProcAddress(name: string): Deno.PointerValue;

  mainloop(cb?: (hrtime: number) => unknown, loop?: boolean, wait?: boolean): Promise<never>;
}
