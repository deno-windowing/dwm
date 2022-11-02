import { Size } from "../../core/common.ts";
import { CreateWindowOptions, DwmWindow } from "../../core/window.ts";
import { decodeString } from "../../utils.ts";
import { unwrap, Wm } from "./deps.ts";
import { lpfnWndProc, windows } from "./event.ts";

if (Deno.build.os === "windows") {
  const cls = Wm.allocWNDCLASSA({
    lpszClassName: "DwmWindow",
    style: Wm.CS_OWNDC | Wm.CS_DBLCLKS | Wm.CS_HREDRAW | Wm.CS_VREDRAW,
    lpfnWndProc: lpfnWndProc.pointer,
    hCursor: Wm.LoadCursorA(
      null,
      new Uint8Array(Deno.UnsafePointerView.getArrayBuffer(32512, 0)),
    ),
  });
  unwrap(Wm.RegisterClassA(cls));
}

const out = new Uint8Array(256);
const outRect = Wm.allocRECT();
const rectI32 = new Int32Array(outRect.buffer);

export class WindowWin32 extends DwmWindow {
  #nativeHandle: Deno.PointerValue;
  #closed = false;
  // deno-lint-ignore no-explicit-any
  _inputState: any = {};

  get nativeHandle() {
    return this.#nativeHandle;
  }

  constructor(options: CreateWindowOptions) {
    super(options);
    let style = Wm.WS_CAPTION | Wm.WS_MINIMIZEBOX | Wm.WS_BORDER |
      Wm.WS_CLIPSIBLINGS | Wm.WS_CLIPCHILDREN | Wm.WS_SYSMENU;
    let exStyle = Wm.WS_EX_WINDOWEDGE | Wm.WS_EX_ACCEPTFILES;
    if (options.resizable) {
      style |= Wm.WS_MAXIMIZEBOX | Wm.WS_SIZEBOX;
    }
    if (options.visible !== false) {
      style |= Wm.WS_VISIBLE;
    }
    if (options.maximized) {
      style |= Wm.WS_MAXIMIZE;
    }
    if (options.minimized) {
      style |= Wm.WS_MINIMIZE;
    }
    if (options.scrollBar) {
      style |= options.scrollBar == "horizontal"
        ? Wm.WS_HSCROLL
        : Wm.WS_VSCROLL;
    }
    if (options.disabled) {
      style |= Wm.WS_DISABLED;
    }
    if (options.fullScreen) {
      style |= Wm.WS_POPUP;
      exStyle |= Wm.WS_EX_TOPMOST;
    }
    if (options.alwaysOnTop) {
      exStyle |= Wm.WS_EX_TOPMOST;
    }
    if (options.acceptFiles) {
      exStyle |= Wm.WS_EX_ACCEPTFILES;
    }
    if (options.toolbar) {
      exStyle |= Wm.WS_EX_TOOLWINDOW;
    }
    if (options.pallette) {
      exStyle |= Wm.WS_EX_PALETTEWINDOW;
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

  close(): void {
    unwrap(Wm.DestroyWindow(this.#nativeHandle));
    this.#closed = true;
  }

  get title(): string {
    const len = Wm.GetWindowTextA(this.#nativeHandle, out, out.length);
    return decodeString(out.subarray(0, len));
  }

  set title(value: string) {
    Wm.SetWindowTextA(this.#nativeHandle, value);
  }

  get size() {
    Wm.GetWindowRect(this.#nativeHandle, outRect);
    return {
      width: rectI32[2] - rectI32[0],
      height: rectI32[3] - rectI32[1],
    };
  }

  set size(value: Size) {
    Wm.SetWindowPos(
      this.#nativeHandle,
      null,
      0,
      0,
      value.width,
      value.height,
      Wm.SWP_NOZORDER | Wm.SWP_NOMOVE,
    );
  }

  get position() {
    return {
      x: rectI32[0],
      y: rectI32[1],
    };
  }

  set position(value: { x: number; y: number }) {
    Wm.SetWindowPos(
      this.#nativeHandle,
      null,
      value.x,
      value.y,
      0,
      0,
      Wm.SWP_NOZORDER | Wm.SWP_NOSIZE,
    );
  }

  get maximized(): boolean {
    return Wm.IsZoomed(this.#nativeHandle);
  }

  set maximized(value: boolean) {
    Wm.ShowWindow(this.#nativeHandle, value ? Wm.SW_MAXIMIZE : Wm.SW_RESTORE);
  }

  get minimized(): boolean {
    return Wm.IsIconic(this.#nativeHandle);
  }

  set minimized(value: boolean) {
    Wm.ShowWindow(this.#nativeHandle, value ? Wm.SW_MINIMIZE : Wm.SW_RESTORE);
  }

  get fullScreen(): boolean {
    return false;
  }

  get focused(): boolean {
    return Wm.GetForegroundWindow() === this.#nativeHandle;
  }

  get visible(): boolean {
    return Wm.IsWindowVisible(this.#nativeHandle);
  }

  set visible(value: boolean) {
    Wm.ShowWindow(this.#nativeHandle, value ? Wm.SW_SHOW : Wm.SW_HIDE);
  }

  get parent() {
    return Wm.GetParent(this.#nativeHandle);
  }

  get closed(): boolean {
    return this.#closed;
  }
}
