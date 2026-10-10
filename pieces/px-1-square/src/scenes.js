
// =====================================================================
//  SCENES — px-1-square. Each era draws at its TRUE resolution inside
//  lowres(ERA_RES[e], ...); TT on 2s, whole-pixel moves only. THE SQUARE
//  thread: the ball (2x2 @ 20px) -> the life (3x3 @ 12) -> the coin ->
//  the app icon. Resolution tells time.
// =====================================================================
const [H0, H1, H2, H3] = HANDHELD;
const Q = PAL16;
const CRT = [Q.ink, Q.white, Q.grey, Q.orange];   // the B&W set + the hero's orange
const beatN = () => Math.floor(TT / BEAT + 1e-6);
const pingpong = (v, n) => { const m = mod(v, 2 * n); return m < n ? m : 2 * n - m; };

// the ball's deterministic bounce inside the 54x96 court; it homes to the
// centre square as the era ends (the bridge picks it up there)
function ballPos() {
  const cu = TIMELINE.cues;
  const homing = clamp(seg(TT, T1 - 0.6, T1 - 0.2));
  const t = TT * 12;
  const bx = 3 + pingpong(Math.floor(t * 0.7), 44), by = 10 + pingpong(Math.floor(t * 0.9), 46);
  if (homing <= 0) return [bx, by];
  return [Math.round(lerp(bx, 26, EZ.io(homing))), Math.round(lerp(by, 39, EZ.io(homing)))];
}

// =====================================================================
//  ERA 1 — 1972: PONG on a B&W CRT (54x96, 20px pixels)
// =====================================================================
function sPong() {
  const cu = TIMELINE.cues;
  lowres(ERA_RES[0], () => {
    // the CRT: ink field, a faint grey frame
    prect(0, 0, 54, 96, Q.ink);
    prect(0, 0, 54, 1, Q.grey); prect(0, 95, 54, 1, Q.grey);
    // the score (generic arcade numbers), typed on
    const su = Math.floor(clamp(seg(TT, 1.0, 2.2)));
    pixText('3', 18, 2, Q.white, { count: su }); pixText('7', 31, 2, Q.white, { count: su });
    // the court: dashed centre line
    for (let y = 9; y < 62; y += 4) prect(26, y, 2, 2, Q.grey);
    // the paddles track the ball's y (with a one-boil lag on the right)
    const [bx, by] = ballPos();
    const lag = B % 2;
    prect(3, clamp(by - 5, 9, 47), 2, 12, Q.white);
    prect(49, clamp(by - 5 + (lag ? 2 : -2), 9, 47), 2, 12, Q.white);
    // THE SQUARE: the ball, blinking on contact
    const flash = (bx <= 5 || bx >= 47) && (B % 2 === 0);
    prect(bx, by, 2, 2, flash ? Q.grey : Q.white);
    // the hero (the player) in the strip below the court, eyes on the ball
    const hop = Math.round(2 * Math.sin(Math.PI * seg(TT, cu.square, cu.square + 0.3)));
    pixHero(Math.round(lerp(20, 34, clamp(seg(TT, 2.5, 7)))), 72 + hop, 4, { pal: HERO_PAL, look: [clamp(bx - 27, -4, 4), clamp(by - 72, -3, 2)], mood: TT >= cu.whole ? 'wow' : 'smile', key: 'hero' });
    // a speck of static (life): two noise pixels blink on the boil
    if (B % 3 === 0) { pset(9 + (B % 5), 14, Q.grey); pset(41 + (B % 7), 55, Q.grey); }
    pixTag('1972', { fg: Q.white, bg: Q.ink, edge: Q.grey });
    pixCaption('TWO PADDLES. ONE SQUARE.', { fg: Q.white, bg: Q.ink, edge: Q.grey });
  }, { fx: { pal: CRT, noise: 26, noiseAmt: 0.25, flicker: 0.06 } });
}

// =====================================================================
//  ERA 2 — 1989: the handheld (90x160, 4 greens, LCD grid)
// =====================================================================
function sHandheld() {
  const cu = TIMELINE.cues;
  lowres(ERA_RES[1], () => {
    const GY = 108;
    // sky: dithered green dusk
    pgrad(0, 0, 90, GY, [H0, H0, H1, H2], { ease: (u) => u * u });
    // stars blink
    for (let i = 0; i < 12; i++) {
      const R = RNG('st2', i), x = R.i(2, 87), y = R.i(3, 60);
      if ((B + i * 5) % 13 === 0) continue;
      pset(x, y, i % 3 ? H2 : H3);
    }
    // THE SQUARE: a life (a pixel heart) floats centre — the thread object
    const hk = popS(cu.heart - 0.2);
    if (hk > 0) {
      const hx = 45, hy = Math.round(67 - 2 * Math.sin(TT * 2.2));
      prect(hx - 2, hy - 2, 4, 4, H3);
      prect(hx - 1, hy - 1, 2, 2, H2);   // the inner shine pixel
      if (beatN() % 2) sprite(SPR.heart, { a: H3, b: H2 }, hx + 5, hy - 6);
    }
    // ground + pines + tufts
    pgrad(0, GY, 90, 160 - GY, [H1, H1, H0]);
    prect(0, GY, 90, 1, H2);
    const pine = (x, base, h, w) => {
      const sway = beatN() % 2;
      prect(x - 1, base - Math.round(h * 0.22), 2, Math.round(h * 0.22) + 1, H0);
      for (let t = 0; t < 3; t++) {
        const top = base - h + Math.round(t * h * 0.24), bot = top + Math.round(h * 0.42), hw = w * (0.42 + 0.29 * t);
        ppoly([[x + 0.5 + (t === 0 ? sway : 0), top], [x + 0.5 + hw, bot], [x + 0.5 - hw, bot]], H0);
      }
    };
    pine(6, GY, 54, 9); pine(78, GY, 46, 8); pine(44, GY, 20, 4);
    for (let x = 2; x < 90; x += 9) pset(x, GY - 2, H2);
    // a beetle walks (life); the hero hops toward the heart (life + acting)
    const bxp = 92 - Math.floor(TT * 8 + 1e-6);
    sprite([['..aa..', '.abba.', 'abbbba', 'a.a.a.'], ['..aa..', '.abba.', 'abbbba', '.a.a.a']][Math.floor(TT * 12 + 1e-6) % 2], { a: H0, b: H2 }, bxp, GY - 4, { flip: true });
    const walkU = clamp(seg(TT, cu.green - 0.3, cu.heart - 0.4));
    const hx2 = Math.round(lerp(18, 38, EZ.io(walkU)));
    const hop = Math.round(5 * Math.sin(Math.PI * seg(TT, cu.heart - 0.4, cu.heart - 0.1)));
    pixHero(hx2, GY - 8, 6, { pal: HERO_HH, hop, look: [clamp(45 - hx2, -4, 4), -2], mood: TT >= cu.heart ? 'wow' : 'smile', frame: walkU > 0 && walkU < 1 ? beatN() % 2 : undefined, key: 'hero' });
    if (TT >= cu.heart && TT < cu.heart + 0.7) pixBubble('!', hx2, GY - 18, { bg: H3, edge: H0, fg: H0 });
    pixTag('1989', { fg: H3, bg: H0, edge: H2 });
    pixCaption('FOUR SHADES OF GREEN', { fg: H3, bg: H0, edge: H2 });
  }, { fx: { pal: HANDHELD } });
}

// =====================================================================
//  ERA 3 — the 16-bit era (180x320, PAL16): color, parallax, the coin
// =====================================================================
const SLIME = [
  ['..aaaa..', '.acbbba.', 'abwkbwka', 'abbbbbba', 'abbbbbba', '.aaaaaa.'],
  ['........', '..aaaa..', '.acbbba.', 'abwkbwka', 'abbbbbba', 'aaaaaaaa'],
];
const SCOIN = [
  ['.aaa.', 'awyya', 'awyya', 'awyya', 'awyya', 'awyya', '.aaa.'],
  ['.a.', 'awa', 'aya', 'aya', 'aya', 'aya', '.a.'],
  ['a', 'a', 'a', 'a', 'a', 'a', 'a'],
];
const coinFrame = (k = 0) => SCOIN[[0, 1, 2, 1][(Math.floor(TT * 6 + 1e-6) + k) % 4]];
function cloudP(x, y) {
  for (const [dx, dy, r] of [[0, 0, 5], [6, -3, 6], [13, 0, 5]]) pcircle(x + dx, y + dy, r, Q.slate);
  prect(x - 5, y + 4, 24, 3, Q.slate);
}
function bricksP(x, y, w, h) {
  prect(x, y, w, h, Q.brown);
  for (let r = 0, yy = y; yy < y + h; r++, yy += 6) {
    prect(x, yy + 5, w, 1, Q.ink);
    for (let xx = x - (r % 2 ? 6 : 0); xx < x + w; xx += 12) if (xx >= x) prect(xx, yy, 1, 5, Q.ink);
  }
}
function sArcade() {
  const cu = TIMELINE.cues;
  lowres(ERA_RES[2], () => {
    const GY = 216;
    // the 16-bit sky: dithered night with color at the horizon
    pgrad(0, 0, 180, GY, [Q.ink, Q.ink, Q.night, Q.purple], { ease: (u) => u ** 1.4 });
    for (let i = 0; i < 30; i++) {
      const R = RNG('st3', i), x = R.i(2, 177), y = R.i(4, 130);
      if ((B + i * 7) % 11 === 0) continue;
      pset(x, y, i % 4 ? Q.grey : Q.white);
    }
    // parallax: far clouds drift slow, near clouds faster — worlds learned to scroll
    [[24, 130], [140, 60]].forEach(([bx, y], k) => cloudP(mod(bx - Math.floor(TT * (k ? 8 : 4) + 1e-6), 230) - 30, y));
    // THE SQUARE: the coin (the thread object), face-on then spinning, gold + glow
    const CXC = 110, CYC = 120;
    pglow(CXC, CYC, 16, 24, Q.purple, 0.7);
    const spin = TT < cu.color + 0.3 ? 0 : Math.floor((TT - cu.color - 0.3) / E8 + 1e-6) % 6, rx = Math.round(9 * [1, 0.72, 0.36, 0.06, 0.36, 0.72][spin]);
    if (rx <= 2) { prect(CXC - 2, CYC - 9, 4, 18, Q.orange); prect(CXC - 1, CYC - 8, 1, 16, Q.yellow); }
    else {
      pellipse(CXC, CYC, rx, 9, Q.orange);
      pellipse(CXC, CYC, rx - 1, 8, Q.yellow);
    }
    for (let k = 0; k < 4; k++) if ((Math.floor(TT / E8 + 1e-6) + k) % 4 < 2) sprite(SPR.spark, { a: Q.white, b: Q.yellow }, CXC - 12 + k * 8, CYC - 12 - (k % 2) * 4);
    // the city: windows change on the beat
    for (let k = 0; k < 9; k++) {
      const R = RNG('bld3', k), bx = k * 21 + R.i(-3, 3), bw = R.i(13, 17), bh = R.i(24, 52);
      prect(bx, GY - bh, bw, bh, Q.night); prect(bx, GY - bh, bw, 1, Q.slate);
      for (let j = 0; j * 5 + 4 < bh - 2; j++) for (let i = 0; i * 4 + 3 < bw - 1; i++) {
        const lit = RNG('win3', k, i, j, beatN()).f() < 0.3;
        prect(bx + 2 + i * 4, GY - bh + 3 + j * 5, 2, 2, lit ? Q.yellow : Q.ink);
      }
    }
    // ground: grass + bricks; a patrolling slime (life)
    bricksP(0, GY + 4, 180, 104); prect(0, GY, 180, 3, Q.lime); prect(0, GY + 3, 180, 1, Q.green);
    const sp = Math.floor(TT * 12 + 1e-6), sxp = 102 + pingpong(sp, 36), dir = mod(sp, 72) < 36;
    sprite(SLIME[Math.floor(sp / 3) % 2], { a: Q.ink, b: Q.green, c: Q.lime, w: Q.white, k: Q.ink }, sxp + 4, GY - 6, { anchor: 'bc', flip: !dir });
    // the hero walks in and jumps for the coin (the callback to every platformer)
    const jumpT = cu.coin, ju = seg(TT, jumpT, jumpT + 0.6);
    const hop = ju > 0 && ju < 1 ? Math.round(60 * 4 * ju * (1 - ju)) : 0;
    const hx3 = Math.round(lerp(40, 86, EZ.io(clamp(seg(TT, cu.color, cu.coin - 0.3)))));
    pixHero(hx3, GY - 16, 11, { hop, look: [2, -2], mood: hop > 0 ? 'wow' : 'happy', frame: seg(TT, cu.color, cu.coin - 0.3) > 0 && seg(TT, cu.color, cu.coin - 0.3) < 1 ? beatN() % 2 : undefined, key: 'hero' });
    if (ju > 0 && ju < 1) sprite(SPR.twinkle, { a: Q.yellow, b: Q.white }, CXC - 6 + Math.round(6 * Math.sin(TT * 20)), CYC + 16);
    // the HUD (generic arcade vocabulary)
    pixOverlay(() => {
      pixText('SCORE 003400', 172, 51, Q.white, { align: 'right', shadow: Q.ink });
      pixText('HI 010000', 8, 51, Q.yellow, { shadow: Q.ink });
    });
    pixTag('1990S');
    pixCaption('COLOR. PARALLAX. COINS.');
  }, { fx: { pal: PAL16 } });
}

// =====================================================================
//  ERA 4 — today: the phone (360x640, 3px pixels)
// =====================================================================
const ICONS = {
  heart: [['..aa..', '.abba.', 'abbbba', 'ba..ab']],
  note: [['..aaa', '..a.a', '..a.a', 'aaaa.']],
  mail: [['aaaaaa', 'ab..ba', 'aab.aa', 'aaaaaa']],
  star: [['..aa..', '..aa..', 'aaaaaa', '.aaaa.', '..aa..', '.a..a.']],
};
function appIcon(x, y, glyph, cmap, o = {}) {
  const s = o.s ?? 1;
  pixBox(x, y, 22 * s, 22 * s, { bg: o.bg ?? Q.night, edge: o.edge ?? Q.slate, shadow: Q.ink });
  if (glyph) sprite(glyph, cmap, x + (22 * s - glyph[0][0].length * s) / 2, y + (22 * s - glyph.length * s) / 2, { scale: s });
}
function sPhone() {
  const cu = TIMELINE.cues;
  lowres(ERA_RES[3], () => {
    // the wallpaper: a dithered night sky, stars blinking
    pgrad(0, 0, 360, 640, [Q.ink, Q.ink, Q.night, Q.blue], { ease: (u) => u ** 1.3 });
    for (let i = 0; i < 70; i++) {
      const R = RNG('st4', i), x = R.i(2, 357), y = R.i(4, 400);
      if (Math.hypot(x - 135, y - 92) < 30 || (B + i * 5) % 13 === 0) continue;
      if (i % 9 === 0 && (B + i) % 6 < 3) sprite(SPR.twinkle, { a: Q.sky, b: Q.white }, x - 1, y - 1);
      else pset(x, y, i % 4 ? Q.grey : Q.white);
    }
    // the status bar (a phone is a phone)
    pixText('21:47', 8, 6, Q.white, {});
    pixText('* 100%', 300, 6, Q.white, { align: 'right' });
    // THE SQUARE: our icon, second row — the thread object, now an app
    const IXY = [137, 92];
    const glowing = TT >= cu.hit;
    if (glowing) pglow(IXY[0] + 11, IXY[1] + 11, 20, 30, Q.purple, 0.8);
    appIcon(IXY[0], IXY[1], ICONS.heart, { a: Q.white, b: Q.pink }, { bg: Q.purple, edge: glowing ? Q.white : Q.slate });
    if (glowing && (B % 2)) sprite(SPR.spark, { a: Q.white, b: Q.yellow }, IXY[0] + 20, IXY[1] - 4);
    // the icon grid: 3 rows x 4, generic glyphs, each a different palette colour
    const rows = [
      [[Q.blue, ICONS.mail, { a: Q.white }], [Q.night, ICONS.note, { a: Q.sky }], [Q.purple, ICONS.heart, { a: Q.white, b: Q.pink }], [Q.green, ICONS.star, { a: Q.yellow }]],
      [[Q.brown, ICONS.mail, { a: Q.white }], [Q.red, ICONS.heart, { a: Q.white }], [Q.slate, ICONS.star, { a: Q.white }], [Q.orange, ICONS.note, { a: Q.white }]],
    ];
    rows.forEach((row, r) => row.forEach(([bg, gl, cm], i) => {
      const x = 47 + i * 86, y = 38 + r * 96;
      if (r === 1 && i === 1) return;   // (that slot is empty — our icon is the hero's)
      appIcon(x, y, gl, cm, { bg, edge: Q.slate });
      if ((B + i + r * 2) % 7 === 0) pixBox(x, y, 22, 22, { bg, edge: Q.white, shadow: null });   // icons glint on the boil
    }));
    // a notification badge blinks on the mail icon (life)
    if (B % 2) { pcircle(47 + 18, 38 + 4, 4, Q.red); pixText('1', 47 + 15, 3, Q.white, {}); }
    // the dock at the bottom: 4 icons, the hero standing beside it
    [[Q.purple, ICONS.heart], [Q.green, ICONS.star], [Q.blue, ICONS.mail], [Q.orange, ICONS.note]].forEach(([bg, gl], i) => {
      appIcon(88 + i * 62, 330, gl, { a: Q.white }, { bg, edge: Q.slate });
    });
    pixBox(80, 324, 240, 34, { bg: null, edge: Q.slate, shadow: null });
    // the hero, sharp at last (r 16 low-res), watches the count, then winks at us
    const heroLook = TT < cu.icon ? [0, -3] : [0, 0];
    pixHero(200, 300, 15, { pal: HERO_PAL, look: heroLook, mood: TT >= cu.hit ? 'happy' : 'wow', hop: Math.round(6 * Math.sin(Math.PI * seg(TT, cu.icon, cu.icon + 0.3))), key: 'hero' });
    // THE COUNT: the number of pixels on this very screen, stepping up to 2,073,600
    const cnt = clamp(seg(TT, cu.today + 0.4, cu.count + 0.6));
    if (cnt > 0) {
      const steps = [2, 16, 256, 4096, 65536, 262144, 1048576, 2073600];
      const n = steps[Math.min(steps.length - 1, Math.floor(cnt * steps.length))];
      pixOverlay(() => {
        pixText(String(n) + ' PX', 352, 348, n >= 1048576 ? Q.yellow : Q.white, { align: 'right', shadow: Q.ink, scale: 2 });
      });
    }
    // THE END: the icon bounces like Pong's ball — the ball never stopped
    const bo = seg(TT, cu.bounce, cu.bounce + 1.4);
    if (bo > 0 && bo < 1) {
      const k = pingpong(Math.floor(bo * 8), 3);
      appIcon(IXY[0] + k * 4, IXY[1] - Math.abs(Math.round(2 * Math.sin(bo * Math.PI * 2))), ICONS.heart, { a: Q.white, b: Q.pink }, { bg: Q.purple, edge: Q.white });
      // the paddles flash at the court's edges (the callback)
      if (k === 0 || k === 3) prect(IXY[0] - 8, IXY[1] + 8, 2, 8, Q.white);
    }
    pixTag('TODAY', { fg: Q.white, bg: Q.ink, edge: Q.slate });
    if (TT < cu.hit) pixCaption('OVER TWO MILLION PIXELS', { fg: Q.white, bg: Q.ink, edge: Q.slate });
    else if (TT < cu.bounce) pixCaption("NOW IT'S AN ICON", { fg: Q.white, bg: Q.ink, edge: Q.slate, at: cu.icon });
    else pixCaption('THE BALL NEVER STOPPED', { fg: Q.white, bg: Q.ink, edge: Q.slate, at: cu.bounce });
  }, { fx: { pal: PAL16 } });
}
