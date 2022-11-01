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

declare global {
  interface WindowEventMap {
    windowClose: WindowCloseEvent;
    windowResize: WindowResizeEvent;
  }
}
