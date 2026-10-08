// Determinism check: render the same frames TWICE from one bundle and compare bytes.
//   node scripts/determinism.mjs Short1Chess 0,140,290,540
// Two renders of the same frame must be byte-identical (vidtsx hard rules: every
// animated state is a pure function of the frame). Catches unseeded Math.random,
// Date.now reads, and per-render state. Cheap: bundles once, renders each frame
// twice at QA scale.
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';
import { createHash } from 'crypto';
import { mkdirSync, readFileSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
const frames = (process.argv[3] ?? '0').split(',').map((n) => Number(n.trim()));

if (!id) {
  console.error('usage: node scripts/determinism.mjs <CompId> <f1,f2,...>');
  process.exit(1);
}

const tmp = path.join(root, 'out', 'qa', 'det-tmp');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

console.log('bundling...');
// publicDir must be passed explicitly (see frames.mjs): ../media is the public root.
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, '..', 'media') });
const composition = await selectComposition({ serveUrl, id });

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);

let bad = 0;
const pick = frames.length ? frames : [0, Math.floor(composition.durationInFrames / 2), composition.durationInFrames - 1];
for (const raw of pick) {
  const f = Math.max(0, Math.min(composition.durationInFrames - 1, raw));
  const a = path.join(tmp, 'a.png');
  const b = path.join(tmp, 'b.png');
  await renderStill({ serveUrl, composition, output: a, frame: f, scale: 0.5, overwrite: true, imageFormat: 'png' });
  await renderStill({ serveUrl, composition, output: b, frame: f, scale: 0.5, overwrite: true, imageFormat: 'png' });
  const ha = sha(a);
  const hb = sha(b);
  const ok = ha === hb;
  if (!ok) bad += 1;
  console.log(`  frame ${String(f).padStart(4, '0')}: ${ok ? 'DETERMINISTIC' : 'MISMATCH'}  (${ha} vs ${hb})`);
}
rmSync(tmp, { recursive: true, force: true });

if (bad > 0) {
  console.error(`\nFAIL: ${bad}/${pick.length} frames differ between renders — unseeded randomness or wall-clock reads in the composition (vidtsx hard rules violation).`);
  process.exit(1);
}
console.log(`\nPASS: ${pick.length} frames byte-identical across renders.`);
