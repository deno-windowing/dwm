import { createWindow, mainloop } from "../mod.ts";
import { applyDark, applyLight } from "../ext/styles/mod.ts";

const win = createWindow({
  title: "light",
  width: 800,
  height: 600,
  resizable: true,
});
const win2 = createWindow({
  title: "dark",
  width: 800,
  height: 600,
  resizable: true,
});

applyDark(win2);
applyLight(win);

win.position = {
  x: 100,
  y: 100,
};

win2.position = {
  x: 1000,
  y: 100,
};

await mainloop();
