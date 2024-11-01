/// <reference types="../types.d.ts" />
import type { Canvas, CanvasRenderingContext2D } from "jsr:@gfx/canvas@0.5.8";
import { createCanvas } from "jsr:@gfx/canvas@0.5.8";

import type {
  CreateWindowOptions,
  DwmWindow,
  WindowClosedEvent,
  WindowFramebufferSizeEvent,
  WindowRefreshEvent,
} from "../mod.ts";

import { createWindow } from "../mod.ts";

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
export * from "jsr:@gfx/canvas@0.5.8";
