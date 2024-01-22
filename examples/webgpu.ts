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

const [system, windowHandle, displayHandle] = window.rawHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);
console.log("Display: ", displayHandle);

const surface = new Deno.UnsafeWindowSurface(
  system,
  windowHandle,
  displayHandle,
);
const context = surface.getContext("webgpu");

let pipeline: GPURenderPipeline;

const uniformLength = 5;

let uniformValues: Float32Array,
  uniformBindGroup: GPUBindGroup,
  uniformBuffer: GPUBuffer;

function createPipeline() {
  const fragEntry = "fs_main";

  const shaderModule = device.createShaderModule({
    code: `
  struct Uniforms {
      mouse: vec2f,
      clicked: f32,
      frame: f32,
  };
  
  @group(0) @binding(0) var<uniform> shaderplay: Uniforms;
  $struct VertexInput {
      @builtin(vertex_index) vertex_index: u32,
  };
  
  @vertex
  fn vs_main(in: VertexInput) -> @builtin(position) vec4<f32> {
      let x = f32(i32(in.vertex_index) - 1);
      let y = f32(i32(in.vertex_index & 1u) * 2 - 1);
      return vec4<f32>(x, y, 0.0, 1.0);
  }
  
  @fragment
  fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
      return vec4<f32>(1.0, 0.0, 0.0, 1.0);
  }
  `,
    label: "example",
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });
  pipeline = device.createRenderPipeline({
    // "auto" layout not working in Deno but works in browser
    layout: device.createPipelineLayout({
      bindGroupLayouts: [
        bindGroupLayout,
      ],
    }),
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
      buffers: [],
    },
    fragment: {
      module: shaderModule,
      entryPoint: fragEntry,
      targets: [
        {
          format: "bgra8unorm",
        },
      ],
    },
  });

  const value = new Float32Array(uniformLength);
  uniformBuffer = device.createBuffer({
    size: value.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  uniformValues = value;

  device.queue.writeBuffer(uniformBuffer, 0, value);

  uniformBindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
    ],
  });

  // window.raise();
}

createPipeline();

context.configure({
  device,
  format: "bgra8unorm",
});

addEventListener("mousemove", (evt) => {
  uniformValues[0] = evt.clientX / width;
  uniformValues[1] = evt.clientY / height;
});

addEventListener("mousedown", (evt) => {
  uniformValues[2] = 1;
});

addEventListener("mouseup", (evt) => {
  uniformValues[2] = 0;
});

await mainloop(() => {
  uniformValues[3]++; // frame++

  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();

  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });

  device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, uniformBindGroup);
  renderPass.draw(3, 1);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
  surface.present();
}, false);
