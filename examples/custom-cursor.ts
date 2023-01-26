import {
  CanvasRenderingContext2D,
  mainloop,
  WindowCanvas,
} from "../ext/canvas.ts";
import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

const canvasW = new WindowCanvas({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

const file = await Deno.readFile("examples/assets/cursor.png");
const png = decode(file);

//This bellow is a Custom RGBA Cursor of 16x16 pixels, each pixel is 4 bytes (RGBA)
const cursor = new Uint8Array(16 * 16 * 4);
for (let i = 0; i < 16; i++) {
  cursor[i * 16 * 4 + i * 4 + 3] = 255;
  cursor[i * 16 * 4 + (15 - i) * 4 + 3] = 255;
}

let current = 0;

canvasW.window.setCustomCursor(png.image, {
  width: 32,
  height: 32,
}, {
  x: 0,
  y: 0,
});

addEventListener("click", (evt) => {
  if (current == 0) {
    canvasW.window.setCustomCursor(png.image, {
      width: 32,
      height: 32,
    }, {
      x: 0,
      y: 0,
    });
    current = 1;
  } else {
    canvasW.window.setCustomCursor(cursor, {
      width: 16,
      height: 16,
    }, {
      x: 0,
      y: 0,
    });
    current = 0;
  }
});

canvasW.onDraw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(
    0,
    0,
    canvasW.canvas.width,
    canvasW.canvas.height,
  );
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasW.canvas.width, canvasW.canvas.height);

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Click to change the cursor", 10, 50);
};

await mainloop(() => {
  canvasW.draw();
});
