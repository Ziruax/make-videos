  // SCORE BODY — tri-180 (inside buildScore(); see kit/score-head.js).
  // The voice is the clock: thin early, fullest at the payoff; everything
  // quiet under the voice (export mixes it at music: -14 dB).
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, T_BR, ['D3', 'A3'], 0.03, { type: 'triangle', cut: 1000, att: 0.3, rel: 0.3 });
  // the pad HARD-STOPS 0.7s before the payoff chime: the silence before the flash is the turn (craft.md)
  pad(T_BR, cu.flash - 0.7, ['D3', 'A3', 'F4'], 0.035, { type: 'triangle', cut: 1300, att: 0.3, rel: 0.3, send: 0.5 });
  // plucks as the triangle's sides draw (on "triangle")
  [['D4', 0], ['Fs4', E8], ['A4', BEAT]].forEach(([n, dt], i) => pluck(cu.tri + 0.1 + dt, nz(n), 0.12, -0.2 + i * 0.2, 0.5, 2600, 0.35));
  // arcs sweep on "angles"
  [['A4', 0], ['B4', E8], ['D5', BEAT]].forEach(([n, dt], i) => pluck(cu.arcs + dt, nz(n), 0.1, -0.3 + i * 0.3, 0.5, 3000, 0.35));
  // wedges land (short, dry: nothing may bleed into the pre-payoff silence)
  [['E5', 0], ['Fs5', E8], ['A5', BEAT]].forEach(([n, dt], i) => pluck(cu.wedges + 0.35 + dt, nz(n), 0.11, 0.1 * i, 0.22, 3200, 0.08));
  // the count lands on "eighty": two short plucks, not a chime (a chime's 1.3s tail would eat the silence)
  pluck(cu.count + 0.55, nz('A5'), 0.10, 0, 0.26, 3200, 0.1);
  pluck(cu.count + 0.55 + 0.03, nz('D6'), 0.06, 0.2, 0.26, 3400, 0.1);
  to = 's';
  // a soft sweep into the bridge
  sweep(T_BR - D_BR + 0.15, T_BR, 0.01, 500, 2800, 0);
  // ticking while the readout counts
  for (let i = 0; i < 7; i++) blip(cu.count + i * E16, 1500 + i * 90, 1300, 0.02, 0.018);
  // a dry pencil scratch while the formula writes (ends before the silence begins)
  sweep(cu.formula, cu.formula + 0.22, 0.012, 2400, 3200, 0);
  // the payoff on "time": chime + sub
  chime(cu.flash, [nz('D5'), nz('Fs5'), nz('A5'), nz('D6')], 0.07);
  sub(cu.flash, nz('D2'), 0.16, 0.5);
