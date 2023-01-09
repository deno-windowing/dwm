import { createWindow, mainloop } from "../mod.ts";
import * as GL from "https://win32.deno.dev/main/Graphics.OpenGL";

addEventListener("resize", (event) => {
  GL.glViewport(0, 0, event.width, event.height);
});

const window = createWindow({
  title: "Deno DWM OpenGL",
  width: 800,
  height: 600,
  resizable: true,
  glVersion: "v1.1",
});

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
  window.swapBuffers();
}

await mainloop(draw);
