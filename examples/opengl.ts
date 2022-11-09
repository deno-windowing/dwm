import { createWindow, DwmWindow } from "../mod.ts";
import * as Wm from "https://win32.deno.dev/main/UI.WindowsAndMessaging";
import * as Gdi from "https://win32.deno.dev/main/Graphics.Gdi";
import * as GL from "https://win32.deno.dev/main/Graphics.OpenGL";
import * as Lib from "https://win32.deno.dev/main/System.LibraryLoader";

let wglChoosePixelFormatARB: Deno.PointerValue;
let wglCreateContextAttribsARB: Deno.PointerValue;

function initOpenGLExtensions() {
  const wndproca = new Deno.UnsafeCallback(
    {
      parameters: ["pointer", "u32", "pointer", "pointer"],
      result: "pointer",
    } as const,
    (a, b, c, d) => {
      return Wm.DefWindowProcA(a, b, c, d);
    },
  );
  const hInstance = Lib.GetModuleHandleA(null);
  const windowClass = Wm.allocWNDCLASSA({
    style: Wm.CS_HREDRAW | Wm.CS_VREDRAW | Wm.CS_OWNDC,
    lpfnWndProc: wndproca.pointer,
    hInstance,
    lpszClassName: "Dummy_WGL",
  });

  if (!Wm.RegisterClassA(windowClass)) {
    throw new Error("RegisterClassA() failed");
  }

  const dummyWindow = Wm.CreateWindowExA(
    0,
    "Dummy_WGL",
    "Dummy_WGL",
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    hInstance,
    0,
  );

  if (!dummyWindow) {
    throw new Error("CreateWindowExA() failed");
  }

  const dummyDC = Gdi.GetDC(dummyWindow)!;

  const pfd = GL.allocPIXELFORMATDESCRIPTOR({
    nSize: GL.sizeofPIXELFORMATDESCRIPTOR,
    nVersion: 1,
    iPixelType: GL.PFD_TYPE_RGBA,
    dwFlags: GL.PFD_DRAW_TO_WINDOW | GL.PFD_SUPPORT_OPENGL |
      GL.PFD_DOUBLEBUFFER,
    cColorBits: 32,
    cAlphaBits: 8,
    iLayerType: GL.PFD_MAIN_PLANE,
    cDepthBits: 24,
    cStencilBits: 8,
  });

  const pf = GL.ChoosePixelFormat(dummyDC, pfd);
  if (!pf) {
    throw new Error("ChoosePixelFormat() failed");
  }

  if (!GL.SetPixelFormat(dummyDC, pf, pfd)) {
    throw new Error("SetPixelFormat() failed");
  }

  const dummyContext = GL.wglCreateContext(dummyDC);
  if (!dummyContext) {
    throw new Error("wglCreateContext() failed");
  }

  if (!GL.wglMakeCurrent(dummyDC, dummyContext)) {
    throw new Error("wglMakeCurrent() failed");
  }

  wglChoosePixelFormatARB = GL.wglGetProcAddress("wglChoosePixelFormatARB")!;
  wglCreateContextAttribsARB = GL.wglGetProcAddress(
    "wglCreateContextAttribsARB",
  )!;

  if (!wglChoosePixelFormatARB) {
    throw new Error("wglGetProcAddress() failed");
  }

  if (!wglCreateContextAttribsARB) {
    throw new Error("wglGetProcAddress() failed");
  }

  GL.wglMakeCurrent(dummyDC, null);
  GL.wglDeleteContext(dummyContext);
  Gdi.ReleaseDC(dummyWindow, dummyDC);
  Wm.DestroyWindow(dummyWindow);
}

function createOpenGL(win: DwmWindow) {
  initOpenGLExtensions();

  const hdc = Gdi.GetDC(win.nativeHandle);
  const pfd = GL.allocPIXELFORMATDESCRIPTOR({
    nSize: GL.sizeofPIXELFORMATDESCRIPTOR,
    dwFlags: GL.PFD_DRAW_TO_WINDOW | GL.PFD_SUPPORT_OPENGL |
      GL.GL_DOUBLEBUFFER | 0,
    iPixelType: GL.PFD_TYPE_RGBA,
    cColorBits: 32,
    cDepthBits: 24,
    iLayerType: GL.PFD_MAIN_PLANE,
  });

  const pixformat2 = new Int32Array(1);
  const nformats = new Uint32Array(1);

  const pf1 = new Deno.UnsafeFnPointer(
    wglChoosePixelFormatARB!,
    {
      parameters: ["pointer", "buffer", "buffer", "u32", "buffer", "buffer"],
      result: "i32",
    } as const,
  ).call(
    hdc,
    // deno-fmt-ignore
    new Int32Array([
      0x2001, GL.GL_TRUE,
      0x2010, GL.GL_TRUE,
      0x2011, GL.GL_TRUE,
      0x2003, 0x2027,
      0x2013, 0x202B,
      0x2014, 32,
      0x2022, 24,
      0x2023, 8,
      0x2042, 4,
      0, 0,
    ]),
    null,
    1,
    pixformat2,
    nformats,
  );
  if (pf1 == 0) {
    throw new Error("wglChoosePixelFormatARB() failed");
  }

  GL.DescribePixelFormat(hdc, pixformat2[0], pfd.byteLength, pfd);

  if (!GL.SetPixelFormat(hdc, pixformat2[0], pfd)) {
    throw new Error("SetPixelFormat() failed: Cannot set format specified.");
  }

  Gdi.ReleaseDC(win.nativeHandle, hdc);
}

addEventListener("resize", (event) => {
  GL.glViewport(0, 0, event.width, event.height);
});

const window = createWindow({
  title: "Deno DWM OpenGL",
  width: 800,
  height: 600,
  resizable: true,
});

createOpenGL(window);

const hDC = Gdi.GetDC(window.nativeHandle)!;
const hRC = new Deno.UnsafeFnPointer(
  wglCreateContextAttribsARB!,
  {
    parameters: ["pointer", "pointer", "buffer"],
    result: "pointer",
  } as const,
).call(
  hDC,
  0,
  // deno-fmt-ignore
  new Int32Array([
    0x2091, 1,
    0x2092, 1,
    0x9126, 0x00000001,
    0, 0,
  ]),
);
GL.wglMakeCurrent(hDC, hRC);

function draw() {
  GL.glClear(GL.GL_COLOR_BUFFER_BIT);
  GL.glBegin(GL.GL_TRIANGLES);
  GL.glColor3f(1.0, 0.0, 0.0);
  GL.glVertex2i(0, 1);
  GL.glColor3f(0.0, 1.0, 0.0);
  GL.glVertex2i(-1, -1);
  GL.glColor3f(0.0, 0.0, 1.0);
  GL.glVertex2i(1, -1);
  GL.glEnd();
  GL.glFlush();
  GL.SwapBuffers(hDC);
  GL.glClear(GL.GL_COLOR_BUFFER_BIT);
  GL.glBegin(GL.GL_TRIANGLES);
  GL.glColor3f(1.0, 0.0, 0.0);
  GL.glVertex2i(0, 1);
  GL.glColor3f(0.0, 1.0, 0.0);
  GL.glVertex2i(-1, -1);
  GL.glColor3f(0.0, 0.0, 1.0);
  GL.glVertex2i(1, -1);
  GL.glEnd();
  GL.glFlush();
  GL.SwapBuffers(hDC);
}

function frame() {
  draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
