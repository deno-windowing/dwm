import { createWindow, pollEvents } from "../mod.ts";

const window = createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

while (!window.closed) {
  pollEvents();
}
