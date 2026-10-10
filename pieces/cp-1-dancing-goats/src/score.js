
  // SCORE BODY — cp-1-dancing-goats (inside buildScore(); see kit/score-head.js).
  // The arc: warm and sparse (the legend) -> a night drone (the monks) -> a busy
  // groove (London) -> a tense hush (the heist) -> DEAD SILENCE (the seedling)
  // -> the slam: the loudest hit -> the fullest music (today) -> the opening pad.
  // The voice is the clock; everything sits well under it (music: -14 dB).
  const T = TIMELINE, cu = T.cues, R = RNG('score');
  const FIG = [['D4', 'A4', 'Fs4', 'A4', 'D5', 'A4', 'Fs4', 'A4'], ['D4', 'Fs4', 'A4', 'D5', 'Fs5', 'D5', 'A4', 'Fs4'],
    ['A4', 'D5', 'Fs5', 'A5', 'Fs5', 'D5', 'A4', 'Fs4']];
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const wakeMotif = (t, vel, extra) => { pluck(t, nz('D4'), vel, -0.1, 0.5, 2600, 0.3); pluck(t + E8, nz('A4'), vel, 0.1, 0.5, 2800, 0.3); if (extra) pluck(t + BEAT, nz('D5'), vel * 0.8, 0, 0.6, 3000, 0.35); };

  // ================= MUSIC =================
  to = 'm';
  // E1 the legend: a soft morning pad; the spark wakes on a rising fifth
  pad(0.0, T1 + 0.1, ['D3', 'A3', 'Fs4'], 0.034, { type: 'triangle', cut: 800, att: 0.05, rel: 0.25 });
  wakeMotif(cu.wake, 0.16);
  // the goats prance: light staccato 8ths under line 2
  each(cu.goats, T1 - 0.3, E8, (t, k) => { if (k % 2 === 0 || k % 8 === 5) pluck(t, nz(FIG[0][k % 8]), 0.045, Math.sin(k) * 0.3, 0.16, 3400, 0.12); });
  // E2 the monastery night: a warm drone, a heartbeat drum, sparse high answers
  drone(T1, T2 + 0.1, nz('D2'), 0.045, { att: 0.4, rel: 0.3 });
  pad(T1, T2 + 0.1, ['A2', 'D3', 'A3'], 0.022, { type: 'triangle', cut: 600, att: 0.4, rel: 0.3 });
  each(T1 + BEAT, T2, BEAT * 2, (t, k) => noiseHit(t, 0.06, 'bandpass', 240, 1.2, 0.035, 0, 0.1));   // the hand-drum heartbeat
  [[10.2, 'A5'], [11.6, 'Fs5']].forEach(([t, n]) => pluck(t, nz(n), 0.03, 0.25, 0.7, 1800, 0.5));
  // E3 London: the groove arrives — 8ths, bass, the room gets busy
  pad(T2, T3 + 0.1, ['D3', 'A3', 'E4'], 0.032, { cut: 1000, att: 0.2, rel: 0.2, send: 0.3 });
  each(T2 + E8, T3, E8, (t, k) => {
    const acc = k % 4 === 0 ? 1.25 : k % 2 === 0 ? 1.0 : 0.7;
    pluck(t, nz(FIG[1][k % 8]), 0.05 * acc, Math.sin(k * 0.9) * 0.3, 0.28, 3200, 0.15);
    if (k % 2 === 0) bass(t, nz(k % 8 < 4 ? 'D2' : 'A2'), 0.14);
  });
  // E4a the heist: a tense low drone, sparse; dries at 25.0; HARD STOP before the slam
  drone(T3, 25.0, nz('D2'), 0.05, { att: 0.5, rel: 0.15 });
  pad(T3, 24.9, ['A2', 'D3'], 0.016, { type: 'triangle', cut: 450, att: 0.6, rel: 0.12 });
  [[20.6, 'A5'], [22.6, 'E5'], [24.0, 'Fs5']].forEach(([t, n]) => pluck(t, nz(n), 0.028, 0.3, 0.9, 1600, 0.5));
  // 25.0 - 26.25: TRUE SILENCE (the seedling sprouts in it)
  // THE SLAM at T4: the single loudest hit of the piece — the stab, the sub, the chord
  ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'].forEach((n, i) => pluck(T4 + i * 0.006, nz(n), 0.46, (i - 2.5) * 0.15, 0.7, 5200, 0.4));
  pad(T4, T4 + 0.4, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 0.6, { cut: 3600, att: 0.008, rel: 0.3, send: 0.3 });
  sub(T4, 0.9); sub(T4 + 0.004, 0.45);
  // E4b+E5 today: the payoff chord rings, then the groove swells IN behind it (never louder than the slam)
  pad(T4 + 0.1, T6 + 0.1, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.038, { cut: 1300, att: 0.7, rel: 0.3, send: 0.4 });
  drone(T4 + 0.1, T6 + 0.05, nz('D2'), 0.045, { att: 0.5, rel: 0.3 });
  each(T5 + 0.4, T6, E8, (t, k) => {
    const acc = k % 4 === 0 ? 1.3 : 0.9;
    pluck(t, nz(FIG[2][k % 8]), 0.048 * acc, Math.sin(k * 0.9) * 0.35, 0.3, 3400 + (k % 3) * 300, 0.16);
    pluck(t, nz(FIG[2][k % 8]) * 2, 0.012, -Math.sin(k * 0.9) * 0.3, 0.16, 6000, 0.1);
    if (k % 2 === 0) bass(t, nz(k % 8 < 4 ? 'D2' : 'A2'), 0.13);
    if (k % 4 === 0) sub(t, 0.05);
  });
  // E6 the hillside: the opening pad again, decaying (goodbye must fall >= 6 dB under the gift);
  // the motif, quiet, then the loop
  pad(T6, T.duration, ['D3', 'A3', 'Fs4'], 0.016, { type: 'triangle', cut: 700, att: 0.35, rel: 0.6 });
  wakeMotif(34.6, 0.08, true);

  // ================= SFX =================
  to = 's';
  // the wake: a soft pop + one high chime
  blip(cu.wake, 500, 900, 0.08, 0.10); chime(cu.wake + 0.02, [nz('D6')], 0.045);
  // the goats prance: tiny hoof ticks on the 8ths (only in era 1)
  for (let t = cu.goats; t < T1 - 0.2; t += E8) if (R.f() < 0.8) noiseHit(t + 0.01, 0.014, 'bandpass', 1700 + R.n(500), 2.2, 0.03, R.n(0.4));
  // E2: the fire crackles; the cup clinks once
  for (let t = T1 + 0.4; t < T2 - 0.2; t += 0.5 + R.f() * 0.3) noiseHit(t, 0.05, 'bandpass', 900 + R.n(600), 1.1, 0.02, R.n(0.5));
  blip(cu.monks, 1200, 1800, 0.06, 0.06);
  // E3: mug clinks as they land on "penny"; the room chatter (soft band noise)
  [0, 1, 2].forEach((i) => chime(cu.cups + i * 0.22, [nz(['A6', 'B6', 'Cs7'][i])], 0.035, i % 2 ? 0.2 : -0.2));
  { const src = ac.createBufferSource(); src.buffer = noise; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 750; f.Q.value = 1.4;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, T2 + 0.5); g.gain.exponentialRampToValueAtTime(0.008, T2 + 1.2); g.gain.setValueAtTime(0.008, T3 - 0.8); g.gain.exponentialRampToValueAtTime(0.0001, T3 - 0.1);
    src.connect(f); f.connect(g); out(g, -0.2); src.start(T2 + 0.5); src.stop(T3); }
  // the chalk writes on "news"
  for (let t = cu.news; t < cu.news + 0.5; t += E16) noiseHit(t + 0.01, 0.08, 'bandpass', 2800 + R.n(400), 1.4, 0.02, 0.2);
  // E4a: the bouquet lands; the sprout is SILENT (nothing in 25.0-26.25)
  noiseHit(T3 + 0.12, 0.09, 'lowpass', 1200, 0.8, 0.08); blip(T3 + 0.1, 700, 500, 0.1, 0.05);
  // THE SLAM: the paper world hits (loudest)
  sub(T4, 0.55); noiseHit(T4, 0.012, 'highpass', 6000, 0.8, 0.3); noiseHit(T4, 0.3, 'lowpass', 900, 0.7, 0.36, 0, 0.4);
  chime(T4 + 0.02, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.11);
  // E5: the big cup lands (soft — the slam stays the loudest); the grid clinks follow the pops
  noiseHit(T5 + 0.1, 0.09, 'lowpass', 1100, 0.8, 0.04);
  for (let i = 0; i < 9; i++) chime(cu.billion + i * 0.12, [nz(['A6', 'B6', 'Cs7', 'E7'][i % 4])], 0.03, i % 2 ? 0.25 : -0.25);
  for (let t = cu.count; t < cu.count + 0.6; t += E16) noiseHit(t + 0.01, 0.08, 'bandpass', 3000 + R.n(400), 1.4, 0.018, 0.2);
  for (let t = cu.threeBeans; t < cu.threeBeans + 0.4; t += E16) noiseHit(t + 0.01, 0.08, 'bandpass', 2800 + R.n(400), 1.4, 0.015, -0.2);
  // E6: the goat's mug clinks; the title writes on
  chime(cu.sip, [nz('A5')], 0.04); blip(cu.sip, 1300, 1700, 0.05, 0.04);
  for (let t = cu.title + 0.2; t < cu.title + 1.0; t += E16) noiseHit(t + 0.01, 0.07, 'bandpass', 2600 + R.n(400), 1.4, 0.02, 0.2);
  // the morphs: a paper swish into each bridge (short, dry)
  T.morphs.forEach((tc, i) => { sweep(tc - 0.25, tc + 0.08, 0.011, 500, 2600, i % 2 ? 0.25 : -0.25); noiseHit(tc + 0.18, 0.07, 'bandpass', 1500, 0.9, 0.025, 0); });
