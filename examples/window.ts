import { createWindow } from "../mod.ts";

createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

addEventListener("resize", (event) => {
  console.log("Window resized", event.width, event.height);
});
