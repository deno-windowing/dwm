import { createWindow, mainloop } from "../mod.ts";
import { createCanvas } from "https://deno.land/x/skia_canvas@0.3.1/mod.ts";

const win = createWindow({
  title: "Skia Canvas",
  width: 800,
  height: 600,
  resizable: true,
});

const fbSize = win.framebufferSize;
const canvas = createCanvas(fbSize.width, fbSize.height, true);
let ctx = canvas.getContext("2d");

let focused = true;

addEventListener("framebuffersize", (event) => {
  if (event.width === 0 || event.height === 0) return focused = false;
  focused = true;
  canvas.resize(event.width, event.height);
  ctx = canvas.getContext("2d");
});

const times: number[] = [];
let fps: number;

let mx = 0, my = 0;

addEventListener("mousemove", (e) => {
  mx = e.x;
  my = e.y;
});

function draw() {
  if (!focused) return;
  const now = performance.now();
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(mx, my, 10, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.fillStyle = "red";
  ctx.font = "20px Arial";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText(`FPS: ${fps}`, 10, 10);
  canvas.flush();
  win.swapBuffers();
}

addEventListener("refresh", draw);

await mainloop(draw);
