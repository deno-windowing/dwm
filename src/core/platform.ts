import type { DwmMonitor } from "./monitor.ts";
import type { CreateWindowOptions, DwmWindow } from "./window.ts";

export interface Platform {
  /**
   * Platform's window class
   */
  readonly Window: {
    new (options: CreateWindowOptions): DwmWindow;
  } & typeof DwmWindow;

  /**
   * Platform's monitor class
   */
  readonly Monitor: typeof DwmMonitor;

  /**
   * Gets list of monitors.
   */
  getMonitors(): DwmMonitor[];

  /**
   * Gets primary monitor.
   */
  getPrimaryMonitor(): DwmMonitor;

  /**
   * Poll events.
   *
   * @param wait Whether to wait for a new event before returning. More suitable for UI applications which don't need to render continuously.
   */
  pollEvents(wait?: boolean): void;

  /**
   * Gets the address of the given process
   * @param name process name
   */
  getProcAddress(name: string): Deno.PointerValue;

  /**
   * Starts the main loop. Never returns. Program's lifecycle is then managed by this.
   * Once the function has to return (i.e. the UI event loop has stopped), it will exit the process.
   *
   * It handles polling events by itself. If you want to make manual program loop,
   * use `pollEvents` instead.
   *
   * Loop parameter specifies whether the loop should be blocking or not.
   * Blocking loop is fast, but it will block any async operations happening outside the given
   * callback function. It is recommended to use loop: true (which is default) because it is
   * faster and suitable for most use cases.
   *
   * Wait option specifies whether the loop should wait for a new event before returning control
   * to the callback function. It is recommended to use wait: false (default) for applications
   * like games which render continuously. However wait: true is suitable for interactive UI applications
   * which don't need to render continuously. It also reduces CPU usage.
   */
  mainloop(
    cb?: (hrtime: number) => unknown,
    loop?: boolean,
    wait?: boolean,
  ): Promise<never>;

  /**
   * Whether Vulkan API is supported.
   */
  vulkanSupported(): boolean;

  /**
   * Gets the required instance extensions for Vulkan.
   */
  getRequiredInstanceExtensions(): string[];

  /**
   * Gets the address of the given instance function.
   */
  getInstanceProcAddress(
    instance: Deno.PointerValue,
    name: string,
  ): Deno.PointerValue;

  /**
   * Gets whether the physical device supports presentation.
   */
  getPhysicalDevicePresentationSupport(
    instance: Deno.PointerValue,
    device: Deno.PointerValue,
    queueFamily: number,
  ): boolean;
}
