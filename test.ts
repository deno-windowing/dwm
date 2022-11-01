import { createWindow, pollEvents } from "./mod.ts";

const window = createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

// const window2 = createWindow({
//   title: "Deno Window Manager 2",
//   width: 300,
//   height: 300,
//   parent: window,
// });

addEventListener("close", (event) => {
  // event.preventDefault();
  console.log("Closing window", event.window.title);
});

addEventListener("resize", (event) => {
  console.log("Window resized", event.width, event.height);
});

// addEventListener("keydown", (event) => {
//   console.log("Keydown", event.key, event.code);
// });

addEventListener("dblclick", (evt) => {
  console.log("dblclick", evt.button, evt.clientX, evt.clientY);
});

addEventListener("click", (evt) => {
  console.log("click", evt.button, evt.clientX, evt.clientY);
});

addEventListener("contextmenu", (evt) => {
  console.log("contextmenu", evt.button, evt.clientX, evt.clientY);
});

// addEventListener("mousemove", (evt) => {
//   console.log(
//     "mousemove",
//     evt.clientX,
//     evt.clientY,
//     evt.movementX,
//     evt.movementY,
//   );
// });

addEventListener("mousedown", (evt) => {
  console.log("mousedown", evt.button, evt.clientX, evt.clientY);
});

addEventListener("mouseup", (evt) => {
  console.log("mouseup", evt.button, evt.clientX, evt.clientY);
});

while (!window.closed) {
  pollEvents();
}
