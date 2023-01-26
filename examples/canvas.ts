import { mainloop, WindowCanvas } from "../ext/canvas.ts";

const win = new WindowCanvas({
  title: "Skia Canvas",
  width: 800,
  height: 600,
  resizable: true,
});

win.onDraw = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textBaseline = "top";
  ctx.fillText("Hello World", 10, 10);
};

await mainloop(() => {
  win.draw();
});
