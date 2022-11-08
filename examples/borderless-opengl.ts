import { createWindow, DwmWindow, pollEvents } from "../mod.ts";
import * as Gdi from "https://raw.githubusercontent.com/DjDeveloperr/deno_win32/main/api/Graphics/Gdi.ts";
import * as GL from "https://raw.githubusercontent.com/DjDeveloperr/deno_win32/main/api/Graphics/OpenGL.ts";
import {
  blur,
  extendClient,
} from "https://raw.githubusercontent.com/deno-windowing/flint/main/mod.ts";

const paint = Gdi.allocPAINTSTRUCT();

function createOpenGL(win: DwmWindow) {
  const hdc = Gdi.GetDC(win.nativeHandle);
  const pfd = GL.allocPIXELFORMATDESCRIPTOR({
    nSize: 40,
    nVersion: 1,
    dwFlags: GL.PFD_DRAW_TO_WINDOW | GL.PFD_SUPPORT_OPENGL | 0,
    iPixelType: GL.PFD_TYPE_RGBA,
    cColorBits: 32,
  });
  const pf = GL.ChoosePixelFormat(hdc, pfd);
  if (!pf) {
    throw new Error(
      "ChoosePixelFormat() failed: Cannot find a suitable pixel format.",
    );
  }

  if (!GL.SetPixelFormat(hdc, pf, pfd)) {
    throw new Error("SetPixelFormat() failed: Cannot set format specified.");
  }

  GL.DescribePixelFormat(hdc, pf, pfd.byteLength, pfd);

  Gdi.ReleaseDC(win.nativeHandle, hdc);
  blur(win);
  extendClient(win);
}

addEventListener("redrawRequested", (event) => {
  Gdi.BeginPaint(event.window.nativeHandle, paint);
  Gdi.EndPaint(event.window.nativeHandle, paint);
});

addEventListener("resize", (event) => {
  GL.glViewport(0, 0, event.width & 0xffff, event.height >> 16);
  Gdi.BeginPaint(event.window.nativeHandle, paint);
  Gdi.EndPaint(event.window.nativeHandle, paint);
});

const window = createWindow({
  title: "",
  width: 800,
  height: 600,
  palette: true,
  removeSystemMenu: true,
});

createOpenGL(window);

const hDC = Gdi.GetDC(window.nativeHandle);
const hRC = GL.wglCreateContext(hDC);
GL.wglMakeCurrent(hDC, hRC);

while (!window.closed) {
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
  pollEvents();
}
