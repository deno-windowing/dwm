import { createWindow, mainloop } from "../mod.ts";
import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

const win = createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

win.setIcon(decode(Deno.readFileSync("examples/assets/cursor.png")));

await mainloop();
