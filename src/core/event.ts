import { DwmWindow } from "./window.ts";

/**
 * Event Loop class
 */
export class EventLoop {
  static running = true;

  static exit() {
    if (EventLoop.running) {
      EventLoop.running = false;
      dispatchEvent(new Event("unload"));
      Deno.exit(0);
    }
  }
}

/**
 * Base window event class
 */
export class WindowEvent extends Event {
  loop = EventLoop;

  declare window: DwmWindow;

  match(window: DwmWindow) {
    return window.id === this.window.id;
  }
}

/**
 * Event triggered when a window requested to close
 */
export class WindowCloseEvent extends WindowEvent {
  constructor(public window: DwmWindow) {
    super("close", {
      cancelable: true,
    });
  }
}

/**
 * Event triggered when a window is closed
 */
export class WindowClosedEvent extends WindowEvent {
  constructor(public window: DwmWindow) {
    super("closed", {
      cancelable: true,
    });
  }
}

/**
 * Event triggered when a window is resized
 */
export class WindowResizeEvent extends WindowEvent {
  constructor(
    public window: DwmWindow,
    public width: number,
    public height: number,
  ) {
    super("resize");
  }
}

/**
 * Event triggered when a window's framebuffersize is changed
 */
export class WindowFramebufferSizeEvent extends WindowEvent {
  constructor(
    public window: DwmWindow,
    public width: number,
    public height: number,
  ) {
    super("framebuffersize");
  }
}

/**
 * Event triggered when a window is moved
 */
export class WindowMoveEvent extends WindowEvent {
  constructor(
    public window: DwmWindow,
    public x: number,
    public y: number,
  ) {
    super("move");
  }
}

/**
 * Event triggered when a window is refreshed
 */
export class WindowRefreshEvent extends WindowEvent {
  constructor(public window: DwmWindow) {
    super("refresh");
  }
}

/**
 * Event triggered when a window is focused
 */
export class WindowFocusEvent extends WindowEvent {
  constructor(public window: DwmWindow, public focused: boolean) {
    super("focus");
  }
}

/**
 * Event triggered when a window is minimized
 */
export class WindowMinimizeEvent extends WindowEvent {
  constructor(public window: DwmWindow, public minimized: boolean) {
    super("minimize");
  }
}

/**
 * Event triggered when a window is maximized
 */
export class WindowMaximizeEvent extends WindowEvent {
  constructor(public window: DwmWindow, public maximized: boolean) {
    super("maximize");
  }
}

/**
 * Event triggered when a window requests a redraw event
 */
export class WindowRedrawRequestedEvent extends WindowEvent {
  constructor(public window: DwmWindow) {
    super("redrawRequested");
  }
}

/**
 * Event triggered when a Key state is changed
 */
export class WindowKeyboardEvent extends WindowEvent {
  constructor(
    name: string,
    public window: DwmWindow,
    public altKey: boolean,
    public code: string,
    public ctrlKey: boolean,
    public isComposing: boolean,
    public key: string,
    public location: number,
    public metaKey: boolean,
    public repeat: boolean,
    public shiftKey: boolean,
    public keyCode: number,
  ) {
    super(name, {
      cancelable: true,
    });
  }
}

/**
 * Event is triggered when mouse state changes
 */
export class WindowMouseEvent extends WindowEvent {
  offsetX = 0;
  offsetY = 0;

  constructor(
    name: string,
    public window: DwmWindow,
    public altKey: boolean,
    public button: number,
    public buttons: number,
    public clientX: number,
    public clientY: number,
    public ctrlKey: boolean,
    public metaKey: boolean,
    public movementX: number,
    public movementY: number,
    public region: number,
    public screenX: number,
    public screenY: number,
    public shiftKey: boolean,
  ) {
    super(name, {
      cancelable: true,
    });
  }

  get x() {
    return this.clientX;
  }

  get y() {
    return this.clientY;
  }

  get pageX() {
    return this.clientX;
  }

  get pageY() {
    return this.clientY;
  }
}

/**
 * Event triggered when a window receives input
 */
export class WindowInputEvent extends WindowEvent {
  constructor(
    public window: DwmWindow,
    public data: string,
  ) {
    super("input");
  }
}

/**
 * Event triggered when a window is scrolled
 */
export class WindowScrollEvent extends WindowEvent {
  constructor(
    public window: DwmWindow,
    public scrollX: number,
    public scrollY: number,
  ) {
    super("scroll");
  }
}

/**
 * Event triggered when a window is dropped
 */
export class WindowDropEvent extends WindowEvent {
  constructor(
    public window: DwmWindow,
    public files: string[],
  ) {
    super("drop");
  }
}

export type AnimationFrameCallback = (time: number) => unknown;
export const animationFrames = new Map<number, AnimationFrameCallback>();
let animationFrameId = 0;

export function requestAnimationFrameImpl(callback: AnimationFrameCallback) {
  animationFrameId++;
  animationFrames.set(animationFrameId, callback);
  return animationFrameId;
}

export function cancelAnimationFrameImpl(id: number) {
  animationFrames.delete(id);
}

Object.assign(window, {
  requestAnimationFrame: requestAnimationFrameImpl,
  cancelAnimationFrame: cancelAnimationFrameImpl,
});

declare global {
  const requestAnimationFrame: typeof requestAnimationFrameImpl;
  const cancelAnimationFrame: typeof cancelAnimationFrameImpl;

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
