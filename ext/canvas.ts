import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
} from "https://deno.land/x/skia_canvas@0.5.1/mod.ts";

import {
  createWindow,
  CreateWindowOptions,
  DwmWindow,
  WindowClosedEvent,
  WindowFramebufferSizeEvent,
  WindowRefreshEvent,
} from "../mod.ts";

export class WindowCanvas {
  canvas: Canvas;
  window: DwmWindow;
  ctx: CanvasRenderingContext2D;

  #toDraw = true;

  onContextLoss?: () => void;
  onDraw?: (ctx: CanvasRenderingContext2D) => unknown;

  #resizeNextFrame?: [number, number];

  constructor(options: CreateWindowOptions = {}) {
    this.window = createWindow(Object.assign({
      glVersion: [3, 3],
    }, options));
    const { width, height } = this.window.framebufferSize;
    this.canvas = createCanvas(width, height, true);
    this.ctx = this.canvas.getContext("2d");

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

export * from "../mod.ts";
// deno-lint-ignore ban-ts-comment
// @ts-expect-error
export * from "https://deno.land/x/skia_canvas@0.5.1/mod.ts";
