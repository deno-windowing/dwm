// deno-lint-ignore-file no-explicit-any
import { DwmWindow } from "../mod.ts";
import * as imgui from "https://raw.githubusercontent.com/djfos/dimgui/main/src/call.ts";
export * from "https://raw.githubusercontent.com/djfos/dimgui/main/src/type.ts";

export function createContext(window: DwmWindow) {
  const imguiContext = imgui.createContext();
  imgui.implGlfwInitForOpenGL(window.nativeHandle);
  imgui.implOpenGL3Init("#version 130");
  return imguiContext;
}

export function destroyContext(ctx: any) {
  imgui.implOpenGL3Shutdown();
  imgui.implGlfwShutdown();
  imgui.destroyContext(ctx);
}

export { imgui };
