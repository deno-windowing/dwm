import { createWindow, mainloop } from "../mod.ts";

createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

await mainloop();
