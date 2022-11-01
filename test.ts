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

addEventListener("keydown", (event) => {
  console.log("Keydown", event.key, event.code);
});

while (!window.closed) {
  pollEvents();
}
