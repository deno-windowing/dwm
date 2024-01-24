import { createWindow, mainloop } from "../mod.ts";

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter!.requestDevice();

const window = createWindow({
  title: "Deno Window Manager",
  width: 512,
  height: 512,
  resizable: true,
});

const { width, height } = window.framebufferSize;

const surface = window.windowSurface();

const context = surface.getContext("webgpu");

context.configure({
  device,
  format: "bgra8unorm",
  width,
  height,
});

await mainloop(() => {
  // Sine wave
  const r = Math.sin(Date.now() / 1000) / 2 + 0.5;
  const g = Math.sin(Date.now() / 1000 + 2) / 2 + 0.5;
  const b = Math.sin(Date.now() / 1000 + 4) / 2 + 0.5;

  const textureView = context.getCurrentTexture().createView();
  const renderPassDescriptor = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r, g, b, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);
  surface.present();
}, false);
