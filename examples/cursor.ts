import { createWindow, mainloop } from "../mod.ts";

createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

addEventListener("click", (evt) => {
  evt.window.setCursor(Math.round(Math.random()) === 0 ? "hand" : "crosshair");
});

await mainloop();
