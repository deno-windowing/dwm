# Deno Window Manager

[![Tags](https://img.shields.io/github/release/deno-windowing/dwm)](https://github.com/deno-windowing/dwm/releases)
[![Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/dwm@0.1.0/mod.ts)
[![Checks](https://github.com/deno-windowing/dwm/actions/workflows/ci.yml/badge.svg)](https://github.com/deno-windowing/dwm/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/deno-windowing/dwm)](https://github.com/deno-windowing/dwm/blob/master/LICENSE)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/DjDeveloperr)

Cross-platform window management and OpenGL context creation library for Deno.

## Example

```ts
import { createWindow, mainloop } from "https://deno.land/x/dwm@0.1.0/mod.ts";

const win = createWindow({
  title: "Hello World",
  width: 800,
  height: 600,
  resizable: true,
  // Optionally specify GL context version
  glVersion: [3, 3],
});

// By default, context is made current when window is created
// You can also make it current manually
win.makeContextCurrent();

// Many DOM events are supported, such as:

addEventListener("resize", (event) => {
  console.log("Window resized", event.width, event.height);
});

await mainloop(() => {
  // drawing logic ...
  win.swapBuffers();
});
```

For drawing, you can use
[Deno Gluten](https://github.com/deno-windowing/gluten), or even along with
[Skia Canvas](https://github.com/DjDeveloperr/skia_canvas).

See [examples](./examples).

## Usage

Since this module depends on unstable FFI API, you need to pass `--unstable`
along with `--allow-ffi`.

```sh
deno run --unstable --allow-ffi <file>
```

## Maintainers

- Dj ([@DjDeveloperr](https://github.com/DjDeveloperr))
- Loading ([@load1n9](https://github.com/load1n9))

## License

[Apache-2.0](./LICENSE) licensed.

Copyright 2022 © The Deno Windowing Team
