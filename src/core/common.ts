export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageStruct {
  image: Uint8Array;
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LTRB {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
