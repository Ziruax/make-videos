
  // SCORE BODY — sk-1-folds (inside buildScore(); see kit/score-head.js).
  // A quiet page theme (pencil plucks) that gains a note with every fold;
  // the secret gets the chime; everything dries at 28.35 for the hush;
  // THE LAUNCH is the single loudest hit; the glide is airy and slow; the
  // page theme returns, decaying, for "go make one".
  const T = TIMELINE, cu = T.cues, R = RNG('score');
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };

  // ================= MUSIC =================
  to = 'm';
  // the page theme: quiet, warm, D-G-B with a walking bass note (dries at 28.35 for the hush)
  pad(0.0, 28.35, ['D3', 'G3', 'B3'], 0.018, { type: 'triangle', cut: 650, att: 0.3, rel: 0.03 });
  each(0.6, 28.0, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D4', 'G4', 'B4', 'G4'][k % 4]), 0.028, Math.sin(k) * 0.3, 0.4, 2400, 0.25); });
  // each fold adds a note: the sequence climbs as the plane takes shape
  [[cu.half, 'D4'], [cu.corners, 'E4'], [cu.edges, 'G4'], [cu.wings, 'A4'], [cu.wings + 0.4, 'B4']].forEach(([t, n]) => pluck(t + 0.1, nz(n), 0.06, 0.1, 0.7, 2600, 0.4));
  // the secret: the chime; the physics: weight vs lift (a low and a high)
  chime(cu.secret + 0.1, [nz('B4'), nz('E5')], 0.05);
  blip(cu.weight, 220, 180, 0.12, 0.05); blip(cu.lift, 500, 700, 0.1, 0.04);
  // the V: a gentle rising pair, then everything DRIES (28.35 -> the launch)
  pluck(cu.shallow, nz('D5'), 0.05, 0, 0.5, 2800, 0.3); pluck(cu.shallow + E8, nz('A5'), 0.04, 0.1, 0.5, 3000, 0.3);
  // 28.35 - 29.0: TRUE SILENCE — the finished plane holds on the page
  // THE LAUNCH: the whoosh + the stab (the single loudest moment)
  ['D3', 'G3', 'D4', 'G4', 'B4'].forEach((n, i) => pluck(K1 + i * 0.006, nz(n), 0.4, (i - 2) * 0.15, 0.7, 5200, 0.4));
  pad(K1, K1 + 0.35, ['D3', 'G3', 'D4', 'G4', 'B4'], 0.5, { cut: 3600, att: 0.008, rel: 0.28, send: 0.3 });
  sub(K1, 0.8); sub(K1 + 0.004, 0.35);
  // the glide: airy and slow — a descending line as the plane settles (ends before the goodbye)
  pad(K1 + 0.2, 32.5, ['D3', 'G3', 'B3', 'D4'], 0.035, { cut: 1500, att: 0.6, rel: 0.5, send: 0.45 });
  [[K1 + 0.5, 'D5'], [K1 + 1.2, 'B4'], [K1 + 1.9, 'A4'], [K1 + 2.7, 'G4']].forEach(([t, n]) => pluck(t, nz(n), 0.045, 0.15, 0.8, 2600, 0.5));
  // the landing + the check: soft
  chime(cu.land + 0.3, [nz('G4')], 0.05); chime(cu.land + 0.55, [nz('D5'), nz('G5')], 0.045);
  // the goodbye: the page theme, decaying (must fall >= 6 dB under the gift)
  pad(cu.make - 0.5, T.duration, ['D3', 'G3', 'B3'], 0.011, { type: 'triangle', cut: 550, att: 0.4, rel: 0.8 });
  pluck(cu.make + 0.15, nz('D4'), 0.05, 0, 0.7, 2400, 0.4); pluck(cu.make + 0.45, nz('G4'), 0.04, 0.1, 0.7, 2400, 0.4);

  // ================= SFX =================
  to = 's';
  // the sheet's write-on: a long pencil scratch
  for (let t = cu.sheet; t < cu.sheet + 1.1; t += E16) noiseHit(t + 0.01, 0.09, 'bandpass', 2500 + R.n(400), 1.4, 0.022, 0.2);
  // each fold: a paper snap + a short scratch as the crease writes
  const foldSnap = (t) => { noiseHit(t + 0.05, 0.06, 'bandpass', 1100 + R.n(300), 1.1, 0.075, 0.1); noiseHit(t + 0.05, 0.2, 'lowpass', 700, 0.7, 0.04); };
  [cu.half, cu.corners, cu.edges, cu.wings, cu.wings + 0.4].forEach(foldSnap);
  for (let t = cu.half; t < cu.half + 0.5; t += E16) noiseHit(t + 0.01, 0.08, 'bandpass', 2600 + R.n(400), 1.4, 0.02, 0.25);
  for (let t = cu.corners; t < cu.corners + 0.6; t += E16) noiseHit(t + 0.01, 0.08, 'bandpass', 2700 + R.n(400), 1.4, 0.02, -0.2);
  for (let t = cu.wings; t < cu.wings + 0.9; t += E16) noiseHit(t + 0.01, 0.08, 'bandpass', 2500 + R.n(400), 1.4, 0.022, 0.2);
  // the secret: the highlighter swipe (a fat soft stroke)
  noiseHit(cu.nose + 0.35, 0.18, 'bandpass', 900, 0.8, 0.05, 0.15);
  // the physics: ticks as the arrows draw
  [cu.weight, cu.lift].forEach((t) => noiseHit(t + 0.1, 0.05, 'bandpass', 1800, 1.4, 0.03, 0.2));
  // the V: a tiny bend creak
  noiseHit(cu.shallow + 0.3, 0.09, 'bandpass', 2400, 1.6, 0.03, -0.2);
  // THE LAUNCH: the whoosh + the throw snap
  sweep(K1 - 0.05, K1 + 0.3, 0.02, 500, 3200, 0.2);
  sub(K1, 0.5); noiseHit(K1, 0.012, 'highpass', 6000, 0.8, 0.24); noiseHit(K1, 0.26, 'lowpass', 900, 0.7, 0.3, 0, 0.4);
  chime(K1 + 0.02, [nz('D5'), nz('G5'), nz('B5'), nz('D6')], 0.09);
  // the glide: a soft airy bed under the flight
  { const src = ac.createBufferSource(); src.buffer = noise; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 0.7;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, K1 + 0.3); g.gain.exponentialRampToValueAtTime(0.007, K1 + 1.0); g.gain.setValueAtTime(0.007, cu.land - 0.2); g.gain.exponentialRampToValueAtTime(0.0001, cu.land + 0.1);
    src.connect(f); f.connect(g); out(g, 0.2); src.start(K1 + 0.3); src.stop(cu.land + 0.2); }
  // the landing: a paper tick; the check: a tick-tick
  noiseHit(cu.land, 0.05, 'bandpass', 1300, 1.2, 0.07); noiseHit(cu.land + 0.05, 0.04, 'bandpass', 900, 1.2, 0.04);
  noiseHit(cu.land + 0.4, 0.03, 'bandpass', 3200, 2.2, 0.035, 0.25);
  // the caption + title lettering: light scratches
  for (let t = cu.make; t < cu.make + 0.6; t += E16) noiseHit(t + 0.01, 0.07, 'bandpass', 2600 + R.n(400), 1.4, 0.02, 0.2);
  // the hero's hop/throws: soft thumps
  noiseHit(K1 + 0.02, 0.08, 'lowpass', 500, 0.8, 0.06);
