
  // SCORE BODY — riso-1-mirror (inside buildScore(); see kit/score-head.js).
  // The piece performs its own subject: the ENGINE DRONE runs from frame one
  // until the SLAM — then cuts dead, and the quiet arrives (that is what ANC
  // does). The mirror's motif: a clean falling third, D5 -> B4.
  const T = TIMELINE, cu = T.cues, R = RNG('score');
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const mirrorMotif = (t, vel) => { pluck(t, nz('D5'), vel, 0, 0.5, 4200, 0.3); pluck(t + E8, nz('B4'), vel * 0.85, 0.1, 0.6, 3800, 0.4); };

  // ================= MUSIC =================
  to = 'm';
  // THE DRONE: the engine, gritty and low, from frame one — it hard-stops
  // at 16.85 (the held breath before the slam) and never comes back
  drone(0.0, 16.85, nz('A1'), 0.045, { att: 0.4, rel: 0.03 });
  drone(0.0, 16.85, nz('E2'), 0.02, { att: 0.8, rel: 0.03 });
  // a light theme over it (the cabin's calm trying to exist)
  pad(0.0, B1 + 0.1, ['D3', 'A3'], 0.02, { type: 'triangle', cut: 700, att: 0.3, rel: 0.2 });
  each(1.4, B1 - 0.3, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(['D4', 'A4', 'Fs4', 'A4'][k % 4]), 0.03, Math.sin(k) * 0.3, 0.35, 2800, 0.2); });
  // the close-up: the theme thins; the flip sweeps; the mirror's motif (clean, teal)
  pad(B1, K1 + 0.1, ['D3'], 0.014, { type: 'triangle', cut: 500, att: 0.3, rel: 0.2 });
  mirrorMotif(cu.flip + 1.0, 0.14);
  // the diagram: sparse, paper-quiet
  pad(K1, K2 + 0.1, ['D3', 'A3'], 0.016, { type: 'triangle', cut: 700, att: 0.2, rel: 0.2 });
  mirrorMotif(cu.mirror + 0.2, 0.13);
  // BOTH PLAY: the tension — a second drone a whisker off (the beat), 8th plucks
  // accelerating, then everything DRIES by 16.95 for the true pre-slam silence
  drone(K2, 16.85, nz('A1') * 1.012, 0.04, { att: 0.3, rel: 0.06 });   // the beating mirror drone
  each(K2, 16.7, E8, (t, k) => { const acc = 1 + 0.3 * clamp(seg(t, K2, K3)); pluck(t, nz(['D4', 'E4', 'Fs4', 'A4'][k % 4]), 0.03 * acc, Math.sin(k) * 0.3, 0.25, 3200, 0.12); if (k % 4 === 0) bass(t, nz('A2'), 0.12); });
  riser(K3 - 1.6, 16.95, 0.013);
  // 16.95 - 17.5: TRUE SILENCE — the waves still closing on screen
  // THE SLAM at K3: the single loudest hit — and the drone is gone
  ['D3', 'A3', 'D4', 'Fs4', 'A4'].forEach((n, i) => pluck(K3 + i * 0.006, nz(n), 0.44, (i - 2) * 0.15, 0.7, 5200, 0.4));
  pad(K3, K3 + 0.35, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.55, { cut: 3600, att: 0.008, rel: 0.28, send: 0.3 });
  sub(K3, 0.9); sub(K3 + 0.004, 0.4);
  // the relief: the calm theme swells IN behind the hit (the quiet is a gift)
  pad(K3 + 0.15, B2 + 0.3, ['D3', 'A3', 'D4', 'Fs4'], 0.05, { cut: 1100, att: 0.5, rel: 0.3, send: 0.4 });
  mirrorMotif(cu.cancel + 0.3, 0.15);
  // the quiet cabin: the theme, decaying; the motif once more; the loop
  pad(B2, T.duration, ['D3', 'A3', 'Fs4'], 0.017, { cut: 800, att: 0.4, rel: 0.7, send: 0.3 });
  mirrorMotif(cu.gone + 0.4, 0.1);
  mirrorMotif(cu.title + 0.2, 0.09);

  // ================= SFX =================
  to = 's';
  // the drone's texture: a soft gritty bed that dries BEFORE the slam (the piece IS the demo)
  { const src = ac.createBufferSource(); src.buffer = noise; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, 0.2); g.gain.exponentialRampToValueAtTime(0.011, 1.2); g.gain.setValueAtTime(0.011, 16.4); g.gain.exponentialRampToValueAtTime(0.0001, 16.8);
    src.connect(f); f.connect(g); out(g, -0.3); src.start(0.2); src.stop(16.85); }
  // the waves washing (paper ticks on 8ths, pink)
  for (let t = cu.waves; t < B1 - 0.2; t += E8) if (R.f() < 0.7) noiseHit(t + 0.01, 0.03, 'bandpass', 700 + R.n(300), 1.2, 0.02, R.n(0.4));
  // the mic: listening blips; the captured wave scratches in
  [0, 1, 2].forEach((i) => blip(cu.mic + 0.1 + i * 0.22, 900 + i * 120, 1300 + i * 120, 0.06, 0.03, i % 2 ? 0.3 : -0.3));
  for (let t = cu.hears; t < cu.hears + 0.4; t += E16) noiseHit(t + 0.01, 0.08, 'bandpass', 2400 + R.n(400), 1.4, 0.02, 0.2);
  // THE FLIP: a sweep down-up (the phase rotating), then the mirror's clean note
  sweep(cu.flip, cu.flip + 0.5, 0.014, 1800, 600, 0);
  sweep(cu.flip + 0.5, cu.flip + 1.0, 0.014, 600, 1900, 0.2);
  blip(cu.upside, 500, 1000, 0.08, 0.05); chime(cu.upside + 0.1, [nz('B4')], 0.05);
  // the bridges: printed paper whooshes
  sweep(B1 - 0.25, B1 + 0.1, 0.012, 600, 2600, 0.2); noiseHit(B1 + 0.15, 0.08, 'bandpass', 1500, 0.9, 0.03);
  sweep(B2 - 0.25, B2 + 0.1, 0.012, 2600, 600, -0.2); noiseHit(B2 + 0.15, 0.08, 'bandpass', 1500, 0.9, 0.03);
  // the cuts: a printed snap on each grid cut (K3's is the SLAM)
  [K1, K2].forEach((t) => noiseHit(t, 0.05, 'lowpass', 1600, 0.8, 0.07));
  // the speaker plays: emit pulses following the rings
  [0, 1, 2, 3].forEach((i) => blip(cu.play + 0.15 + i * 0.3, 700, 1100, 0.07, 0.04, i % 2 ? 0.25 : -0.25));
  // peaks meet troughs: the pairing ticks
  [0, 1, 2].forEach((i) => noiseHit(cu.peak + 0.1 + i * 0.18, 0.03, 'bandpass', 3000 + i * 400, 2, 0.04, 0.2));
  // THE SLAM: the impact — noise burst + sub + chime (the stab is in the music above)
  sub(K3, 0.55); noiseHit(K3, 0.012, 'highpass', 6000, 0.8, 0.28); noiseHit(K3, 0.3, 'lowpass', 900, 0.7, 0.34, 0, 0.4);
  chime(K3 + 0.02, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.1);
  // the bloom: almost nothing — two tiny paper ticks as the flat line draws
  noiseHit(cu.bloom + 0.3, 0.04, 'bandpass', 2000, 1.4, 0.02); noiseHit(cu.bloom + 0.7, 0.04, 'bandpass', 2400, 1.4, 0.018);
  // the quiet cabin: the window cloud drifts (a whisper of air), the mug sets down
  sweep(B2 + 0.5, B2 + 1.4, 0.008, 400, 900, -0.2);
  noiseHit(B2 + 1.2, 0.05, 'lowpass', 1200, 0.8, 0.04);
  // the title prints
  for (let t = cu.title; t < cu.title + 0.5; t += E16) noiseHit(t + 0.01, 0.07, 'bandpass', 2600 + R.n(400), 1.4, 0.02, 0.2);
