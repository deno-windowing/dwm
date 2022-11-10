import { DwmWindow } from "./window.ts";

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

export class WindowEvent extends Event {
  loop = EventLoop;
}

/**
 * Event triggered when a window is closed
 */
export class WindowCloseEvent extends WindowEvent {
  constructor(public window: DwmWindow) {
    super("close", {
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
    return this.x;
  }

  get pageY() {
    return this.y;
  }
}

export type AnimationFrameCallback = (time: number) => void;
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
  }
}
