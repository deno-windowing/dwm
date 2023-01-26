# Deno Window Manager

[![Tags](https://img.shields.io/github/release/deno-windowing/dwm)](https://github.com/deno-windowing/dwm/releases)
[![Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/dwm@0.3.0/mod.ts)
[![Checks](https://github.com/deno-windowing/dwm/actions/workflows/ci.yml/badge.svg)](https://github.com/deno-windowing/dwm/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/deno-windowing/dwm)](https://github.com/deno-windowing/dwm/blob/master/LICENSE)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/DjDeveloperr)

Cross-platform window management library for Deno.

## Example

```ts
import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.0/mod.ts";

const win = createWindow({
  title: "Hello World",
  width: 800,
  height: 600,
  resizable: true,
  // To create OpenGL context, set the version:
  glVersion: "v3.3",
  // By default, no Client API is used.
});

// For OpenGL:
// By default, context is made current when window is created
// You can also make it current manually
win.makeContextCurrent();

// You can also create Vulkan Surface using:
const surfaceKHR = win.createSurface(instancePointer);

// Many DOM events are supported, such as:

addEventListener("resize", (event) => {
  console.log("Window resized", event.width, event.height);
});

await mainloop(() => {
  // drawing logic ...

  // For OpenGL, you have to call this:
  win.swapBuffers();
});
```

For drawing, you can use:

- [Deno Gluten](https://github.com/deno-windowing/gluten)
- [Skia Canvas](https://github.com/DjDeveloperr/skia_canvas) (Use
  `ext/canvas.ts` for an easy to use wrapper)
- [Deno Vulkan](https://github.com/deno-windowing/vulkan)

To package your application you can use:

- [wpack](https://github.com/deno-windowing/wpack)

See [examples](./examples).

## Usage

Since this module depends on unstable FFI API, you need to pass `--unstable`
along with `--allow-ffi`, `--allow-write` and `--allow-env`.

```sh
deno run --unstable --allow-ffi --allow-write --allow-env <file>
```

## Maintainers

- Dj ([@DjDeveloperr](https://github.com/DjDeveloperr))
- Loading ([@load1n9](https://github.com/load1n9))

## License

[Apache-2.0](./LICENSE) licensed.

Copyright 2023 © The Deno Windowing Team
