import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
} from "https://deno.land/x/skia_canvas@0.3.1/mod.ts";
import {
  createWindow,
  CreateWindowOptions,
  DwmWindow,
  WindowClosedEvent,
  WindowFramebufferSizeEvent,
} from "../mod.ts";

export class WindowCanvas {
  canvas: Canvas;
  window: DwmWindow;
  ctx: CanvasRenderingContext2D;

  #toDraw = true;

  onContextLoss?: () => void;

  constructor(options: CreateWindowOptions = {}) {
    this.window = createWindow(options);
    const { width, height } = this.window.framebufferSize;
    this.canvas = createCanvas(width, height, true);
    this.ctx = this.canvas.getContext("2d");

    const onFramebuffersize = (evt: WindowFramebufferSizeEvent) => {
      if (!evt.match(this.window)) return;
      if (evt.width === 0 || evt.height === 0) {
        this.#toDraw = false;
        return;
      }
      this.#resize(evt.width, evt.height);
    };

    const onClosed = (evt: WindowClosedEvent) => {
      if (!evt.match(this.window)) return;
      removeEventListener("framebuffersize", onFramebuffersize);
      removeEventListener("closed", onClosed);
      this.#toDraw = false;
    };

    addEventListener("framebuffersize", onFramebuffersize);
    addEventListener("closed", onClosed);
  }

  #resize(width: number, height: number) {
    this.canvas.resize(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.onContextLoss?.();
    this.#toDraw = true;
  }

  makeContextCurrent() {
    this.window.makeContextCurrent();
  }

  flush() {
    if (!this.#toDraw) return;
    this.canvas.flush();
    this.window.swapBuffers();
  }
}

export * from "../mod.ts";
export * from "https://deno.land/x/skia_canvas@0.3.1/mod.ts";
