const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const encodeString = (str: string | Uint8Array): Uint8Array =>
  typeof str !== "string" ? str : textEncoder.encode(str);

export const decodeString = (buf: Uint8Array | string): string =>
  typeof buf == "string" ? buf : textDecoder.decode(buf);

export function fromCstr(str: string): Uint8Array {
  const buf = new Uint8Array(str.length + 1);
  textEncoder.encodeInto(str, buf);
  return buf;
}
export const toCstr = (ptr: Deno.PointerValue, offset?: number) =>
  Deno.UnsafePointerView.getCString(ptr, offset);
