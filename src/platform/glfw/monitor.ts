import { DwmMonitor, VideoMode } from "../../core/monitor.ts";
import { ffi } from "./ffi.ts";

const {
  glfwGetMonitorName,
  glfwGetMonitorContentScale,
  glfwGetMonitorPhysicalSize,
  glfwGetMonitorPos,
  glfwGetMonitorWorkarea,
  glfwGetVideoMode,
  glfwGetVideoModes,
  glfwGetMonitors,
  glfwGetPrimaryMonitor,
} = ffi;

const F32_1 = new Float32Array(1);
const F32_2 = new Float32Array(1);
const I32_1 = new Int32Array(1);
const I32_2 = new Int32Array(1);
const I32_3 = new Int32Array(1);
const I32_4 = new Int32Array(1);

function readVideoMode(ptr: Deno.PointerValue): VideoMode {
  const buf = new Deno.UnsafePointerView(ptr!);
  return {
    width: buf.getInt32(0),
    height: buf.getInt32(4),
    redBits: buf.getInt32(8),
    greenBits: buf.getInt32(12),
    blueBits: buf.getInt32(16),
    refreshRate: buf.getInt32(20),
  };
}

export function getMonitors() {
  const ptr = glfwGetMonitors(I32_1);
  if (ptr === null) throw new Error("could not get monitors");
  const ptrView = new Deno.UnsafePointerView(ptr);
  const count = I32_1[0];
  const monitors: MonitorGlfw[] = [];
  for (let i = 0; i < count; i++) {
    monitors.push(
      new MonitorGlfw(Deno.UnsafePointer.create(ptrView.getBigUint64(i * 8))),
    );
  }
  return monitors;
}

export function getPrimaryMonitor() {
  return new MonitorGlfw(glfwGetPrimaryMonitor());
}

export class MonitorGlfw extends DwmMonitor {
  constructor(public nativeHandle: Deno.PointerValue = null) {
    super();
    if (nativeHandle == null) {
      throw new Error("Invalid monitor handle");
    }
  }

  get name() {
    const ptr = glfwGetMonitorName(this.nativeHandle);
    if (ptr === null) return "";
    return Deno.UnsafePointerView.getCString(ptr);
  }

  get position() {
    glfwGetMonitorPos(this.nativeHandle, I32_1, I32_2);
    return { x: I32_1[0], y: I32_2[0] };
  }

  get workArea() {
    glfwGetMonitorWorkarea(this.nativeHandle, I32_1, I32_2, I32_3, I32_4);
    return { x: I32_1[0], y: I32_2[0], width: I32_3[0], height: I32_4[0] };
  }

  get physicalSize() {
    glfwGetMonitorPhysicalSize(this.nativeHandle, I32_1, I32_2);
    return { width: I32_1[0], height: I32_2[0] };
  }

  get contentScale() {
    glfwGetMonitorContentScale(this.nativeHandle, F32_1, F32_2);
    return { x: F32_1[0], y: F32_2[0] };
  }

  get videoMode() {
    return readVideoMode(glfwGetVideoMode(this.nativeHandle));
  }

  get videoModes() {
    const ptr = glfwGetVideoModes(this.nativeHandle, I32_1);
    const count = I32_1[0];
    const modes: VideoMode[] = [];
    for (let i = 0; i < count; i++) {
      modes.push(
        readVideoMode(
          Deno.UnsafePointer.create(
            BigInt(Deno.UnsafePointer.value(ptr)) + BigInt(i) * 24n,
          ),
        ),
      );
    }
    return modes;
  }

  // deno-lint-ignore no-explicit-any
  [Symbol.for("Deno.customInspect")](_inspect: CallableFunction, options: any) {
    return `DwmMonitor<GLFW> ${
      Deno.inspect({
        name: this.name,
        position: this.position,
        workArea: this.workArea,
        physicalSize: this.physicalSize,
        contentScale: this.contentScale,
        videoMode: this.videoMode,
        videoModes: this.videoModes,
      }, options).split("\n").map((e, i) =>
        i == 0 ? e : `${" ".repeat(options.indentLevel ?? 0)}${e}`
      ).join("\n")
    }`;
  }
}
