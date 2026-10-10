
  // SCORE BODY — ch-1-enter (inside buildScore(); see kit/score-head.js).
  // The arc: a warm paper groove (userland) -> the pitch drops into the
  // machine (drone + pulse) -> the 16th rush of bytes -> OUT: the day theme
  // again -> the write goes quiet -> TRUE SILENCE -> the stopwatch hit (the
  // loudest) -> the opening pad (the loop). Terracotta dot motif: D-Fs-A.
  const T = TIMELINE, cu = T.cues, R = RNG('score');
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const dotMotif = (t, vel) => { pluck(t, nz('D4'), vel, -0.1, 0.5, 2600, 0.3); pluck(t + E8, nz('Fs4'), vel, 0, 0.5, 2800, 0.3); pluck(t + BEAT, nz('A4'), vel * 0.9, 0.1, 0.55, 3000, 0.35); };

  // ================= MUSIC =================
  to = 'm';
  // userland: the paper groove — a pad + 8th plucks, warm
  pad(0.0, B1 + 0.05, ['D3', 'A3', 'G4'], 0.03, { cut: 900, att: 0.25, rel: 0.2, send: 0.3 });
  each(K1, B1 - 0.5, E8, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D4', 'G4', 'A4', 'G4', 'Fs4', 'A4', 'D5', 'A4'][k % 8]), 0.042, Math.sin(k) * 0.3, 0.3, 3000, 0.15); if (k % 4 === 0) bass(t, nz(k % 8 < 4 ? 'D2' : 'G2'), 0.13); });
  dotMotif(cu.launch + 0.1, 0.15);
  // inside the machine: the pitch drops — a deep drone, a slow pulse, sparse high sparks
  drone(B1, K5, nz('D2'), 0.055, { att: 0.4, rel: 0.2 });
  pad(B1, K5, ['A2', 'D3'], 0.02, { type: 'triangle', cut: 500, att: 0.5, rel: 0.2 });
  each(B1 + 0.3, K5, BEAT, (t, k) => blip(t, 220, 180, 0.05, 0.03, k % 2 ? 0.25 : -0.25));
  [[16.2, 'A5'], [17.4, 'E5']].forEach(([t, n]) => pluck(t, nz(n), 0.026, 0.3, 0.8, 1800, 0.5));
  // the rush: 16ths, rising, the busiest and FASTEST — but not the loudest
  each(K5, B2 - 0.2, E16, (t, k) => {
    const rise = ['D5', 'E5', 'Fs5', 'A5', 'B5', 'D6', 'E6', 'Fs6'][Math.min(7, Math.floor(k / 5))];
    pluck(t, nz(rise), 0.03 + k * 0.001, Math.sin(k) * 0.3, 0.16, 4200, 0.1);
    if (k % 2 === 0) bass(t, nz('D2'), 0.12);
  });
  riser(B2 - 0.8, B2 - 0.05, 0.02);
  // out: the day theme returns under "The program lines them up" — then DRIES for the silence
  pad(B2, 25.2, ['D3', 'A3', 'G4'], 0.034, { cut: 1000, att: 0.3, rel: 0.05, send: 0.25 });
  each(B2 + 0.3, 24.4, E8, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D4', 'G4', 'A4', 'B4'][k % 4]), 0.038 * (t > 24.0 ? 0.5 : 1), Math.sin(k) * 0.3, 0.26, 3000, t > 24.0 ? 0.05 : 0.15); });
  // 25.2 -> 25.96: TRUE SILENCE on the completed screen
  // THE HIT at cu.hit: the stopwatch — the single loudest moment
  ['D3', 'A3', 'D4', 'Fs4', 'A4'].forEach((n, i) => pluck(cu.hit + i * 0.006, nz(n), 0.42, (i - 2) * 0.15, 0.7, 5200, 0.4));
  pad(cu.hit, cu.hit + 0.35, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.52, { cut: 3600, att: 0.008, rel: 0.3, send: 0.3 });
  sub(cu.hit, 0.85); sub(cu.hit + 0.004, 0.4);
  // the payoff holds warm under "milliseconds"
  pad(cu.hit + 0.1, K7 + 0.2, ['D3', 'A3', 'D4', 'Fs4'], 0.04, { cut: 1200, att: 0.4, rel: 0.3, send: 0.4 });
  dotMotif(cu.hit + 1.2, 0.12);
  // the cursor: the opening pad, decaying; the loop
  pad(K7, T.duration, ['D3', 'A3', 'G4'], 0.017, { cut: 800, att: 0.3, rel: 0.6 });
  dotMotif(K7 + 1.0, 0.09);

  // ================= SFX =================
  to = 's';
  // the typing: l, s — clacks; Enter is a deeper clack + a sub
  noiseHit(cu.keyL, 0.02, 'bandpass', 3400 + R.n(400), 2.4, 0.09);
  noiseHit(cu.keyS, 0.02, 'bandpass', 3100 + R.n(400), 2.4, 0.09);
  noiseHit(cu.enter, 0.03, 'bandpass', 1900, 1.6, 0.14); sub(cu.enter + 0.01, 0.18);
  blip(cu.launch, 500, 1100, 0.1, 0.1); chime(cu.launch + 0.02, [nz('D6')], 0.05);
  // the parse: the split scratch; the box pop
  for (let t = cu.split; t < cu.split + 0.3; t += E16) noiseHit(t, 0.06, 'bandpass', 2800 + R.n(400), 1.4, 0.022, 0.2);
  noiseHit(cu.words + 0.05, 0.04, 'lowpass', 1400, 0.8, 0.07);
  // fork: two low blips (parent, child)
  blip(cu.twin, 320, 260, 0.12, 0.07, -0.2); blip(cu.twin + 0.18, 380, 300, 0.1, 0.06, 0.2);
  // exec: code streams (fast light ticks)
  for (let t = cu.code; t < cu.code + 0.8; t += E16) if (R.f() < 0.8) noiseHit(t + 0.005, 0.015, 'bandpass', 4200 + R.n(600), 3, 0.032, R.n(0.4));
  noiseHit(cu.exec, 0.05, 'lowpass', 900, 0.8, 0.1); blip(cu.exec, 700, 1200, 0.08, 0.05);
  // the bridges: a whoosh down / a whoosh up
  sweep(B1 - 0.25, B1 + 0.1, 0.014, 2200, 300, 0);
  sweep(B2 - 0.25, B2 + 0.1, 0.014, 300, 2200, 0);
  // inside: the machine hums (band noise, low)
  { const src = ac.createBufferSource(); src.buffer = noise; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, B1); g.gain.exponentialRampToValueAtTime(0.009, B1 + 0.6); g.gain.setValueAtTime(0.009, K5 - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, K5);
    src.connect(f); f.connect(g); out(g, -0.2); src.start(B1); src.stop(K5); }
  // the kernel request: a soft chime as the card hands up
  chime(cu.ask + 0.15, [nz('A4'), nz('D5')], 0.045);
  // the disk: platter ticks on 8ths, the head seeks (a short riser)
  for (let t = K4 + 0.2; t < K5 - 0.2; t += E8) noiseHit(t, 0.02, 'bandpass', 2600, 2.2, 0.035, 0.3);
  sweep(cu.head, cu.head + 0.35, 0.012, 1800, 3200, 0);
  blip(cu.disk, 900, 600, 0.09, 0.05); // the disk answers
  // the rush: bytes ticking up, accelerating into the bridge
  for (let i = 0; i < 14; i++) noiseHit(cu.back + i * E16, 0.02, 'bandpass', 2000 + i * 260, 2.6, 0.03, R.n(0.5));
  // the write: fast typing as the answer lands
  for (let t = B2 + 0.4; t < 25.0; t += E16) if (R.f() < 0.75) noiseHit(t + 0.005, 0.016, 'bandpass', 3600 + R.n(600), 3, 0.026, R.n(0.4));
  // THE HIT: the stopwatch snap
  sub(cu.hit, 0.5); noiseHit(cu.hit, 0.012, 'highpass', 6000, 0.8, 0.26); noiseHit(cu.hit, 0.26, 'lowpass', 900, 0.7, 0.3, 0, 0.4);
  chime(cu.hit + 0.02, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.1);
  noiseHit(cu.watch + 0.35, 0.05, 'bandpass', 1500, 1.2, 0.05); // the readout writes
  // the cursor: soft blink blips on the blink beats
  [K7 + 0.9, K7 + 1.4, K7 + 1.9, K7 + 2.4].forEach((t, i) => blip(t, 800, 1100, 0.04, 0.02, i % 2 ? 0.2 : -0.2));
  // the final Enter hint: one soft clack under "again"
  noiseHit(cu.again - 0.1, 0.02, 'bandpass', 1900, 1.6, 0.08);
