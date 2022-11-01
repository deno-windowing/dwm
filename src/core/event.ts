import { DwmWindow } from "./window.ts";

export class WindowCloseEvent extends Event {
  constructor(public window: DwmWindow) {
    super("windowClose", {
      cancelable: true,
    });
  }
}

export class WindowResizeEvent extends Event {
  constructor(
    public window: DwmWindow,
    public width: number,
    public height: number,
  ) {
    super("windowResize");
  }
}

export class WindowRedrawRequestedEvent extends Event {
  constructor(public window: DwmWindow) {
    super("windowRedrawRequested");
  }
}

export class WindowKeyboardEvent extends Event {
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
    super(name);
  }
}

declare global {
  interface WindowEventMap {
    windowClose: WindowCloseEvent;
    windowResize: WindowResizeEvent;
    windowRedrawRequested: WindowRedrawRequestedEvent;
    windowKeyDown: WindowKeyboardEvent;
    windowKeyUp: WindowKeyboardEvent;
  }
}
