import type { DwmWindow } from "./window.ts";

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

  match(window: DwmWindow): boolean {
    return window.id === this.window.id;
  }
}

/**
 * Event triggered when a window requested to close
 */
export class WindowCloseEvent extends WindowEvent {
  constructor(public override window: DwmWindow) {
    super("close", {
      cancelable: true,
    });
  }
}

/**
 * Event triggered when a window is closed
 */
export class WindowClosedEvent extends WindowEvent {
  constructor(public override window: DwmWindow) {
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
    public override window: DwmWindow,
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
    public override window: DwmWindow,
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
    public override window: DwmWindow,
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
  constructor(public override window: DwmWindow) {
    super("refresh");
  }
}

/**
 * Event triggered when a window is focused
 */
export class WindowFocusEvent extends WindowEvent {
  constructor(public override window: DwmWindow, public focused: boolean) {
    super("focus");
  }
}

/**
 * Event triggered when a window is minimized
 */
export class WindowMinimizeEvent extends WindowEvent {
  constructor(public override window: DwmWindow, public minimized: boolean) {
    super("minimize");
  }
}

/**
 * Event triggered when a window is maximized
 */
export class WindowMaximizeEvent extends WindowEvent {
  constructor(public override window: DwmWindow, public maximized: boolean) {
    super("maximize");
  }
}

/**
 * Event triggered when a window requests a redraw event
 */
export class WindowRedrawRequestedEvent extends WindowEvent {
  constructor(public override window: DwmWindow) {
    super("redrawRequested");
  }
}

/**
 * Event triggered when a Key state is changed
 */
export class WindowKeyboardEvent extends WindowEvent {
  constructor(
    name: string,
    public override window: DwmWindow,
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
    public override window: DwmWindow,
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

  get x(): number {
    return this.clientX;
  }

  get y(): number {
    return this.clientY;
  }

  get pageX(): number {
    return this.clientX;
  }

  get pageY(): number {
    return this.clientY;
  }
}

/**
 * Event triggered when a window receives input
 */
export class WindowInputEvent extends WindowEvent {
  constructor(
    public override window: DwmWindow,
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
    public override window: DwmWindow,
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
    public override window: DwmWindow,
    public files: string[],
  ) {
    super("drop");
  }
}

export type AnimationFrameCallback = (time: number) => unknown;
export const animationFrames: Map<number, AnimationFrameCallback> = new Map<
  number,
  AnimationFrameCallback
>();

let animationFrameId = 0;

export function _requestAnimationFrameImpl(
  callback: AnimationFrameCallback,
): number {
  animationFrameId++;
  animationFrames.set(animationFrameId, callback);
  return animationFrameId;
}

export function _cancelAnimationFrameImpl(id: number) {
  animationFrames.delete(id);
}

Object.assign(globalThis, {
  requestAnimationFrame: _requestAnimationFrameImpl,
  cancelAnimationFrame: _cancelAnimationFrameImpl,
});
