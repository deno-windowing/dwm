import { WindowCloseEvent, WindowResizeEvent } from "../../core/mod.ts";
import { Wm } from "./deps.ts";
import { WindowWin32 } from "./window.ts";

export const windows = new Map<Deno.PointerValue, WindowWin32>();

export const lpfnWndProc = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "u32", "pointer", "pointer"],
    result: "pointer",
  } as const,
  (hwnd, msg, wParam, lParam) => {
    try {
      switch (msg) {
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
          return 0;
        }

        case Wm.WM_CLOSE: {
          const win = windows.get(hwnd);
          if (win) {
            if (dispatchEvent(new WindowCloseEvent(win))) {
              win.close();
            }
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
  while (Wm.PeekMessageA(MSG, null, 0, 0, Wm.PM_REMOVE)) {
    Wm.TranslateMessage(MSG);
    Wm.DispatchMessageA(MSG);
  }
}
