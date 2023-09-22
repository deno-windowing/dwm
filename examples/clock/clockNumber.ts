import { activateDot, renderDot } from "./dotPool.ts";
import { DOT_HEIGHT, DOT_WIDTH } from "./main.ts";

/**
 * This class creates an array of physical locations
 * that will be used as a 4 x 7 dot matrix.
 * This array will be manipulted to represent a
 * seven segment numeric display.
 * Each dot position will be active or inactive
 * based on a set of numeric 'masks' that represent
 * the numbers 0 to 9
 */
export interface ClockNumber {
  x: number;
  y: number;
  drawPixels(px: number[][]): void;
}

export const MatrixWidth = 4;
export const MatrixHeight = 7;

let dot = { x: 0, y: 0 };

/**
 * Create a new ClockNumber object and
 * initialize its dot array based on the
 * passed in location parameters.
 */
export function createNumber(x: number, y: number): ClockNumber {
  // set location for this display
  const left = x;
  const top = y;

  /**
   * A 2 dimensional array of points
   * as a 4 x 7 matrix, that contains a mask
   * of values 0 or 1 to indicate active pixels
   */
  let currentPixelMask: number[][];

  /** A 2 dimensional array of point locations(dots) as a 4 x 7 matrix */
  const dotLocations: { x: number; y: number }[][] = new Array(MatrixHeight);

  for (let i = 0; i < MatrixHeight; ++i) {
    dotLocations[i] = new Array(MatrixWidth);
  }

  // calculate/set each location of our dots
  for (let y = 0; y < MatrixHeight; ++y) {
    for (let x = 0; x < MatrixWidth; ++x) {
      const xx = left + (x * DOT_WIDTH);
      const yy = top + (y * DOT_HEIGHT);
      dotLocations[y][x] = {
        x: xx,
        y: yy,
      };
    }
  }

  /**
   * Draw the visual pixels(dots) for a given number,
   * based on a lookup in an array of pixel masks.
   * SEE: the PIXELS array below.
   * If a value in the mask is set to 1, that position in
   * the display will have a visual dot displayed.
   * .
   * .
   * On a number change, any active dot that is not required
   * to be active in the new number, will be set free ...
   * That is, it will be 'activated' in the DotPool, becoming
   * an animated dot.
   */
  return {
    x: left,
    y: top,
    drawPixels: (newPixelMask: number[][]) => {
      for (y = 0; y < MatrixHeight; ++y) {
        for (x = 0; x < MatrixWidth; ++x) {
          dot = dotLocations[y][x];
          if (currentPixelMask != null) {
            // if this dot is 'on', and it is not required for the new number
            if ((currentPixelMask[y][x] !== 0) && (newPixelMask[y][x] === 0)) {
              // activate it as a 'free' animated dot
              activateDot(dot.x, dot.y);
            }
          }
          // if this dot is an active member of this number mask
          if (newPixelMask[y][x] === 1) {
            // render it to the canvas
            renderDot(dot.x, dot.y);
          }
        }
      }
      // Set the current pixel mask to this new mask. Used to
      // evaluate pixels to be 'freed' during next update.
      currentPixelMask = newPixelMask;
    },
  };
}

/**
 * A lookup array of 10 pixel masks(0-9).
 * Each mask(array) represents the pixels of
 * a 4 x 7 matrix of dots that are used to
 * display a 7 segment numeric display.
 * If a value in the mask is set to 1, that position
 * in this display will have a visual dot displayed.
 * A value of 0 will not be displayed.
 */
export const PIXELS = [
  // 'zero'
  [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  // 'one'
  [
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
  ],
  // 'two'
  [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  // 'three'
  [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  // 'four'
  [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
  ],
  // 'five'
  [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  // 'six'
  [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  // 'seven'
  [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
  ],
  // 'eight'
  [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  // 'nine'
  [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
  ],
];
