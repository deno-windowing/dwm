import { createWindow } from "../mod.ts";

createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

addEventListener("mousemove", (e) => {
  console.log(e.x, e.y);
});

addEventListener("resize", (event) => {
  console.log("Window resized", event.width, event.height);
});
