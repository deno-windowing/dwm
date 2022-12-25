import { mainloop, WindowCanvas } from "../ext/canvas.ts";
import {
  Chart,
  registerables,
} from "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js";

// deno-lint-ignore ban-ts-comment
// @ts-ignore
Chart.register(...registerables);

const win = new WindowCanvas({
  title: "Skia Canvas",
  width: 800,
  height: 600,
  resizable: true,
});

win.window.setSizeLimits(400, 300, 1600, 1200);

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

let chart = new Chart(win.canvas, options);

win.onContextLoss = () => {
  chart.destroy();
  chart = new Chart(win.canvas, options);
};

addEventListener("click", () => {
  console.log("click");
});

addEventListener("dblclick", () => {
  console.log("dblclick");
});

win.onDraw = () => {
  chart.render();
};

await mainloop(() => {
  win.draw();
});
