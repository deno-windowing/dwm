import { createWindow, mainloop } from "../mod.ts";

const win = createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

await mainloop(() => {
  console.log(win.rawHandle());
});
