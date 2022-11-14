import { createWindow, mainloop } from "../mod.ts";
import { createCanvas } from "https://deno.land/x/skia_canvas@0.3.1/mod.ts";
// @deno-types="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/types/index.esm.d.ts"
import {
  Chart,
  registerables,
} from "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js";

Chart.register(...registerables);

const win = createWindow({
  title: "Skia Canvas",
  width: 800,
  height: 600,
  resizable: true,
  glVersion: [3, 3],
});

const fbSize = win.framebufferSize;
const canvas = createCanvas(fbSize.width, fbSize.height, true);

const data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [{
    label: "Looping tension",
    data: [65, 59, 80, 81, 26, 55, 40],
    fill: false,
    borderColor: "rgb(75, 192, 192)",
  }],
};

const options = {
  type: "line",
  data: data,
  options: {
    animations: {
      tension: {
        duration: 1000,
        easing: "linear",
        from: 1,
        to: 0,
        loop: true,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  },
  plugins: [
    {
      id: "custom_canvas_background_color",
      beforeDraw: (chart: Chart) => {
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    },
  ],
};

let chart = new Chart(canvas, options);

let focused = true;

addEventListener("framebuffersize", (event) => {
  if (event.width === 0 || event.height === 0) return focused = false;
  focused = true;
  canvas.resize(event.width, event.height);
  chart.destroy();
  chart = new Chart(canvas, options);
});

await mainloop(() => {
  if (!focused) return;
  chart.render();
  canvas.flush();
  win.swapBuffers();
});
