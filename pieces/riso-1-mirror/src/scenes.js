
// =====================================================================
//  SCENES — riso-1-mirror. World coords 1080x1920; TT on 2s.
//  Every colour is plate tones. The noise = pink; the mirror = teal;
//  silence = paper (knockouts). Each world: a coarse field + one world layer.
// =====================================================================
const NOISE = { pink: 0.62, yellow: 0.05 };       // the drone
const MIRR = { teal: 0.66, yellow: 0.04 };        // the anti-wave
const MIDY = 880;                                  // the wave band's centre line

// a printed wave ribbon: constant-thickness band whose centreline is a sine
function waveRibbon(y0, amp, k, ph, th, tones, key, o = {}) {
  const top = [], bot = [];
  const x0 = o.x0 ?? -80, x1 = o.x1 ?? W + 80;
  for (let x = x0; x <= x1; x += 26) {
    top.push([x, y0 + Math.sin(x * k + ph) * amp]);
    bot.push([x, y0 + th + Math.sin(x * k + ph) * amp]);
  }
  fill(hand([...top, ...bot.reverse()], key, 1.1), tones);
}
// a wavy line (the captured wave / the flip)
function waveLine(y0, amp, k, ph, x0, x1, tones, key, o = {}) {
  const P = [];
  for (let x = x0; x <= x1; x += 22) P.push([x, y0 + Math.sin(x * k + ph) * amp]);
  line(P, tones, { w: o.w ?? 10, amt: 1, key, knock: o.knock ?? true });
}
// a peak / trough marker dot at the wave's extremum nearest to x
function waveDot(y0, amp, k, ph, x, tones, key) {
  const y = y0 + Math.sin(x * k + ph) * amp;
  fill(circ(x, y, 13), tones);
  return y;
}

// the hero's headphones: a band arc + two teal cups on the ink-blue bean
function phonesOn(x, y, r, o = {}) {
  risoHero(x, y, r, o);
  line(arcPts(x, y - r * 0.12, r * 1.12, Math.PI * 1.15, Math.PI * 1.85, 18), MIX.dark, { w: 12, amt: 0.6, key: (o.key ?? 'hero') + 'band', knock: true });
  fill(ell(x - r * 0.86, y - r * 0.05, r * 0.2, r * 0.28, 0), { teal: 0.85, pink: 0.1 });
  fill(ell(x + r * 0.86, y - r * 0.05, r * 0.2, r * 0.28, 0), { teal: 0.85, pink: 0.1 });
}

// =====================================================================
//  ERA 1 / ERA 6 — the cabin (and, quiet, the same world changed)
// =====================================================================
function sCabin(o = {}) {
  const cu = TIMELINE.cues, quiet = o.quiet;
  beginSheet();
  // ---- the far field: the cabin air (warm, dim; a pink glow behind the wall when the drone is ON)
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-80, -80, W + 160, H + 160), { teal: 0.1, pink: quiet ? 0.03 : 0.07, yellow: 0.3 });
    if (!quiet) fill(circ(1030, 950, 560), { pink: rad(1030, 950, 120, 560, [[0, 0.34], [1, 0]]) }, { over: true });
  });
  // ---- the world
  printed(PITCH.world, { shapes: true }, () => {
    // the cabin wall (right) with rivets; the engine lives behind it
    fill(rect(860, -80, 260, H + 160), { teal: 0.55, pink: 0.3, yellow: 0.2 });
    fill(rect(850, -80, 22, H + 160), MIX.dark);
    for (let y = 260; y < H; y += 150) fill(circ(960, y, 12), {});
    specks(880, 200, 1060, 1700, 50, 'wall');
    // the window: a knocked rounded rect with printed sky and drifting clouds (life)
    fill(rrect(190, 420, 300, 380, 26), MIX.dark);
    fill(rrect(206, 436, 268, 348, 20), { teal: 0.22, yellow: 0.42 });
    const drift = quiet ? (TT - B2) * 26 : TT * 7;   // the clouds drift; in the quiet they have somewhere to be
    clipTo((g) => { g.rect(206, 436, 268, 348); });
    for (let i = 0; i < 3; i++) {
      const cx = 300 + ((drift * (0.5 + i * 0.25) + i * 140) % 340) - 60;
      fill(hand(ellipsePts(cx, 590 + i * 55, 70 - i * 10, 30 - i * 4, 0, 18), 'cloud' + i, 1.5), {});
    }
    unclip();
    line([[206, 600], [474, 600]], MIX.dark, { w: 6, amt: 0.7, key: 'winbar', knock: true });
    // the seat: a printed bench
    fill(rect(-80, 1150, 720, 300), { teal: 0.5, pink: 0.2, yellow: 0.25 });
    fill(rect(-80, 1130, 720, 40), MIX.dark);
    for (let x = 20; x < 640; x += 120) line([[x, 1170], [x + 8, 1430]], MIX.blue, { w: 5, amt: 0.8, key: 'seat' + x });
    // the drone's waves washing the cabin (NOT in the quiet world — the knockout IS the silence)
    if (!quiet) {
      const drift = TT * 2.4;
      waveRibbon(560, 52, 0.012, drift, 26, NOISE, 'w1');
      waveRibbon(700, 62, 0.010, drift * 0.8 + 1.2, 26, NOISE, 'w2');
      waveRibbon(940, 46, 0.013, drift * 1.15 + 2.6, 24, NOISE, 'w3');
    } else {
      // the quiet: a knocked ripple where the waves were — flat and still
      line([[120, 620], [820, 622]], MIX.yellow, { w: 8, amt: 0.5, key: 'flatline', knock: true });
      // the coffee (the calm) + steam wisps that keep the quiet alive
      fill(ell(220, 1120, 46, 34, 0), { yellow: 0.8, pink: 0.2 });
      fill(ell(220, 1112, 30, 20, 0), MIX.dark);
      line([[150, 1150], [290, 1152]], MIX.dark, { w: 5, amt: 0.5, key: 'mug', knock: true });
      for (let i = 0; i < 3; i++) {
        const sp = [];
        for (let k = 0; k <= 8; k++) sp.push([220 - 22 + i * 22 + Math.sin(k * 0.9 + i + TT * 3) * 10, 1078 - k * 18]);
        line(sp, MIX.yellow, { w: 5, taper: 0.4, amt: 0.8, key: 'steam' + i, knock: true });
      }
      // a bird crosses the window sky (life in the quiet)
      const bx = 220 + ((TT - B2) * 60) % 260, by = 540 + Math.sin(TT * 3) * 10, up = B % 2 ? 14 : -4;
      line([[bx - 20, by - up], [bx - 7, by - 2], [bx, by + 3], [bx + 7, by - 2], [bx + 20, by - up]], MIX.blue, { w: 5, taper: 0.3, amt: 0.6, key: 'bird', knock: true });
      // "isn't magic": a printed sparkle pops on the word — and a teal X crosses it out
      const mg = popS(cu.magic - 0.1);
      if (mg > 0) {
        const sx = 780, sy = 640, sr = 52 * mg;
        fill(poly([[sx, sy - sr], [sx + sr * 0.28, sy - sr * 0.28], [sx + sr, sy], [sx + sr * 0.28, sy + sr * 0.28], [sx, sy + sr], [sx - sr * 0.28, sy + sr * 0.28], [sx - sr, sy], [sx - sr * 0.28, sy - sr * 0.28]]), { yellow: 0.95 });
        const xk = clamp(seg(TT, cu.magic + 0.35, cu.magic + 0.6));
        if (xk > 0) {
          line([[lerp(sx - 66, sx + 66, xk), lerp(sy - 66, sy + 66, xk)], [lerp(sx + 66, sx - 66, xk), lerp(sy - 66, sy + 66, xk)]], { teal: 1 }, { w: 13, knock: true, key: 'xout' });
        }
      }
    }
    // the hero: in the seat, headphones on; wow at the waves (or calm, arms swaying, in the quiet)
    phonesOn(420, 1120, 108, { key: 'hero', mood: quiet ? 'happy' : (TT < cu.hears ? 'wow' : 'smile'), look: quiet ? [0.2, 0.2] : [0.9, -0.3], arms: quiet ? [2.6 + Math.sin(TT * 1.4) * 0.16, 0.4 + Math.sin(TT * 1.1) * 0.1] : [0.5, 0.4] });
  });
  endSheet();
  risoTag(quiet ? 'the cabin, quiet' : 'the cabin');
  risoCaption(quiet ? 'not magic. a mirror' : 'the engine never stops');
}

// =====================================================================
//  ERA 2 — the earcup close-up: the mic hears it; the chip flips the wave
// =====================================================================
function sEarcup() {
  const cu = TIMELINE.cues;
  beginSheet();
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-80, -80, W + 160, H + 160), { teal: 0.16, pink: 0.05, yellow: 0.18 });
    fill(circ(540, 830, 560), { teal: rad(540, 830, 200, 560, [[0, 0.14], [1, 0]]) }, { over: true });
  });
  printed(PITCH.world, { shapes: true }, () => {
    // the earcup: a big ink-blue circle with a paper rim and a knocked driver
    fill(circ(540, 830, 348), MIX.blue);
    rim(540, 830, 348, 'cuprim', { tones: MIX.dark, w: 12 });
    fill(circ(540, 830, 250), {});
    rim(540, 830, 250, 'driverrim', { tones: { teal: 0.4 }, w: 7 });
    // the mic on the rim: a small pink circle with listening pulse rings
    const mk = popS(cu.mic);
    if (mk > 0) {
      fill(circ(806, 590, 26), { pink: 0.9 });
      for (let i = 0; i < 3; i++) {
        const pr = ((TT * 1.6 + i / 3) % 1);
        line(arcPts(806, 590, 40 + pr * 90, -0.5, 0.5, 8), { pink: 0.7 }, { w: 5, taper: 0.4, amt: 1, key: 'pulse' + i, knock: true, frac: 1 - pr });
      }
      type('mic', 806, 540, 34, { pink: 0.9 }, { align: 'center', key: 'miclbl' });
    }
    // the captured drone wave arriving (pink, wavy lines entering from the right toward the mic)
    const hk = ev(cu.hears, 0.5);
    if (hk > 0) {
      for (let i = 0; i < 3; i++) waveLine(430 + i * 64, 34 - i * 6, 0.02, TT * 2.2 + i, Math.min(900 + (1 - hk) * 200, 1000), 1040, NOISE, 'inw' + i, { w: 8, frac: hk });
    }
    // the chip: a small dark board with pins, at the cup's bottom
    fill(rrect(430, 1210, 220, 130, 12), MIX.dark);
    specks(445, 1222, 635, 1328, 30, 'chip');
    for (let i = 0; i < 4; i++) { line([[470 + i * 46, 1210], [470 + i * 46, 1170]], MIX.yellow, { w: 5, amt: 0.8, key: 'pin' + i, knock: true }); line([[470 + i * 46, 1340], [470 + i * 46, 1380]], MIX.yellow, { w: 5, amt: 0.8, key: 'pinb' + i, knock: true }); }
    type('chip', 540, 1290, 40, {}, { align: 'center', key: 'chiplbl' });
    // THE FLIP: the wave drawn above the chip, and its teal copy rotating phase 0 -> pi below
    const fk = ev(cu.flip, 1.1);
    if (fk > 0) {
      waveLine(1020, 40, 0.02, 0.6, 260, 820, NOISE, 'capw', { w: 9, frac: clamp(fk * 2) });
      // the mirror copy: its phase slides from 0 to PI — the flip itself
      const phase = Math.PI * EZ.io(clamp((fk - 0.35) / 0.65));
      waveLine(1420, 40, 0.02, 0.6 + phase, 260, 820, MIRR, 'flipw', { w: 9, frac: clamp((fk - 0.3) * 2) });
      // the flip arrow: a curved arrow between them
      const ak = clamp((fk - 0.5) * 2);
      if (ak > 0) line(arcPts(540, 1220, 240, -Math.PI * 0.8, -Math.PI * 0.2, 14), MIX.yellow, { w: 7, taper: 0.35, amt: 0.8, key: 'flipar', knock: true, frac: ak });
      if (phase > Math.PI * 0.9) type('flipped', 790, 1300, 44, { teal: 0.9 }, { align: 'center', key: 'fliplbl', frac: clamp((fk - 0.85) * 4) });
    }
  });
  endSheet();
  risoTag('the earcup');
  risoCaption('hear it. flip it');
}

// =====================================================================
//  ERA 3 — the mirror wave (the diagram world, paper field)
// =====================================================================
function sMirror() {
  const cu = TIMELINE.cues;
  beginSheet();
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-80, -80, W + 160, H + 160), { yellow: 0.1, teal: 0.02 });
  });
  printed(PITCH.world, { shapes: true }, () => {
    // the mirror line: a knocked dashed centre line
    for (let x = 60; x < W - 40; x += 70) fill(rect(x, MIDY - 3, 44, 6), { teal: 0.5 });
    // the drone's wave (pink, upper) — static, captured
    waveRibbon(MIDY - 240, 70, 0.013, 1.9, 30, NOISE, 'mnoise');
    type('the noise', 130, MIDY - 400, 46, { pink: 0.9 }, { key: 'nlbl' });
    // THE MIRROR: the teal copy, upside down, unfolds below (phase = pi)
    const mk = ev(cu.mirror, 0.7);
    if (mk > 0) {
      waveRibbon(MIDY + 240, 70, 0.013, 1.9 + Math.PI, 30, MIRR, 'mmirror');
      type('the mirror', 130, MIDY + 400, 46, { teal: 0.9 }, { key: 'mlbl' });
    }
    // peak/trough marks: a pink peak above meets a teal trough below (the pairing made visible)
    if (mk > 0.5) {
      for (const x of [320, 540, 760]) {
        const yTop = MIDY - 240 + Math.sin(x * 0.013 + 1.9) * 70;
        const yBot = MIDY + 240 + Math.sin(x * 0.013 + 1.9 + Math.PI) * 70;
        fill(circ(x, yTop, 15), { pink: 0.95 });
        fill(circ(x, yBot, 15), { teal: 0.95 });
        line([[x, yTop + 24], [x, yBot - 24]], MIX.yellow, { w: 4, amt: 0.7, key: 'pair' + x, knock: true, dash: undefined });
      }
    }
    // the hero, small, watching its own equipment work
    phonesOn(540, 1560, 84, { key: 'hero', mood: 'wow', look: [0, -0.8] });
  });
  endSheet();
  risoTag('flipped');
  risoCaption('the mirror wave');
}

// =====================================================================
//  ERA 4 — both play: the two trains approach (the peak: busy, not loud)
// =====================================================================
function sBothPlay() {
  const cu = TIMELINE.cues;
  beginSheet();
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-80, -80, W + 160, H + 160), { yellow: 0.12, teal: 0.02, pink: 0.02 });
  });
  printed(PITCH.world, { shapes: true }, () => {
    const k = 0.013, amp = 95;
    // the noise train: scrolls RIGHT, pink, entering from the left
    const nph = -TT * 2.0 + 1.9;
    // the mirror train: scrolls LEFT, teal, phase-shifted by PI (anti-phase when they meet)
    const mph = TT * 2.0 + 1.9 + Math.PI;
    // the trains draw as ribbons whose spans GROW toward each other on "straight at the noise"
    const app = EZ.io(clamp(seg(TT, cu.attack, K3 - 0.15)));
    const nX1 = -80 + (W + 160) * (0.28 + 0.24 * app);   // the noise reaches right
    const mX0 = W + 80 - (W + 160) * (0.28 + 0.24 * app); // the mirror reaches left
    waveRibbon(MIDY, amp, k, nph, 30, NOISE, 'bnoise', { x0: -80, x1: nX1 });
    waveRibbon(MIDY, amp, k, mph, 30, MIRR, 'bmirror', { x0: mX0, x1: W + 80 });
    // the speaker: the hero's cup emits the mirror (pulse rings from the right)
    if (TT >= cu.play) {
      for (let i = 0; i < 4; i++) {
        const pr = ((TT * 1.4 + i / 4) % 1);
        line(arcPts(540, 1560, 120 + pr * 240, -Math.PI * 0.75, -Math.PI * 0.25, 12), { teal: 0.6 }, { w: 7, taper: 0.4, amt: 1, key: 'emit' + i, knock: true, frac: 1 - pr });
      }
    }
    // peak meets trough: the pairing dots lock as the trains close (on "peak")
    if (TT >= cu.peak) {
      const lock = clamp(seg(TT, cu.peak, K3));
      for (const x of [340, 540, 740]) {
        const yn = MIDY + Math.sin(x * k + nph) * amp;
        const ym = MIDY + Math.sin(x * k + mph) * amp;
        fill(circ(x, yn, 15), { pink: 0.95 });
        fill(circ(x, ym, 15), { teal: 0.95 });
        // the closing bracket: the two dots' vertical gap shrinks with lock
        line([[x, lerp(yn, MIDY, lock)], [x, lerp(ym, MIDY, lock)]], MIX.yellow, { w: 4, amt: 0.8, key: 'lock' + x, knock: true });
      }
    }
    // labels: which train is which (right-aligned by width — type() only centers)
    type('noise ->', 180, MIDY - 200, 40, { pink: 0.9 }, { key: 'nlbl2' });
    type('<- mirror', 900 - typeW('<- mirror', 40), MIDY + 200, 40, { teal: 0.9 }, { key: 'mlbl2' });
    // the hero at the bottom, braced: the cup is doing its job
    phonesOn(540, 1560, 92, { key: 'hero', mood: TT < cu.peak ? 'focus' : 'wow', look: [0, -0.8], arms: [0.9, 0.9] });
  });
  endSheet();
  risoTag('both play');
  risoCaption('peak meets trough');
}

// =====================================================================
//  ERA 5 — THE MEET: they lock, and the cancellation blooms to paper
// =====================================================================
function sTheMeet() {
  const cu = TIMELINE.cues;
  beginSheet();
  printed(PITCH.field, { full: true }, () => {
    fill(rect(-80, -80, W + 160, H + 160), { yellow: 0.1, teal: 0.02, pink: 0.02 });
  });
  printed(PITCH.world, { shapes: true }, () => {
    const k = 0.013, amp = 95;
    const settle = EZ.io(clamp(seg(TT, K3, K3 + 0.3)));
    // the trains, now interleaved: pink keeps scrolling, teal converges to anti-phase
    const nph = -TT * 2.0 + 1.9;
    const mph = lerp(TT * 2.0 + 1.9 + Math.PI, nph + Math.PI, settle);   // the mirror LOCKS to the noise's anti-phase
    // THE CANCELLATION: a knocked (paper) band where they overlap — the sum, flat
    const bloom = EZ.o2(clamp(seg(TT, cu.bloom, cu.bloom + 0.9)));
    if (bloom > 0) {
      const bw = lerp(60, W * 0.94, bloom), bh = lerp(30, 235, bloom);
      fill(hand(boxPts(540 - bw / 2, MIDY - bh / 2, bw, bh), 'cancel', 2), {});
      // the flat sum line, drawn through the cancelled zone
      line([[540 - bw / 2 + 20, MIDY], [540 + bw / 2 - 20, MIDY]], MIX.yellow, { w: 5, amt: 0.6, key: 'sumline', knock: true, dash: undefined, frac: bloom });
    }
    // the trains outside the bloom still show (they thin toward the meet)
    waveRibbon(MIDY, amp, k, nph, 26, NOISE, 'fnoise', { x0: -80, x1: 540 - (bloom * 400) });
    waveRibbon(MIDY, amp, k, mph, 26, MIRR, 'fmirror', { x0: 540 + (bloom * 400), x1: W + 80 });
    // the pairing dots, converging INTO the flat line
    for (const x of [340, 540, 740]) {
      const yn = MIDY + Math.sin(x * k + nph) * amp * (1 - bloom);
      const ym = MIDY + Math.sin(x * k + mph) * amp * (1 - bloom);
      if (Math.abs(yn - MIDY) > 22) fill(circ(x, yn, 13), { pink: 0.9 });
      if (Math.abs(ym - MIDY) > 22) fill(circ(x, ym, 13), { teal: 0.9 });
    }
    // labels: the sum
    if (bloom > 0.4) type('noise + mirror = 0', 540, MIDY - 320, 46, MIX.dark, { align: 'center', key: 'sumlbl', frac: clamp((bloom - 0.4) * 3) });
    // the hero below, eyes closed: the quiet arrives
    phonesOn(540, 1500, 96, { key: 'hero', mood: bloom > 0.5 ? 'happy' : 'wow', look: [0, 0.1], arms: [2.5, 0.4] });
  });
  endSheet();
  risoTag('cancelled');
  risoCaption('they cancel');
}

// ---- END OF SCENES (era 6 = sCabin({ quiet: true }), defined above) ----
