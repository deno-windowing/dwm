import type {
  CreateWindowOptions,
  DwmWindow,
  WindowClosedEvent,
  WindowFramebufferSizeEvent,
  WindowRefreshEvent,
} from "../mod.ts";

interface DWMGPUCanvasConfiguration {
  format: GPUTextureFormat;
  usage?: GPUTextureUsageFlags;
  viewFormats?: GPUTextureFormat[];
  colorSpace?: "srgb" | "display-p3";
  alphaMode?: GPUCanvasAlphaMode;
}

import { createWindow } from "../mod.ts";

export class WindowGPU {
  /**
   * GPU adapter
   */
  adapter: GPUAdapter;

  /**
   * GPU device
   */
  device: GPUDevice;

  /**
   * Window instance
   */
  window: DwmWindow;

  /**
   * Window surface
   */
  surface: Deno.UnsafeWindowSurface;

  /**
   * WebGPU context
   */
  ctx: GPUCanvasContext;

  #toDraw = true;

  /**
   * Callback when context is lost
   */
  onContextLoss?: () => void;

  /**
   * Callback when drawing
   */
  onDraw?: (ctx: GPUCanvasContext) => unknown;

  #resizeNextFrame?: [number, number];

  constructor(
    options: CreateWindowOptions = {},
    adapter: GPUAdapter,
    device: GPUDevice,
  ) {
    this.window = createWindow(Object.assign({
      glVersion: [3, 3],
    }, options));
    const { width, height } = this.window.framebufferSize;
    this.adapter = adapter;
    this.device = device;
    this.surface = this.window.windowSurface();
    this.ctx = this.surface.getContext("webgpu");

    const onFramebuffersize = (evt: WindowFramebufferSizeEvent) => {
      if (!evt.match(this.window)) return;
      if (evt.width === 0 || evt.height === 0) {
        this.#toDraw = false;
        return;
      }
      this.#resizeNextFrame = [evt.width, evt.height];
    };

    const onClosed = (evt: WindowClosedEvent) => {
      if (!evt.match(this.window)) return;
      // deno-lint-ignore no-explicit-any
      removeEventListener("framebuffersize" as any, onFramebuffersize);
      // deno-lint-ignore no-explicit-any
      removeEventListener("closed" as any, onClosed);
      this.#toDraw = false;
    };

    // deno-lint-ignore no-explicit-any
    addEventListener("framebuffersize" as any, onFramebuffersize);
    // deno-lint-ignore no-explicit-any
    addEventListener("closed" as any, onClosed);
  }

  /**
   * Get the webgpu context
   */
  getContext(contextId: "webgpu") {
    return this.ctx;
  }

  #resize(width: number, height: number) {
    this.onContextLoss?.();
    this.#toDraw = true;
  }

  /**
   * Make the context current
   */
  makeContextCurrent() {
    this.window.makeContextCurrent();
  }

  /**
   * Flush the context
   */
  flush() {
    if (!this.#toDraw) return;
    this.window.swapBuffers();
  }

  /**
   * Draw the context
   */
  async draw() {
    if (!this.#toDraw) return;
    // this.makeContextCurrent();
    if (this.#resizeNextFrame) {
      const [width, height] = this.#resizeNextFrame;
      this.#resizeNextFrame = undefined;
      this.#resize(width, height);
    }
    await this.onDraw?.(this.ctx);
    this.flush();
  }
}

export async function createWindowGPU(
  options: CreateWindowOptions,
) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No GPU adapter found");
  const device = await adapter!.requestDevice();
  const window = new WindowGPU(options, adapter, device);
  return window;
}

export * from "../mod.ts";
