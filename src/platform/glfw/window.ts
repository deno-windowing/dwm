import { Position, Size } from "../../core/common.ts";
import {
  animationFrames,
  EventLoop,
  WindowCloseEvent,
  WindowDropEvent,
  WindowFocusEvent,
  WindowFramebufferSizeEvent,
  WindowInputEvent,
  WindowKeyboardEvent,
  WindowMaximizeEvent,
  WindowMinimizeEvent,
  WindowMouseEvent,
  WindowMoveEvent,
  WindowRefreshEvent,
  WindowResizeEvent,
  WindowScrollEvent,
} from "../../core/event.ts";
import { CreateWindowOptions, DwmWindow } from "../../core/window.ts";
import { cstr, ffi } from "./ffi.ts";
import SCANCODE_WIN from "./scancode_win.json" assert { type: "json" };

const {
  glfwInit,
  glfwSetErrorCallback,
  glfwCreateWindow,
  glfwWindowHint,
  glfwSetWindowTitle,
  glfwDestroyWindow,
  glfwGetWindowAttrib,
  glfwWindowShouldClose,
  glfwPollEvents,
  glfwSwapBuffers,
  glfwSwapInterval,
  glfwMakeContextCurrent,
  glfwFocusWindow,
  glfwGetFramebufferSize,
  glfwGetProcAddress,
  glfwGetWindowPos,
  glfwGetWindowSize,
  glfwSetWindowPos,
  glfwSetWindowSize,
  glfwTerminate,
  glfwHideWindow,
  glfwShowWindow,
  glfwIconifyWindow,
  glfwRestoreWindow,
  glfwMaximizeWindow,
  glfwSetCursorPosCallback,
  glfwSetWindowCloseCallback,
  // glfwSetWindowSizeLimits,
  glfwSetWindowFocusCallback,
  glfwSetWindowSizeCallback,
  // glfwRequestWindowAttention,
  // glfwGetWindowContentScale,
  // glfwGetWindowFrameSize,
  glfwGetWindowOpacity,
  glfwSetFramebufferSizeCallback,
  // glfwSetWindowAspectRatio,
  // glfwSetWindowAttrib,
  // glfwSetWindowContentScaleCallback,
  // glfwSetWindowIcon,
  glfwSetWindowIconifyCallback,
  glfwSetWindowMaximizeCallback,
  glfwSetWindowOpacity,
  glfwSetWindowPosCallback,
  glfwSetWindowRefreshCallback,
  glfwSetCharCallback,
  glfwSetCursorEnterCallback,
  glfwSetDropCallback,
  glfwSetKeyCallback,
  glfwSetMouseButtonCallback,
  glfwSetScrollCallback,
  glfwRequestWindowAttention,
} = ffi;

if (!glfwInit()) {
  throw new Error("Failed to initialize GLFW");
}

const errorCallback = new Deno.UnsafeCallback(
  {
    parameters: ["i32", "pointer"],
    result: "void",
  } as const,
  (error, description) => {
    console.error(
      "GlfwError:",
      error,
      Deno.UnsafePointerView.getCString(description),
    );
  },
);

glfwSetErrorCallback(errorCallback.pointer);

const I32_0 = new Int32Array(1);
const I32_1 = new Int32Array(1);

export function pollEvents() {
  glfwPollEvents();
}

export function getProcAddress(name: string) {
  return glfwGetProcAddress(cstr(name));
}

const WINDOWS = new Map<Deno.PointerValue, WindowGlfw>();
let countedWindows = -1;

const cursorPosCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "f64", "f64"],
    result: "void",
  } as const,
  (handle, x, y) => {
    const window = WINDOWS.get(handle);
    if (window) {
      const lastX = window._inputState.mouseX;
      const lastY = window._inputState.mouseY;
      window._inputState.mouseX = x;
      window._inputState.mouseY = y;
      window._inputState.mouseDeltaX = x - lastX;
      window._inputState.mouseDeltaY = y - lastY;
      dispatchEvent(
        new WindowMouseEvent(
          "mousemove",
          window,
          false,
          -1,
          -1,
          x,
          y,
          false,
          false,
          x - lastX,
          y - lastY,
          0,
          x,
          y,
          false,
        ),
      );
      dispatchEvent(
        new WindowMouseEvent(
          "pointermove",
          window,
          false,
          -1,
          -1,
          x,
          y,
          false,
          false,
          x - lastX,
          y - lastY,
          0,
          x,
          y,
          false,
        ),
      );
    }
  },
);

const windowPosCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
  } as const,
  (handle, x, y) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(new WindowMoveEvent(window, x, y));
    }
  },
);

const windowSizeCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
  } as const,
  (handle, width, height) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(new WindowResizeEvent(window, width, height));
    }
  },
);

const windowCloseCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer"],
    result: "void",
  } as const,
  (handle) => {
    const window = WINDOWS.get(handle);
    if (window) {
      if (dispatchEvent(new WindowCloseEvent(window))) {
        window.close();
      }
    }
  },
);

const windowRefreshCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer"],
    result: "void",
  } as const,
  (handle) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(new WindowRefreshEvent(window));
    }
  },
);

const windowFocusCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32"],
    result: "void",
  } as const,
  (handle, focused) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(new WindowFocusEvent(window, !!focused));
    }
  },
);

const windowIconifyCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32"],
    result: "void",
  } as const,
  (handle, iconified) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(new WindowMinimizeEvent(window, !!iconified));
    }
  },
);

const windowMaximizeCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32"],
    result: "void",
  } as const,
  (handle, maximized) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(new WindowMaximizeEvent(window, !!maximized));
    }
  },
);

const bufferSizeCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
  } as const,
  (handle, width, height) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(new WindowFramebufferSizeEvent(window, width, height));
    }
  },
);

const keyCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32", "i32", "i32", "i32"],
    result: "void",
  } as const,
  (handle, key, scancode, action, mods) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(
        new WindowKeyboardEvent(
          action ? "keydown" : "keyup",
          window,
          (mods & 0x0004) !== 0,
          (SCANCODE_WIN as Record<number, string>)[scancode] ??
            `Unknown(${scancode})`,
          (mods & 0x0002) !== 0,
          false,
          String.fromCharCode(key),
          0,
          false,
          false,
          (mods & 0x0001) !== 0,
          key,
        ),
      );
    }
  },
);

const charCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "u32"],
    result: "void",
  } as const,
  (handle, codepoint) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(
        new WindowInputEvent(window, String.fromCodePoint(codepoint)),
      );
    }
  },
);

const cursorEnterCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32"],
    result: "void",
  } as const,
  (handle, entered) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(
        new WindowMouseEvent(
          entered ? "mouseenter" : "mouseleave",
          window,
          false,
          -1,
          -1,
          window._inputState.mouseX,
          window._inputState.mouseY,
          false,
          false,
          0,
          0,
          0,
          window._inputState.mouseX,
          window._inputState.mouseY,
          false,
        ),
      );
    }
  },
);

const mouseButtonCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32", "i32", "i32"],
    result: "void",
  } as const,
  (handle, button, action, mods) => {
    const window = WINDOWS.get(handle);
    if (window) {
      const x = window._inputState.mouseX;
      const y = window._inputState.mouseY;
      dispatchEvent(
        new WindowMouseEvent(
          action ? "mousedown" : "mouseup",
          window,
          (mods & 0x0004) !== 0,
          button,
          button,
          x,
          y,
          (mods & 0x0002) !== 0,
          (mods & 0x0008) !== 0,
          0,
          0,
          0,
          x,
          y,
          (mods & 0x0001) !== 0,
        ),
      );
      dispatchEvent(
        new WindowMouseEvent(
          action ? "pointerdown" : "pointerup",
          window,
          (mods & 0x0004) !== 0,
          button,
          button,
          x,
          y,
          (mods & 0x0002) !== 0,
          (mods & 0x0008) !== 0,
          0,
          0,
          0,
          x,
          y,
          (mods & 0x0001) !== 0,
        ),
      );
    }
  },
);

const scrollCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "f64", "f64"],
    result: "void",
  } as const,
  (handle, x, y) => {
    const window = WINDOWS.get(handle);
    if (window) {
      dispatchEvent(
        new WindowScrollEvent(
          window,
          x,
          y,
        ),
      );
    }
  },
);

const dropCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "i32", "pointer"],
    result: "void",
  } as const,
  (handle, count, paths) => {
    const window = WINDOWS.get(handle);
    if (window) {
      const out = [];
      const view = new Deno.UnsafePointerView(paths);
      for (let i = 0; i < count; i++) {
        const path = Number(view.getBigUint64(i * 8));
        out.push(Deno.UnsafePointerView.getCString(path));
      }
      dispatchEvent(new WindowDropEvent(window, out));
    }
  },
);

export class WindowGlfw extends DwmWindow {
  #nativeHandle: Deno.PointerValue;
  #title = "";
  #counted = false;

  // deno-lint-ignore no-explicit-any
  _inputState: Record<string, any> = {};

  get nativeHandle() {
    return this.#nativeHandle;
  }

  constructor(options: CreateWindowOptions = {}) {
    super(options);
    if (options.glVersion) {
      glfwWindowHint(0x00022002, options.glVersion[0]);
      glfwWindowHint(0x00022003, options.glVersion[1]);
    } else {
      glfwWindowHint(0x00022002, 3);
      glfwWindowHint(0x00022003, 3);
    }
    glfwWindowHint(0x00022001, 0x00030001);
    glfwWindowHint(0x00022006, 1);
    glfwWindowHint(0x00022008, 0x00032001);
    glfwWindowHint(0x00020003, options.resizable ? 1 : 0);
    glfwWindowHint(0x00020004, 0);
    glfwWindowHint(0x00020008, options.maximized ? 1 : 0);
    glfwWindowHint(0x0002100D, 4);
    this.#nativeHandle = glfwCreateWindow(
      options.width ?? 800,
      options.height ?? 600,
      cstr(this.#title = options.title ?? "DwmWindow"),
      null,
      null,
    );
    if (!this.#nativeHandle) {
      throw new Error("Failed to create window");
    }
    WINDOWS.set(this.#nativeHandle, this);

    glfwSetCursorPosCallback(this.#nativeHandle, cursorPosCallback.pointer);
    glfwSetWindowPosCallback(this.#nativeHandle, windowPosCallback.pointer);
    glfwSetWindowSizeCallback(this.#nativeHandle, windowSizeCallback.pointer);
    glfwSetWindowCloseCallback(this.#nativeHandle, windowCloseCallback.pointer);
    glfwSetWindowRefreshCallback(
      this.#nativeHandle,
      windowRefreshCallback.pointer,
    );
    glfwSetWindowFocusCallback(this.#nativeHandle, windowFocusCallback.pointer);
    glfwSetWindowIconifyCallback(
      this.#nativeHandle,
      windowIconifyCallback.pointer,
    );
    glfwSetWindowMaximizeCallback(
      this.#nativeHandle,
      windowMaximizeCallback.pointer,
    );
    glfwSetFramebufferSizeCallback(
      this.#nativeHandle,
      bufferSizeCallback.pointer,
    );
    glfwSetKeyCallback(this.#nativeHandle, keyCallback.pointer);
    glfwSetCharCallback(this.#nativeHandle, charCallback.pointer);
    glfwSetCursorEnterCallback(this.#nativeHandle, cursorEnterCallback.pointer);
    glfwSetMouseButtonCallback(
      this.#nativeHandle,
      mouseButtonCallback.pointer,
    );
    glfwSetScrollCallback(this.#nativeHandle, scrollCallback.pointer);
    glfwSetDropCallback(this.#nativeHandle, dropCallback.pointer);

    if (options.autoExitEventLoop !== false) {
      if (countedWindows === -1) {
        countedWindows = 1;
      } else {
        countedWindows++;
      }
      this.#counted = true;
    }
    this.makeContextCurrent();
    if (options.vsync !== false) {
      glfwSwapInterval(1);
    }

    if (options.minimized) {
      glfwIconifyWindow(this.#nativeHandle);
    }

    if (options.visible !== false) {
      this.visible = true;
    }
  }

  get title() {
    return this.#title;
  }

  set title(value) {
    glfwSetWindowTitle(this.#nativeHandle, cstr(this.#title = value));
  }

  get focused() {
    return glfwGetWindowAttrib(this.#nativeHandle, 0x00020001) === 1;
  }

  set focused(value: boolean) {
    if (value) {
      glfwFocusWindow(this.#nativeHandle);
    }
  }

  get visible() {
    return glfwGetWindowAttrib(this.#nativeHandle, 0x00020004) === 1;
  }

  set visible(value: boolean) {
    if (value) {
      glfwShowWindow(this.#nativeHandle);
    } else {
      glfwHideWindow(this.#nativeHandle);
    }
  }

  get maximized() {
    return glfwGetWindowAttrib(this.#nativeHandle, 0x00020008) === 1;
  }

  set maximized(value: boolean) {
    if (value) {
      glfwMaximizeWindow(this.#nativeHandle);
    } else {
      glfwRestoreWindow(this.#nativeHandle);
    }
  }

  get minimized() {
    return glfwGetWindowAttrib(this.#nativeHandle, 0x00020002) === 1;
  }

  set minimized(value: boolean) {
    if (value) {
      glfwIconifyWindow(this.#nativeHandle);
    } else {
      glfwRestoreWindow(this.#nativeHandle);
    }
  }

  get shouldClose() {
    return glfwWindowShouldClose(this.#nativeHandle) === 1;
  }

  get position() {
    glfwGetWindowPos(this.#nativeHandle, I32_0, I32_1);
    return { x: I32_0[0], y: I32_1[0] };
  }

  set position(value: Position) {
    glfwSetWindowPos(this.#nativeHandle, value.x, value.y);
  }

  get size() {
    glfwGetWindowSize(this.#nativeHandle, I32_0, I32_1);
    return { width: I32_0[0], height: I32_1[0] };
  }

  set size(value: Size) {
    glfwSetWindowSize(this.#nativeHandle, value.width, value.height);
  }

  get framebufferSize() {
    glfwGetFramebufferSize(this.#nativeHandle, I32_0, I32_1);
    return { width: I32_0[0], height: I32_1[0] };
  }

  get fullScreen() {
    return false;
  }

  get opacity() {
    return glfwGetWindowOpacity(this.#nativeHandle);
  }

  set opacity(value: number) {
    glfwSetWindowOpacity(this.#nativeHandle, value);
  }

  requestUserAttention() {
    glfwRequestWindowAttention(this.#nativeHandle);
  }

  makeContextCurrent() {
    glfwMakeContextCurrent(this.#nativeHandle);
  }

  swapBuffers() {
    glfwSwapBuffers(this.#nativeHandle);
  }

  #closed = false;

  get closed() {
    return this.#closed;
  }

  close() {
    this.#closed = true;
    glfwDestroyWindow(this.#nativeHandle);
    WINDOWS.delete(this.#nativeHandle);
    if (this.#counted) {
      if (--countedWindows === 0) {
        glfwTerminate();
        EventLoop.exit();
      }
    }
  }
}

export async function mainloop(
  cb?: (hrtime: number) => unknown,
): Promise<never> {
  while (EventLoop.running) {
    const now = performance.now();
    const frames = [...animationFrames.values()];
    animationFrames.clear();
    for (const frame of frames) {
      await frame(now);
    }
    await cb?.(now);
    glfwPollEvents();
  }
  glfwTerminate();
  Deno.exit(0);
}
