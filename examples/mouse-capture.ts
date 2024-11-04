import {
  type CanvasRenderingContext2D,
  mainloop,
  WindowCanvas,
} from "../ext/canvas.ts";

const canvasW = new WindowCanvas({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

/// Define the Input mode of the cursor to disabled, this gives us the ability to
/// capture the cursor exclusively to the window.
canvasW.window.setInputMode("cursor", "disabled");

addEventListener("focus", (evt) => {
  /// When unfocused, set the cursor to normal, when focused, set the cursor to disabled
  canvasW.window.setInputMode("cursor", evt.focused ? "disabled" : "normal");
});

/// When the escape key is pressed, set the cursor to normal
addEventListener("keydown", (evt) => {
  if (evt.code === "Escape") {
    canvasW.window.setInputMode("cursor", "normal");
  }
});

const Cursor = {
  x: 0,
  y: 0,
};

addEventListener("mousemove", (evt) => {
  if (!canvasW.window.focused) {
    evt.preventDefault();
    return;
  }
  Cursor.x = evt.x;
  Cursor.y = evt.y;
});
/// On click to the window capture the cursor if its not already captured
addEventListener("click", (evt) => {
  if (canvasW.window.getInputMode("cursor") === "disabled") {
    return;
  }
  canvasW.window.setInputMode("cursor", "disabled");
});

canvasW.onDraw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(
    0,
    0,
    canvasW.canvas.width,
    canvasW.canvas.height,
  );
  //draw cursor
  ctx.fillStyle = "black";

  ctx.fillRect(
    0,
    0,
    canvasW.canvas.width,
    canvasW.canvas.height,
  );
  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.arc(
    Cursor.x,
    Cursor.y,
    5,
    0,
    Math.PI * 2,
    true,
  );
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(
    `Cursor: ${Cursor.x} ${Cursor.y}`,
    10,
    20,
  );

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(
    `Pressing escape will release the cursor`,
    10,
    40,
  );
  ctx.fillText(
    `Cursor is ${
      canvasW.window.getInputMode("cursor") === "disabled"
        ? "Captured"
        : "Released"
    }`,
    10,
    60,
  );
};
await mainloop(() => {
  canvasW.draw();
});
