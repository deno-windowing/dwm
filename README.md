# Deno Window Manager

[![Tags](https://img.shields.io/github/release/DjDeveloperr/dwm)](https://github.com/DjDeveloperr/dwm/releases)
[![Doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/dwm@0.1.0/mod.ts)
[![Checks](https://github.com/DjDeveloperr/dwm/actions/workflows/ci.yml/badge.svg)](https://github.com/DjDeveloperr/dwm/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/DjDeveloperr/dwm)](https://github.com/DjDeveloperr/dwm/blob/master/LICENSE)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/DjDeveloperr)

Cross-platform window creation and management for Deno.

## Example

```ts
import { createWindow, pollEvents } from "https://deno.land/x/dwm@0.1.0/mod.ts";

const win = createWindow({
  title: "Hello World",
  width: 800,
  height: 600,
});

addEventListener("windowClose", (event) => {
  console.log("Window closed:", event.window.title);
});

while (!win.closed) {
  pollEvents();
}
```

## Usage

Since this module depends on unstable FFI API, you need to pass `--unstable`
along with `--allow-ffi`.

```sh
deno run --unstable --allow-ffi <file>
```

## License

[Apache-2.0](./LICENSE) licensed.

Copyright 2022 © DjDeveloperr
