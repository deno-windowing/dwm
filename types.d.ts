import type {
  AnimationFrameCallback,
  WindowClosedEvent,
  WindowCloseEvent,
  WindowDropEvent,
  WindowFocusEvent,
  WindowFramebufferSizeEvent,
  WindowInputEvent,
  WindowKeyboardEvent,
  WindowMaximizeEvent,
  WindowMinimizeEvent,
  WindowMouseEvent,
  WindowMoveEvent,
  WindowRedrawRequestedEvent,
  WindowRefreshEvent,
  WindowResizeEvent,
  WindowScrollEvent,
} from "./mod.ts";

declare global {
  /** Framebuffer height of active window */
  // deno-lint-ignore no-var
  var innerHeight: number;
  /** Framebuffer width of active window */
  // deno-lint-ignore no-var
  var innerWidth: number;
  // deno-lint-ignore no-var
  var devicePixelRatio: number;

  function requestAnimationFrame(callback: AnimationFrameCallback): number;
  function cancelAnimationFrame(id: number): void;

  interface WindowEventMap {
    close: WindowCloseEvent;
    closed: WindowClosedEvent;
    resize: WindowResizeEvent;
    redrawRequested: WindowRedrawRequestedEvent;
    keydown: WindowKeyboardEvent;
    keyup: WindowKeyboardEvent;
    mousedown: WindowMouseEvent;
    mouseup: WindowMouseEvent;
    mousemove: WindowMouseEvent;
    pointerdown: WindowMouseEvent;
    pointerup: WindowMouseEvent;
    pointermove: WindowMouseEvent;
    mouseenter: WindowMouseEvent;
    mouseleave: WindowMouseEvent;
    click: WindowMouseEvent;
    dblclick: WindowMouseEvent;
    contextmenu: WindowMouseEvent;
    move: WindowMoveEvent;
    refresh: WindowRefreshEvent;
    focus: WindowFocusEvent;
    minimize: WindowMinimizeEvent;
    maximize: WindowMaximizeEvent;
    input: WindowInputEvent;
    framebuffersize: WindowFramebufferSizeEvent;
    scroll: WindowScrollEvent;
    drop: WindowDropEvent;
  }
}
