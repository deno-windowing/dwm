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

const shaderCode = `
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    let x = f32(i32(in_vertex_index) - 1);
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1);
    return vec4<f32>(x, y, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`;

const shaderModule = window.device.createShaderModule({
  code: shaderCode,
});

const pipelineLayout = window.device.createPipelineLayout({
  bindGroupLayouts: [],
});

const renderPipeline = window.device.createRenderPipeline({
  layout: pipelineLayout,
  vertex: {
    module: shaderModule,
    entryPoint: "vs_main",
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fs_main",
    targets: [
      {
        format: "bgra8unorm",
      },
    ],
  },
});
mainloop(() => {
  const encoder = window.device.createCommandEncoder();
  const texture = context.getCurrentTexture().createView();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: texture,
        storeOp: "store",
        loadOp: "clear",
        clearValue: { r: 0, g: 1, b: 0, a: 1.0 },
      },
    ],
  });
  renderPass.setPipeline(renderPipeline);
  renderPass.draw(3, 1);
  renderPass.end();
  window.device.queue.submit([encoder.finish()]);
  window.surface.present();
}, false);
