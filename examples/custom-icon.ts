import { createWindow, mainloop } from "../mod.ts";
import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

const win = createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

const img = await fetch(
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bell%20pepper/3D/bell_pepper_3d.png",
);
win.setIcon(decode(new Uint8Array(await img.arrayBuffer())));

await mainloop();
