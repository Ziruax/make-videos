// scan.ts — find IDM parameters where 22 cars on the 230 m ring produce a LOCALIZED
// backward-moving jam (Sugiyama 2008's phenomenon), not a full gridlock.
import { simulateRing, measureJam } from '../../remotion/src/lib/agents';

const rows: string[] = [];
for (const T of [0.6, 0.66, 0.72, 0.8]) {
  for (const s0 of [0.5, 1.0, 1.5]) {
    for (const jitter of [0.015, 0.045]) {
      for (const tapDecel of [1.5, 2.0, 3.0]) {
        const sim = simulateRing({ T, s0, jitter, tapDecel, tapDur: 0.6, tEnd: 80 });
        const n = sim.opts.n;
        const dt = sim.opts.dt;
        const slow = (k: number) => {
          let c = 0;
          for (let i = 0; i < n; i++) if (sim.vel[k * n + i] < 0.35 * sim.opts.v0) c++;
          return c / n;
        };
        const meanV = (t: number) => {
          const k = Math.floor(t / dt);
          return (Array.from({ length: n }, (_, i) => sim.vel[k * n + i]).reduce((a, b) => a + b, 0) / n) * 3.6;
        };
        const m = measureJam(sim, 45, 78);
        const jamFinal = slow(Math.floor(75 / dt));
        rows.push(
          `T=${T} s0=${s0} jit=${jitter} tap=${tapDecel} | v0=${meanV(2).toFixed(0)}km/h -> final ${meanV(75).toFixed(0)}km/h | jam=${(jamFinal * 100).toFixed(0)}% | wave=${m.waveSpeedKmh.toFixed(1)}km/h`
        );
      }
    }
  }
}
console.log(rows.join('\n'));
