import { createWindow, getProcAddress, mainloop } from "../mod.ts";
import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";

const window = createWindow({
  title: "DenoGL",
  width: 800,
  height: 600,
  resizable: true,
  glVersion: "v3.2",
  gles: true,
});

gl.load(getProcAddress);

addEventListener("resize", (event) => {
  gl.Viewport(0, 0, event.width, event.height);
});

gl.ClearColor(0.0, 0.0, 0.0, 1.0);

function frame() {
  gl.Clear(gl.COLOR_BUFFER_BIT);
  window.swapBuffers();
}

await mainloop(frame);
