import { CreateWindowOptions, DwmWindow } from "./window.ts";

export interface Platform {
  /**
   * Platform's window class
   */
  readonly Window: {
    new (options: CreateWindowOptions): DwmWindow;
  } & typeof DwmWindow;

  /**
   * Method to poll the events
   */
  pollEvents(): void;

  /**
   * Gets the address of the given process
   * @param name process name
   */
  getProcAddress(name: string): Deno.PointerValue;

  /**
   * Method to give the main event loop a callback function
   * @param cb callback function to run in the main loop
   * @param loop whether to loop the callback function
   */
  mainloop(cb?: (hrtime: number) => unknown, loop?: boolean): Promise<never>;
}
