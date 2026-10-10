
  // SCORE BODY — px-1-square (inside buildScore(); see kit/score-head.js).
  // The sound chip evolves with the eras: 1972 bleeps -> the 4-note green
  // loop -> 16-bit arps with bass -> today's fuller synth. The square's
  // motif (a fifth, E-B) opens the piece and ends it. Everything dries at
  // 26.2; the count lands at 27.0 — the single loudest hit.
  const T = TIMELINE, cu = T.cues, R = RNG('score');
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const squareMotif = (t, vel) => { pluck(t, nz('E4'), vel, 0, 0.4, 3200, 0.2); pluck(t + E8, nz('B4'), vel * 0.9, 0.1, 0.45, 3400, 0.25); };

  // ================= MUSIC =================
  to = 'm';
  // 1972: a bare CRT hum + the motif
  pad(0.0, T1 + 0.1, ['E2'], 0.02, { type: 'triangle', cut: 300, att: 0.4, rel: 0.2 });
  squareMotif(cu.serve, 0.16);
  squareMotif(cu.whole, 0.14);
  // 1989: the 4-note green loop (a square wave's worth of pluck)
  pad(T1, T2 + 0.1, ['E2', 'B2'], 0.022, { type: 'triangle', cut: 500, att: 0.3, rel: 0.2 });
  each(T1 + 0.2, T2, BEAT, (t, k) => pluck(t, nz(['E4', 'G4', 'B4', 'G4'][k % 4]), 0.045, Math.sin(k) * 0.25, 0.3, 2800, 0.15));
  // 16-bit: arps + a bass line — the fullest chip music
  pad(T2, T3 + 0.1, ['E2', 'B2', 'E3'], 0.028, { cut: 800, att: 0.3, rel: 0.2, send: 0.3 });
  each(T2 + 0.2, T3 - 0.3, E8, (t, k) => {
    pluck(t, nz(['E4', 'G4', 'B4', 'E5', 'B4', 'G4'][k % 6]), 0.05, Math.sin(k) * 0.3, 0.24, 3600, 0.12);
    if (k % 2 === 0) bass(t, nz(k % 8 < 4 ? 'E2' : 'B2'), 0.14);
  });
  // today: a fuller synth (the phone has speakers now); the count ticks under it
  pad(T3, 26.2, ['E2', 'B2', 'E3', 'G3'], 0.03, { cut: 1100, att: 0.4, rel: 0.05, send: 0.3 });
  each(T3 + 0.3, 25.8, E8, (t, k) => pluck(t, nz(['B4', 'E5', 'G5', 'E5'][k % 4]), 0.04, Math.sin(k) * 0.3, 0.26, 3800, 0.12));
  // 26.2 - 27.0: TRUE SILENCE — the number is about to land
  // THE HIT at 27.0: the count lands — the single loudest moment
  ['E3', 'B3', 'E4', 'G4', 'B4'].forEach((n, i) => pluck(cu.hit + i * 0.006, nz(n), 0.44, (i - 2) * 0.15, 0.7, 5200, 0.4));
  pad(cu.hit, cu.hit + 0.35, ['E3', 'B3', 'E4', 'G4', 'B4'], 0.52, { cut: 3600, att: 0.008, rel: 0.28, send: 0.3 });
  sub(cu.hit, 0.85); sub(cu.hit + 0.004, 0.35);
  // the icon reveal + the ending: warm, decaying; the motif ends the piece
  pad(cu.hit + 0.1, 31.9, ['E2', 'B2', 'E3', 'G3'], 0.04, { cut: 1000, att: 0.4, rel: 0.3, send: 0.4 });
  squareMotif(cu.icon + 0.2, 0.14);
  pad(31.9, T.duration, ['E2', 'B2'], 0.013, { type: 'triangle', cut: 500, att: 0.3, rel: 0.8 });
  squareMotif(cu.bounce + 0.1, 0.1);
  squareMotif(cu.loopEnd, 0.09);

  // ================= SFX =================
  to = 's';
  // 1972: the CRT hums (band noise); the ball pings on paddle hits
  { const src = ac.createBufferSource(); src.buffer = noise; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 4000; f.Q.value = 0.8;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, 0.3); g.gain.exponentialRampToValueAtTime(0.006, 1.0); g.gain.setValueAtTime(0.006, T1 - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, T1);
    src.connect(f); f.connect(g); out(g, -0.2); src.start(0.3); src.stop(T1 + 0.05); }
  for (let t = 1.6; t < T1 - 0.3; t += 0.5) { blip(t, 900, 900, 0.03, 0.04, R.n(0.3)); blip(t + 0.25, 1100, 1100, 0.03, 0.03, R.n(0.3)); }
  // the bridges: stepped whooshes (a channel change)
  T.morphs.forEach((tc, i) => { sweep(tc - 0.22, tc + 0.08, 0.012, 400, 2400, i % 2 ? 0.2 : -0.2); noiseHit(tc + 0.15, 0.06, 'bandpass', 1200, 0.9, 0.03); });
  // 1989: the 4-note loop's clock tick (the handheld's beat)
  for (let t = T1 + 0.2; t < T2 - 0.2; t += BEAT) noiseHit(t, 0.02, 'bandpass', 2000, 2.4, 0.03, 0.2);
  // the heart pickup: the classic 1-up chirp
  blip(cu.heart, 600, 1400, 0.14, 0.07); chime(cu.heart + 0.05, [nz('B5'), nz('E6')], 0.05);
  // 16-bit: the coin's sparkle chimes on the beat; the hero's jump
  for (let t = cu.color + 0.4; t < T3 - 0.3; t += BEAT) if (R.f() < 0.6) chime(t, [nz('E6')], 0.03, R.n(0.3));
  blip(cu.coin, 500, 1200, 0.1, 0.06);
  // today: the count ticks (one per step, rising in pitch)
  { const steps = 8; for (let i = 0; i < steps; i++) blip(cu.today + 0.4 + i * (cu.count - cu.today + 0.2 - cu.today - 0.4) / steps, 1200 + i * 90, 1200 + i * 90, 0.02, 0.022, 0.2); }
  // THE HIT: the number lands
  sub(cu.hit, 0.5); noiseHit(cu.hit, 0.012, 'highpass', 6000, 0.8, 0.26); noiseHit(cu.hit, 0.3, 'lowpass', 900, 0.7, 0.32, 0, 0.4);
  chime(cu.hit + 0.02, [nz('E5'), nz('G5'), nz('B5'), nz('E6')], 0.1);
  // the icon's glow-up: a soft shimmer; the bounce: two boings
  chime(cu.icon + 0.2, [nz('B4'), nz('E5')], 0.05);
  [0, 0.5].forEach((d, i) => { blip(cu.bounce + 0.15 + d, 500 + i * 140, 260, 0.16, 0.07, 0.2); });
  // the captions type: light ticks
  for (let t = cu.bounce + 0.3; t < cu.bounce + 0.8; t += E16) noiseHit(t + 0.01, 0.05, 'bandpass', 2600 + R.n(400), 1.4, 0.02, 0.2);
