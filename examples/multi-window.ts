import { createWindow, mainloop } from "../mod.ts";

createWindow({
  title: "Window1",
  width: 800,
  height: 600,
  resizable: true,
});

createWindow({
  title: "Window2",
  width: 800,
  height: 600,
  resizable: true,
});

await mainloop();
