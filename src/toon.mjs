/*! toon.mjs — ES module entry for toon.js.
 *  Loads the classic script (which registers globalThis.Toon) and re-exports its API.
 *  Usage: import { tween, arc, ease } from './toon.mjs';   // keep toon.js next to this file
 */
import './toon.js';

const Toon = globalThis.Toon;
export default Toon;
export const {
  ease, ticker, tween, wait, sequence, stagger, poses, samplePoses, straightAhead,
  arc, path, tangent, squash, impact, withSquash, Spring, Chain, wave, noise,
  exaggerate, quantize, createStage, shade, drawSolid, groundShadow, breathe, blink,
  clamp, lerp, mix,
} = Toon;
