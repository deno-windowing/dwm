import { createWindow, mainloop } from "../mod.ts";

const shaderFile = Deno.args[0];
if (!shaderFile) {
  console.error("No shader file provided");
  Deno.exit(1);
}

const width = 512;
const height = 512;

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter!.requestDevice();

const window = createWindow({
  title: "Deno Window Manager",
  width,
  height,
  resizable: true,
});

const [system, windowHandle, displayHandle] = window.rawHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);
console.log("Display: ", displayHandle);

// @ts-expect-error TODO
const context = createWindowSurface(system, windowHandle, displayHandle);

let pipeline: GPURenderPipeline;

const fragPrelude = `
struct Uniforms {
    mouse: vec2f,
    clicked: f32,
    frame: f32,
};

@group(0) @binding(0) var<uniform> shaderplay: Uniforms;
`;
const uniformLength = 5;

let uniformValues: Float32Array,
  uniformBindGroup: GPUBindGroup,
  uniformBuffer: GPUBuffer;

function createPipeline() {
  let shader = Deno.readTextFileSync(shaderFile);
  const fragEntry = "fs_main";

  shader = `${fragPrelude}\n${shader}`;

  const shaderModule = device.createShaderModule({
    code: shader,
    label: shaderFile,
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
  width,
  height,
});

(async () => {
  const wacher = Deno.watchFs(shaderFile);
  for await (const _event of wacher) {
    console.log("Shader changed, reloading...");
    createPipeline();
  }
})();

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
  context.present();
}, false);
