import { createWindow, getProcAddress, mainloop, pollEvents } from "../mod.ts";
import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { createContext, destroyContext, imgui } from "../ext/imgui.ts";

const window = createWindow({
  title: "DenoGL",
  width: 800,
  height: 600,
  resizable: true,
  glVersion: "v3.2",
  gles: false,
});

gl.load(getProcAddress);

addEventListener("close", (event) => {
  destroyContext(imguiContext);
});

const imguiContext = createContext(window);

await mainloop(() => {
  gl.Clear(gl.COLOR_BUFFER_BIT);
  imgui.implOpenGL3NewFrame();
  imgui.implGlfwNewFrame();
  imgui.newFrame();
  imgui.showDemoWindow(null);

  imgui.render();
  const drawData = imgui.getDrawData();

  gl.DrawArrays(gl.TRIANGLES, 0, 3);
  imgui.implOpenGL3RenderDrawData(drawData);

  window.swapBuffers();
});
