import { ctx, HEIGHT, WIDTH } from "./main.ts";

/** A gravitational pull in the X direction
 * (positive = right and negative = left)
 *  default = 0
 */
const gravityX = 0;

/** A gravitational pull in the positive Y direction(down to floor)
 * Have some fun! ... try a negative value
 * default = 50
 */
let gravityY = 2000;
export const setGravityY = (value: number) => {
  gravityY = value;
};

/**
 * The coefficient of restitution (COR) is the ratio
 * of the final to initial relative velocity between
 * two objects after they collide.
 *
 * This represents the amount of 'bounce' a dot will exibit.
 * 1.0 = full rebound, and 0.5 will rebound only
 * half as high as the distance fallen.
 * default = 0.5
 */
let Restitution = 0.5;
export const setRestitution = (value: number) => {
  Restitution = value;
};

/**
 * The radius of dots
 * default = 14px
 */
const Radius = 14.0;

/**
 * Half the Radius. Used in the rendering calculation of arcs(circles).
 * We pre-calculated this value to prevent the cost of calculations in loops.
 * default = 7px
 */
const HalfRadius = 7.0;

/**
 * Radius Squared is used in the calculation of distances between dots.
 * We pre-calculated this value to prevent the cost of calculations in loops.
 * default = 14 * 14
 */
const Radius_Sqrd = 14 * 14;

/**
 * The Maximum Velocity that a dot may take when it recieves a random velocity.
 * default = 1500
 */
let MaxVelocity = 1500.0;
export const setMaxVelocity = (value: number) => {
  MaxVelocity = value;
};

/**
 * Our default dot color (blue)
 */
const Color = "#44f";

/**
 * Here we draw a dot(circle) on the screen (canvas).
 * This method is used to create our 'static'
 * time-value 'numbers' and 'colons' on the screen.
 * These are rendered as simple circles.
 *
 * A similar method, DotPool.renderFreeDot, is used to
 * render animated dots using lines instead of circles.
 * This will help emulate 'particle-com-trails'. (SEE: renderFreeDot below)
 */
export const renderDot = (x: number, y: number, color?: string) => {
  ctx.fillStyle = color || Color;
  ctx.beginPath();
  ctx.arc(x, y, HalfRadius, 0, 2 * Math.PI, true);
  ctx.closePath();
  ctx.fill();
};

let idx = 0;
let i = 0;
let j = 0;
let distanceX = 0;
let distanceY = 0;
const delta = 0;
let thisDistanceSquared = 0;
let velocityDiffX = 0;
let velocityDiffY = 0;
let actualDistance = 0;

let ratioX = 0;
let ratioY = 0;
let impactSpeed = 0;
let newDotAx = 0;
let newDotAy = 0;
let newDotBx = 0;
let newDotBy = 0;

/**
 * Rather than using a variable sized set of individual Dot objects,
 * we build several fixed size arrays that provide all required
 * attributes that represent a pool of dots.
 *
 * The main benefit, is the elimination of most garbage collection
 * that building and destroying many dots at 60 frames per second
 * would produce.
 *
 * We simply activate or inactivate an index(dot), by setting the value
 * of the posX array. A positive integer in the posX array indicates
 * 'active', and a value of -1 indicates an inactive index.
 * Any index with an active posX value will be updated, tested for
 * collisions, and rendered to the canvas.
 *
 * New dot activations are always set at the lowest inactive posX-index.
 * We also maintain a 'tail pointer' to point to the highest active index.
 * This 'tail pointer' allows all 'loops' to only loop over elements presumed
 * to be active.
 * These loops, from 0 to TailPointer, will also short circuit any index in
 * the loop that is inactive (has a posX value of -1).
 *
 * When a dot falls off the edge of the canvas, its posX is set inactive(-1).
 * If that dots index is equal to the tail-pointer value, we decrement
 * the TailPointer, effectively reducing the active pool size.
 *
 * Whenever a time-change(tick) causes the production of new 'animated' dots,
 * we simply find the first inactive index, and set it active by setting its
 * posX value to the x location of the 'time-dot' that is being set free.
 * If that first free-index is greater than the current tail, we set the tail-pointer
 * value to this new index, effectivly increasing the active pool size.
 *
 * This is a very efficient use of memory, and provides very efficient dot-animation
 * updates and collision-detection, as no new memory is required for each 'tick'.
 * This reduced presure on the garbage collector eliminates 'jank' that is common with
 * many forms of javascript animation where objects are created and destroyed per 'tick'.
 */
//export class DotPool {

/** A 'fixed' maximum number of dots this pool will contain. */
const POOL_SIZE = 500;

/** An array of horizontal dot position values */
const posX: number[] = [];

/** An array of vertical dot position values */
const posY: number[] = [];

/** An array of last-known horizontal location values */
const lastX: number[] = [];

/** An array of last-known vertical location values */
const lastY: number[] = [];

/** An array of horizontal velocity values */
const velocityX: number[] = [];

/** An array of vertical velocity values */
const velocityY: number[] = [];

/** Points to the highest index that is currently set active. */
let tailPointer = 0;

/**
 * Returns a random velocity value
 * clamped by the value of MaxVelocity
 */
const randomVelocity = () => {
  return (Math.random() - 0.4) * MaxVelocity;
};

/**
 * Initializes all DotPool value arrays.
 */
export function initializeDotPool() {
  for (i = 0; i < POOL_SIZE; i++) {
    posX[i] = -1;
    posY[i] = 0;
    lastX[i] = -1;
    lastY[i] = 0;
    velocityX[i] = randomVelocity();
    velocityY[i] = randomVelocity();
  }
}

/**
 * The main entry point for DotPool animations.
 * (called from the ClockFace animation loop 'ClockFace.tick()').
 * ClockFace.tick() is triggered by window.requestAnimationFrame().
 * We would expect ~ 60 frames per second here.
 */
export const tickDots = (delta: number) => {
  delta /= 1000;
  updateDotPositions(delta);
  testForCollisions(delta);
};

/**
 * This method recalculates dot locations and velocities
 * based on a time-delta (time-change since last update).
 *
 * This method also mutates velocity/restitution whenever
 * a wall or floor collision is detected.
 */
function updateDotPositions(delta: number) {
  // loop over all 'active' dots (all dots up to the tail pointer)
  for (i = 0; i < tailPointer + 2; i++) {
    // if this dot is inactive, skip over it and go on to the next
    if (posX[i] === -1) continue;

    // use gravity to calculate our new velocity and position
    velocityX[i] += gravityX * delta;
    velocityY[i] += gravityY * delta;
    posX[i] += velocityX[i] * delta;
    posY[i] += velocityY[i] * delta;

    // did we hit a wall?
    if ((posX[i] <= Radius) || (posX[i] >= WIDTH)) {
      // has it rolled off either end on the floor?
      if (posY[i] >= HEIGHT - 2) {
        posX[i] = -1; // -1 will inactivate this dot

        // if this was the tail, decrement the tailPointer
        if (i === tailPointer) {
          tailPointer--;
        }
        continue;

        // it was'nt on the floor so ... boune it off the wall
      } else {
        if (posX[i] <= Radius) posX[i] = Radius;
        if (posX[i] >= WIDTH) posX[i] = WIDTH;
        // bounce it off the wall (restitution represents bounciness)
        velocityX[i] *= -Restitution;
      }
    }

    // did we hit the floor? If so, bounce it off the floor
    if (posY[i] >= HEIGHT) {
      posY[i] = HEIGHT;
      // bounce it off the floor (restitution represents bounciness)
      velocityY[i] *= -Restitution;
    }

    // did we hit the ceiling? If so, bounce it off the ceiling
    if (posY[i] <= Radius) {
      posY[i] = Radius;
      // bounce it off the ceiling (restitution represents bounciness)
      velocityY[i] *= -Restitution;
    }

    // draw this dot
    renderFreeDot(i);
  }
}

/**
 * This method tests for dots colliding with other dots.
 * When a collision is detected, we mutate the velocity values
 * of both of the colliding dots.
 */
function testForCollisions(delta: number) {
  // loop over all active dots in the pool
  for (i = 0; i < tailPointer + 2; i++) {
    // is this dot active?
    if (posX[i] === -1) continue;
    // test this active dot against all other active dots
    for (j = 0; j < tailPointer + 2; j++) {
      if (i === j) continue; // same dot, can't collide with self
      if (posX[j] === -1) continue; // not an active dot
      distanceX = Math.abs(posX[i] - posX[j]);
      distanceY = Math.abs(posY[i] - posY[j]);

      // for efficiency, we use only the squared-distance
      // not the square-root of the squared-distance. square-root is very expensive
      thisDistanceSquared = distanceX ** 2 + distanceY ** 2;

      // Are we about to collide?
      // here we compare the squared-distance to the squared-radius of a dot
      // again, we avoid expensive square-root calculations
      if (thisDistanceSquared < Radius_Sqrd) {
        // the distance apart is less than a dots radius ... is it about to get greater?
        // To see if dots are moving away from each other
        // we calculate a future position based on the last delta.
        if (newDistanceSquared(delta, i, j) > thisDistanceSquared) {
          // distance apart is increasing, so these dots are moving away from each other
          // just ignor and continue
          continue;
        }
        // if we got here we've collided
        collideDots(i, j, distanceX, distanceY);
      }
    }
  }
}

/**
 * This method will calculate new velocity values
 * for both of the colliding dots.
 */
function collideDots(
  dotA: number,
  dotB: number,
  distanceX: number,
  distanceY: number,
) {
  thisDistanceSquared = distanceX ** 2 + distanceY ** 2;

  velocityDiffX = velocityX[dotA] - velocityX[dotB];
  velocityDiffY = velocityY[dotA] - velocityY[dotB];

  // get the actual absolute distance (hypotenuse)
  actualDistance = Math.sqrt(thisDistanceSquared);

  // now we can callculate each dots new velocities

  // convert the distances to ratios
  ratioX = distanceX / actualDistance;
  ratioY = distanceY / actualDistance;

  // apply the speed (based on the ratios) to the velocity vectors
  impactSpeed = (velocityDiffX * ratioX) + (velocityDiffY * ratioY);
  velocityX[dotA] -= ratioX * impactSpeed;
  velocityY[dotA] -= ratioY * impactSpeed;
  velocityX[dotB] += ratioX * impactSpeed;
  velocityY[dotB] += ratioY * impactSpeed;
}

/**
 * Calculates a 'future' distance between two dots,
 * based on the last-known time-delta for the animations.
 * This is used to determin if the two dots are
 * moving toward, or away, from one another.
 */
function newDistanceSquared(delta: number, a: number, b: number) {
  newDotAx = posX[a] + (velocityX[a] * delta);
  newDotAy = posY[a] + (velocityY[a] * delta);
  newDotBx = posX[b] + (velocityX[b] * delta);
  newDotBy = posY[b] + (velocityY[b] * delta);
  return (Math.abs(newDotAx - newDotBx) ** 2) +
    (Math.abs(newDotAy - newDotBy) ** 2);
}

/**
 * Activates a dot-pool index, to create a new animated dot.
 * Whenever a time-number change causes one or more
 * dots to be 'freed' from the number display, we animated
 * them as if they exploded out of the number display.
 * We do this by activating the next available index,
 * setting its position to the position of the freed-dot,
 * and then assigning a random velocity to it.
 * If we have activated the array index pointed to by
 * tailPointer, we increment the tailPointer to maintain
 * our active pool size.
 */
export function activateDot(x: number, y: number) {
  // loop though the pool to find an unused index
  // a value of '-1' for posX is used to indicate 'inactive'
  for (idx = 0; idx < tailPointer + 2; idx++) {
    if (posX[idx] === -1) {
      // add values for this dots location (this makes it 'active')
      posX[idx] = x;
      posY[idx] = y;
      lastX[idx] = x;
      lastY[idx] = y;
      velocityX[idx] = randomVelocity();
      velocityY[idx] = randomVelocity();
      // if this is past the tail, make this the tailPointer
      if (idx > tailPointer) tailPointer = idx;

      // we're all done, break out of this loop
      break;
    }
  }
}

/**
 * This method renders a track of an animated(free)
 * dot in the dot pool.
 *
 * Rather than static circles, we actually draw short lines
 * that represent the distance traveled since the last update.
 * These lines are drawn with round ends to better represent
 * a moving dot(circle). These short lines are automatically
 * faded to black over time, to simulate a particle with a 'com-trail'.
 * SEE: ClockFace.tick() to understand this phenomenon.
 */
const renderFreeDot = (i: number) => {
  ctx.beginPath();
  ctx.fillStyle = Color;
  ctx.strokeStyle = Color;
  ctx.lineWidth = Radius;
  ctx.moveTo(lastX[i] - Radius, lastY[i] - Radius);
  ctx.lineTo(posX[i] - Radius, posY[i] - Radius);
  ctx.stroke();
  ctx.closePath();
  ctx.fill();
  lastX[i] = posX[i];
  lastY[i] = posY[i];
};
