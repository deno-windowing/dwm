import {
  WindowCloseEvent,
  WindowKeyboardEvent,
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

export const lpfnWndProc = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "u32", "pointer", "pointer"],
    result: "pointer",
  } as const,
  (hwnd, msg, wParam, lParam) => {
    try {
      switch (msg) {
        case Wm.WM_PAINT: {
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
