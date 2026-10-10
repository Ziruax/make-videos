  // SCORE BODY — iso-1-seek (inside buildScore(); see kit/score-head.js).
  // Calm and precise, like the picture. The clockwork motif: a tick-tock
  // pair (D4/A4) that tightens to 8ths as the seek nears. The whir rises
  // with the spin-up and thins at the close-up. The music and the whir
  // BOTH stop at 23.3 (the hush) — THE HIT at 24.3 is the single loudest
  // moment, then the relief pad carries the goodbye home.
  const T = TIMELINE, q = T.cues, R = RNG('score');
  const each = (t0, t1, step, fn) => { for (let k = 0; t0 + k * step < t1 - 1e-6; k++) fn(t0 + k * step, k); };
  const t7end = t1('l7', 23.96);

  // ================= MUSIC =================
  to = 'm';
  pad(0.0, 6.1, ['D3', 'A3'], 0.03, { type: 'triangle', cut: 900, att: 0.5, rel: 0.4, send: 0.45 });          // the box: a calm open fifth
  pad(6.1, 13.4, ['D3', 'A3', 'E4'], 0.03, { type: 'triangle', cut: 1100, att: 0.4, rel: 0.3, send: 0.45 });  // the spin: one step brighter
  pad(13.4, t7end - 0.55, ['A2', 'E3'], 0.04, { type: 'triangle', cut: 700, att: 0.4, rel: 0.3, send: 0.4 });  // the close-up: thinner, lower, GONE by the hush
  pad(21.11, t7end - 0.54, ['E3', 'A3'], 0.03, { type: 'triangle', cut: 800, att: 0.3, rel: 0.25, send: 0.35 }); // the journey: the turn's bed, present under the voice
  // the clockwork tick-tock (the drive's heartbeat), tightening to 8ths for the seek
  each(6.4, 16.9, BEAT, (t, k) => { if (k % 2 === 0) pluck(t, nz(k % 4 ? 'D4' : 'A4'), 0.05, k % 4 ? 0.25 : -0.25, 0.4, 2600, 0.25); });
  each(16.9, 20.9, E8, (t, k) => pluck(t, nz(['D4', 'E4', 'Fs4', 'A4'][k % 4]), 0.035, Math.sin(k) * 0.3, 0.3, 3000, 0.18));
  // 23.3 - 24.3: TRUE SILENCE — the bars hold, the arm is poised
  // THE HIT at q.hit: the stab (the musical side, on the music bus)
  ['D3', 'A3', 'D4', 'Fs4', 'A4'].forEach((n, i) => pluck(q.hit + i * 0.006, nz(n), 0.5, (i - 2) * 0.15, 0.7, 5200, 0.4));
  pad(q.hit, q.hit + 0.35, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.62, { cut: 3600, att: 0.008, rel: 0.28, send: 0.3 });
  // the relief: the calm theme swells back in behind the hit
  pad(q.hit + 0.15, 28.2, ['D3', 'A3', 'D4', 'Fs4'], 0.05, { cut: 1100, att: 0.5, rel: 0.3, send: 0.4 });
  // the goodbye: the theme decays; the settle chime; the loop
  pad(28.2, T.duration, ['D3', 'A3', 'Fs4'], 0.016, { cut: 800, att: 0.4, rel: 0.7, send: 0.35 });
  pluck(q.settle, nz('D5'), 0.07, 0, 0.8, 3400, 0.35);
  pluck(q.settle + 0.22, nz('A4'), 0.05, 0.1, 0.9, 3000, 0.3);

  // ================= SFX =================
  to = 's';
  // the arrival: plinth plates, the drive, the hero (kept QUIET — the payoff owns the loudness)
  for (let i = 0; i < 2; i++) blip(q.drop + i * 0.09, 420 - i * 60, 240, 0.03, 0.06);
  sub(q.drop + 0.18, 0.1); noiseHit(q.drop + 0.18, 0.22, 'lowpass', 320, 0.8, 0.02);
  blip(q.hero, 500, 1100, 0.07, 0.04);
  // the lid: a hinge creak (a soft rise) and a light catch
  sweep(q.lid, q.lid + 0.45, 0.01, 380, 880, 0);
  noiseHit(q.lid + 0.5, 0.06, 'bandpass', 900, 1.4, 0.02, 0.1);
  // THE SPIN-UP: the motor rises; then the whir bed, thin and real, until the hush
  sweep(q.spin, t1('l3', 8.58), 0.02, 90, 330, 0);
  { const src = ac.createBufferSource(); src.buffer = noise; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 480; f.Q.value = 0.5;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, 8.5); g.gain.exponentialRampToValueAtTime(0.009, 9.6);
    g.gain.setValueAtTime(0.009, 13.4); g.gain.exponentialRampToValueAtTime(0.0035, 16.9);
    g.gain.setValueAtTime(0.0035, 22.9); g.gain.exponentialRampToValueAtTime(0.0001, 23.25);
    src.connect(f); f.connect(g); out(g, 0); src.start(8.5); src.stop(23.3); }
  // the arm swings in from the park ramp; the seek; the file card
  sweep(q.arm, q.arm + 0.4, 0.012, 300, 720, -0.2);
  noiseHit(q.arm + 0.35, 0.04, 'bandpass', 1100, 1.6, 0.014);
  blip(q.save, 700, 500, 0.045, 0.05, 0.1);
  sweep(q.seek1, q.seek1 + 0.22, 0.02, 420, 980, 0.1);
  // the two bars rise: two soft plucks, a beat apart
  pluck(q.bars, nz('A4'), 0.07, -0.2, 0.5, 2600, 0.3);
  pluck(q.bars + E8, nz('D4'), 0.06, -0.2, 0.6, 2400, 0.3);
  // THE HIT: the impact — ON THE SFX BUS (the music bus sits −14 dB under the voice; the payoff owns the loudness)
  sub(q.hit, 1.15); sub(q.hit + 0.004, 0.4);
  sweep(q.hit, q.hit + 0.13, 0.055, 1900, 260, 0);
  noiseHit(q.hit, 0.2, 'bandpass', 1500, 1.1, 0.045, 0);
  blip(q.hit + 0.1, 500, 1100, 0.08, 0.04);
  // the live re-cross on the word, softer (the line proves it)
  sweep(q.crosses, q.crosses + 0.12, 0.03, 1600, 300, 0.1);
  // the lid closes: the thunk; the hero's hop; the settle (the thunk stays well under THE HIT)
  const land = q.close + 0.55;
  sub(land, 0.12); noiseHit(land, 0.22, 'lowpass', 280, 0.9, 0.022);
  blip(q.hop, 500, 1100, 0.07, 0.04);
