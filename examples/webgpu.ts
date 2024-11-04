import { createWindowGPU, mainloop } from "../ext/webgpu.ts";

const window = await createWindowGPU({
  title: "Deno Window Manager",
  width: 512,
  height: 512,
  resizable: true,
});

const context = window.getContext("webgpu");

context.configure({
  device: window.device,
  format: "bgra8unorm",
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
        loadOp: "clear" as const,
        storeOp: "store" as const,
      },
    ],
  };

  const commandEncoder = window.device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.end();

  window.device.queue.submit([commandEncoder.finish()]);
  window.surface.present();
}, false);
