import { createWindow, mainloop } from "../mod.ts";

createWindow({
  title: "DwmWindow",
  width: 800,
  height: 600,
  resizable: true,
});

addEventListener("close", (event) => {
  console.log("Closing window", event.window.title);
});

addEventListener("resize", (event) => {
  console.log("Window resized", event.width, event.height);
});

addEventListener("dblclick", (evt) => {
  console.log("dblclick", evt.button, evt.clientX, evt.clientY);
});

addEventListener("click", (evt) => {
  console.log("click", evt.button, evt.clientX, evt.clientY);
});

addEventListener("mousedown", (evt) => {
  console.log("mousedown", evt.button, evt.clientX, evt.clientY);
});

addEventListener("mouseup", (evt) => {
  console.log("mouseup", evt.button, evt.clientX, evt.clientY);
});

addEventListener("focus", (evt) => {
  console.log("focus", evt.window.title, evt.focused);
});

addEventListener("move", (evt) => {
  console.log("move", evt.window.title, evt.x, evt.y);
});

addEventListener("refresh", (evt) => {
  console.log("refresh", evt.window.title);
});

addEventListener("framebuffersize", (evt) => {
  console.log("framebufersize", evt.window.title, evt.width, evt.height);
});

addEventListener("minimize", (evt) => {
  console.log("minimize", evt.window.title, evt.minimized);
});

addEventListener("maximize", (evt) => {
  console.log("maximize", evt.window.title, evt.maximized);
});

addEventListener("drop", (evt) => {
  console.log("drop", evt.window.title, evt.files);
  evt.files.forEach((file) => {
    Deno.readTextFile(file).then((text) => {
      console.log(file, text);
    });
  });
});

addEventListener("keydown", (evt) => {
  console.log("keydown", evt.window.title, evt.key);
});

addEventListener("keyup", (evt) => {
  console.log("keyup", evt.window.title, evt.key);
});

addEventListener("scroll", (evt) => {
  console.log("scroll", evt.window.title, evt.scrollX, evt.scrollY);
});

await mainloop();
