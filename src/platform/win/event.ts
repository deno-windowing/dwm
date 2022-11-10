import {
  animationFrames,
  EventLoop,
  WindowCloseEvent,
  WindowKeyboardEvent,
  WindowMouseEvent,
  WindowRedrawRequestedEvent,
  WindowResizeEvent,
} from "../../core/mod.ts";
import { Wm } from "./deps.ts";
import { WindowWin32 } from "./window.ts";
import SCANCODES from "./scancode.json" assert { type: "json" };
import VKEYS from "./virtual_key.json" assert { type: "json" };

export const windows = new Map<Deno.PointerValue, WindowWin32>();

function processKeyEvent(
  name: string,
  win: WindowWin32,
  vkey: number,
  flags: number,
) {
  const repeatCount = flags & 0xffff;
  const scanCode = (flags >> 16) & 0xff;
  // const extended = (flags >> 24) & 1;
  const altDown = (flags >> 29) & 1;
  // const prevDown = (flags >> 30) & 1;
  // const transition = (flags >> 31) & 1;

  const vk = ((vkey >= 65 && vkey <= 90) || (vkey >= 48 && vkey <= 57))
    ? String.fromCharCode(vkey)
    : (VKEYS as Record<number, string>)[vkey] ?? vkey.toString();

  return dispatchEvent(
    new WindowKeyboardEvent(
      name,
      win,
      altDown === 1,
      (SCANCODES as Record<number, string>)[scanCode],
      false,
      false,
      vk,
      0,
      false,
      repeatCount > 1,
      false,
    ),
  );
}

function processMouseEvent(
  name: string,
  btn: number,
  hWnd: Deno.PointerValue,
  wParam: Deno.PointerValue,
  lParam: Deno.PointerValue,
) {
  const win = windows.get(hWnd);
  if (win) {
    if (name === "mousedown") {
      win._inputState[`mousedown_${btn}`] = true;
    }
    const x = Number(lParam) & 0xffff,
      y = Number(lParam) >> 16;

    let movementX = 0, movementY = 0;
    if (name === "mousemove") {
      const prevX = win._inputState.mouseX;
      const prevY = win._inputState.mouseY;
      movementX = x - prevX;
      movementY = y - prevY;
      win._inputState.mouseX = x;
      win._inputState.mouseY = y;
    }
    dispatchEvent(
      new WindowMouseEvent(
        name,
        win,
        false,
        btn,
        btn,
        x,
        y,
        (Number(wParam) & 0x0008) === 0x0008,
        false,
        movementX,
        movementY,
        0,
        x,
        y,
        (Number(wParam) & 0x0004) === 0x0004,
      ),
    );
    if (["mousedown", "mouseup", "mousemove"].includes(name)) {
      dispatchEvent(
        new WindowMouseEvent(
          name.replace("mouse", "pointer"),
          win,
          false,
          btn,
          btn,
          x,
          y,
          (Number(wParam) & 0x0008) === 0x0008,
          false,
          movementX,
          movementY,
          0,
          x,
          y,
          (Number(wParam) & 0x0004) === 0x0004,
        ),
      );
    }
    if (name === "mouseup") {
      if (win._inputState[`mousedown_${btn}`]) {
        dispatchEvent(
          new WindowMouseEvent(
            btn === 0 ? "click" : "contextmenu",
            win,
            false,
            btn,
            btn,
            Number(lParam) & 0xffff,
            Number(lParam) >> 16,
            (Number(wParam) & 0x0008) === 0x0008,
            false,
            0,
            0,
            0,
            Number(lParam) & 0xffff,
            Number(lParam) >> 16,
            (Number(wParam) & 0x0004) === 0x0004,
          ),
        );
        delete win._inputState[`mousedown_${btn}`];
      }
    }
  }
}

export const lpfnWndProc = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "u32", "pointer", "pointer"],
    result: "pointer",
  } as const,
  (hwnd, msg, wParam, lParam) => {
    try {
      switch (msg) {
        case Wm.WM_PAINT: {
          const now = performance.now();
          const frames = [...animationFrames.values()];
          animationFrames.clear();
          for (const frame of frames) {
            frame(now);
          }
          const window = windows.get(hwnd);
          if (window) {
            dispatchEvent(new WindowRedrawRequestedEvent(window));
          }
          return 0;
        }

        case Wm.WM_SIZE: {
          const win = windows.get(hwnd);
          if (win) {
            dispatchEvent(
              new WindowResizeEvent(
                win,
                Number(lParam) & 0xffff,
                Number(lParam) >> 16,
              ),
            );
          }
          break;
        }

        case Wm.WM_CLOSE: {
          const win = windows.get(hwnd);
          if (win) {
            if (dispatchEvent(new WindowCloseEvent(win))) {
              win.close();
            }
          }
          break;
        }

        case Wm.WM_KEYDOWN: {
          const win = windows.get(hwnd);
          if (win) {
            processKeyEvent(
              "keydown",
              win,
              Number(wParam),
              Number(lParam),
            );
          }
          return 0;
        }

        case Wm.WM_SYSKEYDOWN: {
          const win = windows.get(hwnd);
          if (win) {
            processKeyEvent(
              "keydown",
              win,
              Number(wParam),
              Number(lParam),
            );
          }
          return 0;
        }

        case Wm.WM_KEYUP: {
          const win = windows.get(hwnd);
          if (win) {
            processKeyEvent(
              "keyup",
              win,
              Number(wParam),
              Number(lParam),
            );
          }
          return 0;
        }

        case Wm.WM_SYSKEYUP: {
          const win = windows.get(hwnd);
          if (win) {
            processKeyEvent(
              "keyup",
              win,
              Number(wParam),
              Number(lParam),
            );
          }
          return 0;
        }

        case Wm.WM_LBUTTONDBLCLK: {
          processMouseEvent("dblclick", 0, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_MBUTTONDBLCLK: {
          processMouseEvent("dblclick", 1, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_RBUTTONDBLCLK: {
          processMouseEvent("dblclick", 2, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_LBUTTONUP: {
          processMouseEvent("mouseup", 0, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_MBUTTONUP: {
          processMouseEvent("mouseup", 1, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_RBUTTONUP: {
          processMouseEvent("mouseup", 2, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_LBUTTONDOWN: {
          processMouseEvent("mousedown", 0, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_MBUTTONDOWN: {
          processMouseEvent("mousedown", 1, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_RBUTTONDOWN: {
          processMouseEvent("mousedown", 2, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_MOUSEMOVE: {
          processMouseEvent("mousemove", 0, hwnd, wParam, lParam);
          return 0;
        }

        case Wm.WM_DESTROY:
          windows.delete(hwnd);
          break;
      }
    } catch (e) {
      console.error("Error in WindowProc:", e);
    }
    return Wm.DefWindowProcA(hwnd, msg, wParam, lParam);
  },
);

const MSG = Wm.allocMSG();

export function pollEvents() {
  while (Wm.PeekMessageW(MSG, null, 0, 0, Wm.PM_REMOVE)) {
    Wm.TranslateMessage(MSG);
    Wm.DispatchMessageW(MSG);
  }
}

function step() {
  if (!EventLoop.running) {
    return;
  }
  pollEvents();
  setTimeout(step, 0);
}

setTimeout(step, 0);
