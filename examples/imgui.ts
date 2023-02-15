import { createWindow, getProcAddress, mainloop, pollEvents } from "../mod.ts";
import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";
import { createContext, destroyContext, imgui } from "../ext/imgui.ts";

const window = createWindow({
  title: "DenoGL",
  width: 800,
  height: 600,
  resizable: true,
  glVersion: [3, 2],
  gles: true,
});

gl.load(getProcAddress);

const imguiContext = createContext(window);

function loadShader(type: number, src: string) {
  const shader = gl.CreateShader(type);
  gl.ShaderSource(
    shader,
    1,
    new Uint8Array(
      new BigUint64Array([
        BigInt(Deno.UnsafePointer.of(new TextEncoder().encode(src))),
      ]).buffer,
    ),
    new Int32Array([src.length]),
  );
  gl.CompileShader(shader);
  const status = new Int32Array(1);
  gl.GetShaderiv(shader, gl.COMPILE_STATUS, status);
  if (status[0] === gl.FALSE) {
    const logLength = new Int32Array(1);
    gl.GetShaderiv(shader, gl.INFO_LOG_LENGTH, logLength);
    const log = new Uint8Array(logLength[0]);
    gl.GetShaderInfoLog(shader, logLength[0], logLength, log);
    console.log(new TextDecoder().decode(log));
    gl.DeleteShader(shader);
    return 0;
  }
  return shader;
}

const vShaderSrc = `
  attribute vec4 vPosition;
  void main() {
    gl_Position = vPosition;
  }
  `;

const fShaderSrc = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
  `;

const vShader = loadShader(gl.VERTEX_SHADER, vShaderSrc);
const fShader = loadShader(gl.FRAGMENT_SHADER, fShaderSrc);

const program = gl.CreateProgram();
gl.AttachShader(program, vShader);
gl.AttachShader(program, fShader);

gl.BindAttribLocation(program, 0, new TextEncoder().encode("vPosition\0"));

gl.LinkProgram(program);

const status = new Int32Array(1);
gl.GetProgramiv(program, gl.LINK_STATUS, status);
if (status[0] === gl.FALSE) {
  const logLength = new Int32Array(1);
  gl.GetProgramiv(program, gl.INFO_LOG_LENGTH, logLength);
  const log = new Uint8Array(logLength[0]);
  gl.GetProgramInfoLog(program, logLength[0], logLength, log);
  console.log(new TextDecoder().decode(log));
  gl.DeleteProgram(program);
  Deno.exit(1);
}

gl.ClearColor(0.0, 0.0, 0.0, 1.0);

addEventListener("resize", (event) => {
  gl.Viewport(0, 0, event.width, event.height);
});

addEventListener("close", (event) => {
  destroyContext(imguiContext);
});

await mainloop(() => {
  gl.Clear(gl.COLOR_BUFFER_BIT);
  gl.UseProgram(program);
  // deno-fmt-ignore
  gl.VertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, new Float32Array([
      0.0, 0.5, 0.0,  
      -0.5, -0.5, 0.0,
      0.5, -0.5, 0.0,
    ]));
  gl.EnableVertexAttribArray(0);
  imgui.implOpenGL3NewFrame();
  imgui.implGlfwNewFrame();
  imgui.newFrame();
  imgui.showDemoWindow(null);

  imgui.render();
  const drawData = imgui.getDrawData();

  gl.DrawArrays(gl.TRIANGLES, 0, 3);
  imgui.implOpenGL3RenderDrawData(drawData);

  window.swapBuffers();
});
