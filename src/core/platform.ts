import { CreateWindowOptions, DwmWindow } from "./window.ts";

export interface Platform {
  /**
   * Platform's window class
   */
  readonly Window: {
    new (options: CreateWindowOptions): DwmWindow;
  } & typeof DwmWindow;

  pollEvents(wait?: boolean): void;

  /**
   * Gets the address of the given process
   * @param name process name
   */
  getProcAddress(name: string): Deno.PointerValue;

  mainloop(
    cb?: (hrtime: number) => unknown,
    loop?: boolean,
    wait?: boolean,
  ): Promise<never>;
}
