import { CreateWindowOptions, DwmWindow } from "../../core/window.ts";
import { unwrap, Wm } from "./deps.ts";
import { lpfnWndProc, windows } from "./event.ts";

if (Deno.build.os === "windows") {
  const cls = Wm.allocWNDCLASSA({
    lpszClassName: "DwmWindow",
    style: Wm.CS_OWNDC,
    lpfnWndProc: lpfnWndProc.pointer,
  });
  unwrap(Wm.RegisterClassA(cls));
}

const out = new Uint8Array(256);

export class WindowWin32 extends DwmWindow {
  #nativeHandle: Deno.PointerValue;

  get nativeHandle() {
    return this.#nativeHandle;
  }

  constructor(options: CreateWindowOptions) {
    super(options);
    let style = Wm.WS_OVERLAPPEDWINDOW;
    let exStyle = Wm.WS_EX_OVERLAPPEDWINDOW;
    if (options.maximized) {
      style |= Wm.WS_MAXIMIZE;
    }
    if (options.fullScreen) {
      style |= Wm.WS_POPUP;
      exStyle |= Wm.WS_EX_TOPMOST;
    }
    if (options.alwaysOnTop) {
      exStyle |= Wm.WS_EX_TOPMOST;
    }
    const hWnd = Wm.CreateWindowExA(
      exStyle,
      "DwmWindow",
      options.title ?? "DwmWindow",
      style,
      options.x ?? 0,
      options.y ?? 0,
      options.width ?? 800,
      options.height ?? 600,
      options.parent?.nativeHandle ?? null,
      null,
      null,
      null,
    );

    if (hWnd === null) {
      unwrap(false);
    }
    this.#nativeHandle = hWnd!;

    if (options.visible !== false) {
      Wm.ShowWindow(this.#nativeHandle, Wm.SW_SHOW);
    }

    windows.set(this.#nativeHandle, this);
  }

  get title(): string {
    const len = Wm.GetWindowTextA(this.#nativeHandle, out, out.length);
    return new TextDecoder().decode(out.subarray(0, len));
  }

  set title(value: string) {
    Wm.SetWindowTextA(this.#nativeHandle, value);
  }

  get size() {
    return {
      width: 0,
      height: 0,
    };
  }

  get position() {
    return {
      x: 0,
      y: 0,
    };
  }

  get maximized(): boolean {
    return Wm.IsZoomed(this.#nativeHandle);
  }

  set maximized(value: boolean) {
    if (value) {
      Wm.ShowWindow(this.#nativeHandle, Wm.SW_MAXIMIZE);
    } else {
      Wm.ShowWindow(this.#nativeHandle, Wm.SW_RESTORE);
    }
  }

  get mnimized(): boolean {
    return Wm.IsIconic(this.#nativeHandle);
  }

  set mnimized(value: boolean) {
    if (value) {
      Wm.ShowWindow(this.#nativeHandle, Wm.SW_MINIMIZE);
    } else {
      Wm.ShowWindow(this.#nativeHandle, Wm.SW_RESTORE);
    }
  }

  get fullScreen(): boolean {
    return false;
  }

  get focused(): boolean {
    return Wm.GetForegroundWindow() === this.#nativeHandle;
  }

  get alwaysOnTop(): boolean {
    return false;
  }

  get visible(): boolean {
    return Wm.IsWindowVisible(this.#nativeHandle);
  }

  set visible(value: boolean) {
    if (value) {
      Wm.ShowWindow(this.#nativeHandle, Wm.SW_SHOW);
    } else {
      Wm.ShowWindow(this.#nativeHandle, Wm.SW_HIDE);
    }
  }

  #closed = false;

  close(): void {
    unwrap(Wm.DestroyWindow(this.#nativeHandle));
    this.#closed = true;
  }

  get closed(): boolean {
    return this.#closed;
  }
}
