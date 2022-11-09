import { createWindow } from "../mod.ts";
import * as Gdi from "https://raw.githubusercontent.com/DjDeveloperr/deno_win32/main/api/Graphics/Gdi.ts";
import { Wm } from "../src/platform/win/deps.ts";

const window = createWindow({
  title: "Deno Window Manager",
  width: 800,
  height: 600,
  resizable: true,
});

const paint = Gdi.allocPAINTSTRUCT();

const window2 = createWindow({
  title: "Deno Window Manager 2",
  width: 300,
  height: 300,
  parent: window,
});

addEventListener("redrawRequested", (event) => {
  const hdc = Gdi.BeginPaint(event.window.nativeHandle, paint);
  const rect = Gdi.allocRECT();
  Wm.GetClientRect(event.window.nativeHandle, rect);
  Gdi.FillRect(hdc, rect, Gdi.GetStockObject(Gdi.WHITE_BRUSH));
  const msg = event.window.id === window2.id
    ? "Hello, From Child Window!"
    : "Hello Parent Window!";
  Gdi.TextOutA(hdc, 0, 0, msg, msg.length);
  Gdi.EndPaint(event.window.nativeHandle, paint);
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

addEventListener("contextmenu", (evt) => {
  console.log("contextmenu", evt.button, evt.clientX, evt.clientY);
});

addEventListener("mousedown", (evt) => {
  console.log("mousedown", evt.button, evt.clientX, evt.clientY);
});

addEventListener("mouseup", (evt) => {
  console.log("mouseup", evt.button, evt.clientX, evt.clientY);
});
