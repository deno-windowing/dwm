# Deno Window Manager

[![Tags](https://img.shields.io/github/release/deno-windowing/dwm)](https://github.com/deno-windowing/dwm/releases)
[![Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/dwm@0.3.0/mod.ts)
[![Checks](https://github.com/deno-windowing/dwm/actions/workflows/ci.yml/badge.svg)](https://github.com/deno-windowing/dwm/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/deno-windowing/dwm)](https://github.com/deno-windowing/dwm/blob/master/LICENSE)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/DjDeveloperr)

Cross-platform window management library for Deno.

## Example

### Creating an OpenGL Window

```ts
import {
  createWindow,
  getProcAddress,
  mainloop,
} from "https://deno.land/x/dwm@0.3.0/mod.ts";
import * as gl from "https://deno.land/x/gluten@0.1.3/api/gles23.2.ts";

const window = createWindow({
  title: "DenoGL",
  width: 800,
  height: 600,
  resizable: true,
  glVersion: "v3.2",
  gles: true,
});

gl.load(getProcAddress);

addEventListener("resize", (event) => {
  gl.Viewport(0, 0, event.width, event.height);
});

gl.ClearColor(0.0, 0.0, 0.0, 1.0);

function frame() {
  gl.Clear(gl.COLOR_BUFFER_BIT);
  window.swapBuffers();
}

await mainloop(frame);
```

### Creating a Skia Canvas Window

```ts
import {
  mainloop,
  WindowCanvas,
} from "https://deno.land/x/dwm@0.3.0/ext/canvas.ts";

const canvas = new WindowCanvas({
  title: "Skia Canvas",
  width: 800,
  height: 600,
  resizable: true,
});

canvas.onDraw = (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textBaseline = "top";
  ctx.fillText("Hello World", 10, 10);
};

await mainloop(() => {
  canvas.draw();
});
```

See [examples](./examples) for more examples!

## Usage

For drawing, you can use:

- [Deno Gluten](https://github.com/deno-windowing/gluten)
- [Skia Canvas](https://github.com/DjDeveloperr/skia_canvas) (Use
  `ext/canvas.ts` for an easy to use wrapper)
- [Deno Vulkan](https://github.com/deno-windowing/vulkan)

To package your application you can use:

- [wpack](https://github.com/deno-windowing/wpack)

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
