import { ImageStruct, Position, Size } from "../../core/common.ts";
import {
  animationFrames,
  EventLoop,
  WindowClosedEvent,
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
import { RawPlatform } from "../../core/mod.ts";
import { DwmMonitor } from "../../core/monitor.ts";
import {
  CreateWindowOptions,
  CursorIcon,
  DwmWindow,
  InputMode,
  InputModeValue,
} from "../../core/window.ts";
import {
  GLFW_ARROW_CURSOR,
  GLFW_CLIENT_API,
  GLFW_CONTEXT_VERSION_MAJOR,
  GLFW_CONTEXT_VERSION_MINOR,
  GLFW_CROSSHAIR_CURSOR,
  GLFW_CURSOR,
  GLFW_CURSOR_DISABLED,
  GLFW_CURSOR_HIDDEN,
  GLFW_CURSOR_NORMAL,
  GLFW_DECORATED,
  GLFW_FLOATING,
  GLFW_FOCUSED,
  GLFW_HAND_CURSOR,
  GLFW_HRESIZE_CURSOR,
  GLFW_IBEAM_CURSOR,
  GLFW_ICONIFIED,
  GLFW_LOCK_KEY_MODS,
  GLFW_MAXIMIZED,
  GLFW_OPENGL_API,
  GLFW_OPENGL_CORE_PROFILE,
  GLFW_OPENGL_ES_API,
  GLFW_OPENGL_FORWARD_COMPAT,
  GLFW_OPENGL_PROFILE,
  GLFW_RAW_MOUSE_MOTION,
  GLFW_RESIZABLE,
  GLFW_SAMPLES,
  GLFW_STICKY_KEYS,
  GLFW_STICKY_MOUSE_BUTTONS,
  GLFW_TRANSPARENT_FRAMEBUFFER,
  GLFW_TRUE,
  GLFW_VISIBLE,
  GLFW_VRESIZE_CURSOR,
} from "./constants.ts";
import { cstr, ffi } from "./ffi.ts";
import { MonitorGlfw } from "./monitor.ts";
import SCANCODE_WIN from "./scancode_win.json" with { type: "json" };

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
  glfwSetWindowSizeLimits,
  glfwSetWindowFocusCallback,
  glfwSetWindowSizeCallback,
  glfwGetWindowContentScale,
  glfwGetWindowFrameSize,
  glfwGetWindowOpacity,
  glfwSetFramebufferSizeCallback,
  glfwSetWindowAspectRatio,
  // glfwSetWindowAttrib,
  // glfwSetWindowContentScaleCallback,
  glfwSetWindowIcon,
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
  glfwSetCursor,
  glfwCreateStandardCursor,
  glfwDestroyCursor,
  glfwWaitEvents,
  glfwVulkanSupported,
  glfwGetRequiredInstanceExtensions,
  glfwGetPhysicalDevicePresentationSupport,
  glfwCreateWindowSurface,
  glfwGetInstanceProcAddress,
  glfwGetWindowMonitor,
  glfwSetWindowMonitor,
  glfwSetInputMode,
  glfwGetInputMode,
  glfwRawMouseMotionSupported,
  glfwSetCursorPos,
  glfwCreateCursor,
} = ffi;

if (!glfwInit()) {
  throw new Error("Failed to initialize GLFW");
}

const MAX_SAFE_INT = BigInt(Number.MAX_SAFE_INTEGER);

const errorCallback = new Deno.UnsafeCallback(
  {
    parameters: ["i32", "pointer"],
    result: "void",
  } as const,
  (error, description) => {
    console.error(
      "GlfwError:",
      error,
      Deno.UnsafePointerView.getCString(description!),
    );
  },
);

glfwSetErrorCallback(errorCallback.pointer);

const U32_0 = new Uint32Array(1);
const U64_0 = new BigUint64Array(1);
const I32_0 = new Int32Array(1);
const I32_1 = new Int32Array(1);
const I32_2 = new Int32Array(1);
const I32_3 = new Int32Array(1);
const F32_0 = new Float32Array(1);
const F32_1 = new Float32Array(1);

/**
 * Processes all pending events.
 */
export function pollEvents(wait = false) {
  if (wait) {
    glfwWaitEvents();
  } else {
    glfwPollEvents();
  }
}

/**
 * Returns the address of the specified function for the current context.
 */
export function getProcAddress(name: string) {
  return glfwGetProcAddress(cstr(name));
}

/**
 * Checks if the machine has vulkan support.
 */
export function vulkanSupported() {
  return glfwVulkanSupported() === 1;
}

/**
 * Gets the required instances extensions
 */
export function getRequiredInstanceExtensions() {
  const ptr = glfwGetRequiredInstanceExtensions(new Uint8Array(U32_0.buffer));
  const ptrView = new Deno.UnsafePointerView(ptr!);
  const extensions = new Array<string>(U32_0[0]);
  for (let i = 0; i < extensions.length; i++) {
    extensions[i] = Deno.UnsafePointerView.getCString(
      Deno.UnsafePointer.create(ptrView.getBigUint64(i * 8))!,
    );
  }
  return extensions;
}

export function getPhysicalDevicePresentationSupport(
  instance: Deno.PointerValue,
  device: Deno.PointerValue,
  queueFamily: number,
) {
  return glfwGetPhysicalDevicePresentationSupport(
    instance,
    device,
    queueFamily,
  ) === 1;
}

export function getInstanceProcAddress(
  instance: Deno.PointerValue,
  name: string,
) {
  return glfwGetInstanceProcAddress(instance, cstr(name));
}

const WINDOWS = new Map<bigint, WindowGlfw>();
let countedWindows = -1;

const cursorPosCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "f64", "f64"],
    result: "void",
  } as const,
  (handle, x, y) => {
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
      if (!action) {
        dispatchEvent(
          new WindowMouseEvent(
            "click",
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
        const now = performance.now();
        const lastClick = window._inputState.lastClick;
        if (lastClick && (now - lastClick) < 500) {
          dispatchEvent(
            new WindowMouseEvent(
              "dblclick",
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
          window._inputState.lastClick = 0;
        } else {
          window._inputState.lastClick = now;
        }
      }
    }
  },
);

const scrollCallback = new Deno.UnsafeCallback(
  {
    parameters: ["pointer", "f64", "f64"],
    result: "void",
  } as const,
  (handle, x, y) => {
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
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
    const window = WINDOWS.get(BigInt(Deno.UnsafePointer.value(handle)));
    if (window) {
      const out = [];
      const view = new Deno.UnsafePointerView(paths!);
      for (let i = 0; i < count; i++) {
        const path = Deno.UnsafePointer.create(
          Number(view.getBigUint64(i * 8)),
        );
        out.push(Deno.UnsafePointerView.getCString(path!));
      }
      dispatchEvent(new WindowDropEvent(window, out));
    }
  },
);

const objc = Deno.build.os === "darwin"
  ? Deno.dlopen("libobjc.dylib", {
    objc_msgSend_contentView: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
      name: "objc_msgSend",
    },
    sel_registerName: {
      parameters: ["buffer"],
      result: "pointer",
    },
  }).symbols
  : undefined;

export class WindowGlfw extends DwmWindow {
  #nativeHandle: Deno.PointerValue;
  #title = "";
  #counted = false;
  #noClientAPI = false;
  #cursor: Deno.PointerValue | null = null;
  #closed = false;
  // deno-lint-ignore no-explicit-any
  _inputState: Record<string, any> = {};

  get nativeHandle() {
    return this.#nativeHandle;
  }

  get noClientAPI() {
    return this.#noClientAPI;
  }

  constructor(options: CreateWindowOptions = {}) {
    super(options);
    if (options.glVersion) {
      if (typeof options.glVersion === "string") {
        try {
          const [_str, major, minor] = options.glVersion.match(
            /^v?(?<major>\d+)\.(?<minor>\d+)\.?(?<patch>\d+)?$/,
          )!;
          options.glVersion = [Number(major), Number(minor)];
        } catch (e) {
          throw new Error(
            `Could not determine the gl version from ${options.glVersion}`,
          );
        }
      }
      glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, options.glVersion[0]);
      glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, options.glVersion[1]);
      glfwWindowHint(
        GLFW_CLIENT_API,
        options.gles ? GLFW_OPENGL_ES_API : GLFW_OPENGL_API,
      );
      if (options.glVersion[0] >= 3 && options.glVersion[1] >= 0) {
        glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, 1);
      }
      if (options.glVersion[0] >= 3 && options.glVersion[1] >= 2) {
        glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
      }
      glfwWindowHint(GLFW_SAMPLES, 4);
      this.#noClientAPI = false;
    } else {
      this.#noClientAPI = true;
      glfwWindowHint(GLFW_CLIENT_API, 0);
    }

    if (options.floating) {
      glfwWindowHint(GLFW_FLOATING, 1);
    }

    glfwWindowHint(GLFW_RESIZABLE, options.resizable ? 1 : 0);
    glfwWindowHint(GLFW_VISIBLE, 0);
    glfwWindowHint(GLFW_MAXIMIZED, options.maximized ? 1 : 0);
    glfwWindowHint(GLFW_TRANSPARENT_FRAMEBUFFER, options.transparent ? 1 : 0);
    glfwWindowHint(GLFW_DECORATED, options.removeDecorations ? 0 : 1);

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

    WINDOWS.set(BigInt(Deno.UnsafePointer.value(this.#nativeHandle)), this);

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

    if (!this.noClientAPI) {
      this.makeContextCurrent();
      if (options.vsync !== false) {
        glfwSwapInterval(1);
      }
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
    return glfwGetWindowAttrib(this.#nativeHandle, GLFW_FOCUSED) === 1;
  }

  set focused(value: boolean) {
    if (value) {
      glfwFocusWindow(this.#nativeHandle);
    }
  }

  get visible() {
    return glfwGetWindowAttrib(this.#nativeHandle, GLFW_VISIBLE) === 1;
  }

  set visible(value: boolean) {
    if (value) {
      glfwShowWindow(this.#nativeHandle);
    } else {
      glfwHideWindow(this.#nativeHandle);
    }
  }

  get maximized() {
    return glfwGetWindowAttrib(this.#nativeHandle, GLFW_MAXIMIZED) === 1;
  }

  set maximized(value: boolean) {
    if (value) {
      glfwMaximizeWindow(this.#nativeHandle);
    } else {
      glfwRestoreWindow(this.#nativeHandle);
    }
  }

  get minimized() {
    return glfwGetWindowAttrib(this.#nativeHandle, GLFW_ICONIFIED) === 1;
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

  get frameSize() {
    glfwGetWindowFrameSize(this.#nativeHandle, I32_0, I32_1, I32_2, I32_3);
    return {
      left: I32_0[0],
      top: I32_1[0],
      right: I32_2[0],
      bottom: I32_3[0],
    };
  }

  get contentScale() {
    glfwGetWindowContentScale(this.#nativeHandle, F32_0, F32_1);
    return { x: F32_0[0], y: F32_1[0] };
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
    if (this.#noClientAPI) return;
    glfwMakeContextCurrent(this.#nativeHandle);
  }

  swapBuffers() {
    glfwSwapBuffers(this.#nativeHandle);
  }

  setAspectRatio(numerator: number, denominator: number) {
    glfwSetWindowAspectRatio(this.#nativeHandle, numerator, denominator);
  }

  setCursor(icon?: CursorIcon | undefined) {
    if (icon) {
      const cursor = glfwCreateStandardCursor(
        {
          arrow: GLFW_ARROW_CURSOR,
          ibeam: GLFW_IBEAM_CURSOR,
          crosshair: GLFW_CROSSHAIR_CURSOR,
          hand: GLFW_HAND_CURSOR,
          hresize: GLFW_HRESIZE_CURSOR,
          vresize: GLFW_VRESIZE_CURSOR,
        }[icon],
      );
      glfwSetCursor(this.#nativeHandle, cursor);
      if (this.#cursor) {
        glfwDestroyCursor(this.#cursor);
      }
      this.#cursor = cursor;
    } else {
      glfwSetCursor(this.#nativeHandle, null);
      if (this.#cursor) {
        glfwDestroyCursor(this.#cursor);
        this.#cursor = null;
      }
    }
  }

  setCustomCursor(image: Uint8Array, hotspot: Size, position: Position) {
    const stringptr = Deno.UnsafePointer.of(image);
    const struct = new Uint8Array(16);
    const structview = new DataView(struct.buffer);
    structview.setInt32(0, hotspot.width, true);
    structview.setInt32(4, hotspot.width, true);
    structview.setBigInt64(
      8,
      BigInt(Deno.UnsafePointer.value(stringptr)),
      true,
    );

    const cursor = glfwCreateCursor(
      struct,
      position.x,
      position.y,
    );
    glfwSetCursor(this.#nativeHandle, cursor);
    if (this.#cursor) {
      glfwDestroyCursor(this.#cursor);
    }
    this.#cursor = cursor;
  }

  setIcon(image: ImageStruct): void;
  setIcon(image: Uint8Array, size: Size): void;
  setIcon(...args: [ImageStruct] | [Uint8Array, Size]) {
    const image = args.length === 1
      ? args[0]
      : { image: args[0], width: args[1].width, height: args[1].height };

    const stringptr = Deno.UnsafePointer.of(image.image);
    const struct = new Uint8Array(16);
    const structview = new DataView(struct.buffer);
    structview.setInt32(0, image.width, true);
    structview.setInt32(4, image.width, true);
    structview.setBigInt64(
      8,
      BigInt(Deno.UnsafePointer.value(stringptr)),
      true,
    );
    glfwSetWindowIcon(this.#nativeHandle, 1, structview);
  }

  createSurface(
    instance: Deno.PointerValue,
    allocator?: Deno.PointerValue | undefined,
  ): Deno.PointerValue {
    const surfaceOut = U64_0;
    const result = glfwCreateWindowSurface(
      instance,
      this.#nativeHandle,
      allocator ?? null,
      new Uint8Array(surfaceOut.buffer),
    );
    if (result !== 0) {
      throw new Error(`Failed to create surface: ${result}`);
    }
    return Deno.UnsafePointer.create(
      surfaceOut[0] < MAX_SAFE_INT ? Number(surfaceOut[0]) : surfaceOut[0],
    );
  }

  getMonitor(): DwmMonitor | undefined {
    const monitor = glfwGetWindowMonitor(this.#nativeHandle);
    return monitor ? new MonitorGlfw(monitor) : undefined;
  }

  setMonitor(
    monitor?: DwmMonitor,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    refreshRate?: number,
  ) {
    if (monitor) {
      glfwSetWindowMonitor(
        this.#nativeHandle,
        monitor.nativeHandle,
        x ?? 0,
        y ?? 0,
        width ?? 0,
        height ?? 0,
        refreshRate ?? -1,
      );
    } else {
      glfwSetWindowMonitor(
        this.#nativeHandle,
        null,
        x ?? 0,
        y ?? 0,
        width ?? 0,
        height ?? 0,
        refreshRate ?? -1,
      );
    }
  }

  setSizeLimits(
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number,
  ) {
    glfwSetWindowSizeLimits(
      this.#nativeHandle,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    );
  }

  get closed() {
    return this.#closed;
  }

  setInputMode(mode: InputMode, value: InputModeValue | boolean) {
    glfwSetInputMode(
      this.#nativeHandle,
      {
        cursor: GLFW_CURSOR,
        cursorDisabled: GLFW_CURSOR_DISABLED,
        cursorHidden: GLFW_CURSOR_HIDDEN,
        stickyKeys: GLFW_STICKY_KEYS,
        stickyMouseButtons: GLFW_STICKY_MOUSE_BUTTONS,
        lockKeyMods: GLFW_LOCK_KEY_MODS,
        rawMouseMotion: GLFW_RAW_MOUSE_MOTION,
      }[mode],
      typeof value === "boolean" ? value ? 1 : 0 : {
        normal: GLFW_CURSOR_NORMAL,
        hidden: GLFW_CURSOR_HIDDEN,
        disabled: GLFW_CURSOR_DISABLED,
      }[value],
    );
  }

  getInputMode(mode: InputMode): InputModeValue {
    const inputModeraw = glfwGetInputMode(
      this.#nativeHandle,
      {
        cursor: GLFW_CURSOR,
        cursorDisabled: GLFW_CURSOR_DISABLED,
        cursorHidden: GLFW_CURSOR_HIDDEN,
        stickyKeys: GLFW_STICKY_KEYS,
        stickyMouseButtons: GLFW_STICKY_MOUSE_BUTTONS,
        lockKeyMods: GLFW_LOCK_KEY_MODS,
        rawMouseMotion: GLFW_RAW_MOUSE_MOTION,
      }[mode],
    );
    switch (inputModeraw) {
      case GLFW_CURSOR_DISABLED:
        return "disabled";
      case GLFW_CURSOR_HIDDEN:
        return "hidden";
      case GLFW_CURSOR_NORMAL:
        return "normal";
      default:
        return "normal";
    }
  }

  rawMouseMotionSupported() {
    return glfwRawMouseMotionSupported() ? true : false;
  }

  setCursorPos(x: number, y: number) {
    glfwSetCursorPos(this.#nativeHandle, x, y);
  }

  #rawHandle(): [
    RawPlatform,
    Deno.PointerValue<unknown>,
    Deno.PointerValue<unknown> | null,
  ] {
    let platform: RawPlatform;
    let handle: Deno.PointerValue<unknown>;
    let display: Deno.PointerValue<unknown>;
    switch (Deno.build.os) {
      case "darwin":
        platform = "cocoa";
        handle = ffi.glfwGetCocoaWindow!(this.#nativeHandle);
        display = objc!.objc_msgSend_contentView(
          handle,
          objc!.sel_registerName(cstr("contentView")),
        );
        break;
      case "windows": {
        platform = "win32";
        const kernel32 = Deno.dlopen("kernel32.dll", {
          GetModuleHandleW: {
            parameters: ["pointer"],
            result: "pointer",
          },
        });
        handle = ffi.glfwGetWin32Window!(this.#nativeHandle);
        display = kernel32.symbols.GetModuleHandleW(null);
        kernel32.close();
        break;
      }
      case "linux":
      case "aix":
      case "freebsd":
      case "illumos":
      case "netbsd":
      case "solaris":
        platform = "x11";
        handle = ffi.glfwGetX11Window!(this.#nativeHandle);
        display = ffi.glfwGetX11Display!();
        break;
      default:
        throw new Error(`Unsupported platform: ${Deno.build.os}`);
    }
    return [
      platform,
      handle!,
      display == null ? null : display,
    ];
  }

  windowSurface() {
    const [platform, handle, display] = this.#rawHandle();
    return new Deno.UnsafeWindowSurface(platform, handle, display);
  }

  close() {
    this.#closed = true;
    dispatchEvent(new WindowClosedEvent(this));
    glfwDestroyWindow(this.#nativeHandle);
    WINDOWS.delete(BigInt(Deno.UnsafePointer.value(this.#nativeHandle)));
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
  loop = true,
  wait = false,
): Promise<never> {
  if (loop) {
    while (EventLoop.running) {
      const now = performance.now();
      const frames = [...animationFrames.values()];
      animationFrames.clear();
      for (const frame of frames) {
        await frame(now);
      }
      await cb?.(now);
      pollEvents(wait);
    }
    glfwTerminate();
    Deno.exit(0);
  } else {
    let resolve!: CallableFunction;
    const fn = async () => {
      if (!EventLoop.running) {
        resolve();
        glfwTerminate();
        Deno.exit(0);
      }
      const now = performance.now();
      const frames = [...animationFrames.values()];
      animationFrames.clear();
      for (const frame of frames) {
        await frame(now);
      }
      await cb?.(now);
      pollEvents(wait);
      setTimeout(fn, 0);
    };
    setTimeout(fn, 0);
    return new Promise((r) => {
      resolve = r;
    });
  }
}
