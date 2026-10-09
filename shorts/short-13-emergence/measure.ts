// measure.ts — dev verification for short-13. Runs the exact sim the composition
// will draw from and prints the numbers the script is allowed to claim.
// Usage: cd shorts-creator && bun shorts/short-13-emergence/measure.ts
import { simulateRing, measureJam } from '../../remotion/src/lib/agents';

const sim = simulateRing({});
const { opts } = sim;
const n = opts.n;
const dt = opts.dt;
const vmax = opts.vmax;

// 1) does the tap nucleate a jam, and when is it mature?
const slow = (k: number) => {
  let c = 0;
  for (let i = 0; i < n; i++) if (sim.vel[k * n + i] < 0.35 * vmax) c++;
  return c / n;
};
let firstJam = -1;
let mature = -1;
for (let k = 0; k < sim.steps; k++) {
  const frac = slow(k);
  if (frac >= 0.2 && firstJam < 0) firstJam = k * dt;
  if (frac >= 0.45 && mature < 0) mature = k * dt;
}
console.log(`tap at t=${opts.tTap}s  ->  first jam (>=20% cars slow) at t=${firstJam?.toFixed(1)}s  ->  mature (>=45%) at t=${mature?.toFixed(1)}s`);

// 2) jam fraction over time (sampled)
for (let t = 0; t <= opts.tEnd; t += 5) {
  const k = Math.floor(t / dt);
  const meanV = Array.from({ length: n }, (_, i) => sim.vel[k * n + i]).reduce((a, b) => a + b, 0) / n;
  console.log(`  t=${String(t).padStart(3)}s  jam=${(slow(k) * 100).toFixed(0).padStart(3)}%  mean speed=${(meanV * 3.6).toFixed(0)} km/h`);
}

// 3) the wave speed, measured
const m = measureJam(sim, 50, 95);
console.log(`\nwave speed: ${m.waveSpeedKmh.toFixed(1)} km/h  (negative = BACKWARD through traffic)`);
console.log(`avg jam fraction in window: ${(m.jamFraction * 100).toFixed(0)}%   max: ${(m.maxJamFraction * 100).toFixed(0)}%`);

// 4) where the crest sits at candidate hook states
for (const t of [55, 70, 85, 95]) {
  const k = Math.floor(t / dt);
  const arc = m.jamArc(k);
  console.log(`  crest at t=${t}s: arc=${arc === null ? 'none' : arc.toFixed(1)} m (${((arc! / opts.length) * 100).toFixed(0)}% of the ring)`);
}

// 5) per-car escape check: does one car pass THROUGH the jam and out the front?
const i = 5;
let inJam = false;
let passes = 0;
for (let k = 0; k < sim.steps; k++) {
  const isIn = sim.vel[k * n + i] < 0.35 * vmax;
  if (isIn && !inJam) passes++;
  inJam = isIn;
}
console.log(`\ncar #5 enters the jam ${passes} time(s) over ${opts.tEnd}s — cars pass through, the wave stays.`);
