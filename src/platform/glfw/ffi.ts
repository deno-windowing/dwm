import {
  dlopen,
  FetchOptions,
} from "https://deno.land/x/plug@1.0.0-rc.3/mod.ts";

const symbols = {
  glfwInit: { parameters: [], result: "i32" },
  glfwTerminate: { parameters: [], result: "void" },
  glfwSetErrorCallback: {
    parameters: ["function"],
    result: "void",
  },
  glfwCreateWindow: {
    parameters: ["i32", "i32", "buffer", "pointer", "pointer"],
    result: "pointer",
  },
  glfwWindowHint: {
    parameters: ["i32", "i32"],
    result: "void",
  },
  glfwDestroyWindow: {
    parameters: ["pointer"],
    result: "void",
  },
  glfwMakeContextCurrent: {
    parameters: ["pointer"],
    result: "void",
  },
  glfwGetProcAddress: {
    parameters: ["buffer"],
    result: "pointer",
  },
  glfwWindowShouldClose: {
    parameters: ["pointer"],
    result: "i32",
  },
  glfwSwapBuffers: {
    parameters: ["pointer"],
    result: "void",
  },
  glfwSwapInterval: {
    parameters: ["i32"],
    result: "void",
  },
  glfwPollEvents: {
    parameters: [],
    result: "void",
    callback: true,
  },
  glfwSetCursorPosCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowTitle: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  glfwGetWindowAttrib: {
    parameters: ["pointer", "i32"],
    result: "i32",
  },
  glfwSetWindowAttrib: {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
    callback: true,
  },
  glfwFocusWindow: {
    parameters: ["pointer"],
    result: "void",
    callback: true,
  },
  glfwSetWindowIcon: {
    parameters: ["pointer", "i32", "pointer"],
    result: "void",
    callback: true,
  },
  glfwGetWindowPos: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "void",
  },
  glfwSetWindowPos: {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
    callback: true,
  },
  glfwGetWindowSize: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "void",
  },
  glfwSetWindowSizeLimits: {
    parameters: ["pointer", "i32", "i32", "i32", "i32"],
    result: "void",
  },
  glfwSetWindowAspectRatio: {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
    callback: true,
  },
  glfwSetWindowSize: {
    parameters: ["pointer", "i32", "i32"],
    result: "void",
    callback: true,
  },
  glfwGetFramebufferSize: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "void",
  },
  glfwGetWindowFrameSize: {
    parameters: ["pointer", "buffer", "buffer", "buffer", "buffer"],
    result: "void",
  },
  glfwGetWindowContentScale: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "void",
  },
  glfwGetWindowOpacity: {
    parameters: ["pointer"],
    result: "f32",
  },
  glfwSetWindowOpacity: {
    parameters: ["pointer", "f32"],
    result: "void",
    callback: true,
  },
  glfwIconifyWindow: {
    parameters: ["pointer"],
    result: "void",
    callback: true,
  },
  glfwRestoreWindow: {
    parameters: ["pointer"],
    result: "void",
    callback: true,
  },
  glfwMaximizeWindow: {
    parameters: ["pointer"],
    result: "void",
    callback: true,
  },
  glfwShowWindow: {
    parameters: ["pointer"],
    result: "void",
    callback: true,
  },
  glfwHideWindow: {
    parameters: ["pointer"],
    result: "void",
    callback: true,
  },
  glfwRequestWindowAttention: {
    parameters: ["pointer"],
    result: "void",
    callback: true,
  },
  glfwSetWindowPosCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowSizeCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowCloseCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowRefreshCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowFocusCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowIconifyCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowMaximizeCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetFramebufferSizeCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetWindowContentScaleCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetKeyCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetCharCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetMouseButtonCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetCursorEnterCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetScrollCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwSetDropCallback: {
    parameters: ["pointer", "function"],
    result: "pointer",
  },
  glfwGetCursorPos: {
    parameters: ["pointer", "buffer", "buffer"],
    result: "void",
  },
  glfwSetCursor: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  glfwCreateStandardCursor: {
    parameters: ["i32"],
    result: "pointer",
  },
  glfwDestroyCursor: {
    parameters: ["pointer"],
    result: "void",
  },
  glfwCreateCursor: {
    parameters: ["buffer", "i32", "i32"],
    result: "pointer",
  },
  glfwWaitEvents: {
    parameters: [],
    result: "void",
    callback: true,
  },
  glfwVulkanSupported: {
    parameters: [],
    result: "i32",
  },
  glfwGetRequiredInstanceExtensions: {
    parameters: ["buffer"],
    result: "pointer",
  },
  glfwGetInstanceProcAddress: {
    parameters: ["pointer", "buffer"],
    result: "pointer",
  },
  glfwGetPhysicalDevicePresentationSupport: {
    parameters: ["pointer", "pointer", "i32"],
    result: "i32",
  },
  glfwCreateWindowSurface: {
    parameters: ["pointer", "pointer", "pointer", "buffer"],
    result: "i32",
  },
} as const;

const customPath = Deno.env.get("glfw3");

const opts: FetchOptions = {
  name: "glfw3",
  url: "https://github.com/CarrotzRule123/daybreak/raw/main/dist/",
};

const mod = customPath
  ? Deno.dlopen(customPath, symbols)
  : await dlopen(opts, symbols);

export const ffi = mod.symbols;

// export const ffi = Deno.dlopen(
//   "glfw3",
//   symbols,
// ).symbols;

export function cstr(str: string) {
  return new TextEncoder().encode(str + "\0");
}
