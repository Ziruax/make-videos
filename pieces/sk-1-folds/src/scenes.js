
// =====================================================================
//  SCENES — sk-1-folds. World coords 1080x1920 (the page); TT on 2s.
//  One page, two eras. Things are DRAWN, not popped: pencil -> ink;
//  the secret nose fold gets the one highlighter swipe; terracotta is
//  the hero only. Fold geometry: the sheet 230-850 x 390-1170.
// =====================================================================
const SX0 = 230, SX1 = 850, SY0 = 390, SY1 = 1170, SMX = 540;
const SHEET_P = [[SX0, SY0], [SX1, SY0], [SX1, SY1], [SX0, SY1]];

// a circled step number in graphite (the instruction page's numbering)
function stepNum(n, x, y, t) {
  const k = popS(t);
  if (k <= 0) return;
  gline(loopPts(x, y, 34 * k, 34 * k, 0.05), { key: 'sn' + n, w: 3, a: 0.8 });
  handLetter(String(n), x, y + 26 * k, 56, { col: SK.graph, key: 'snl' + n });
}

// background life: a tiny ant walking a pencil line (from the demo, keyed to this page)
function ant(x, y, s, key) {
  for (let i = 0; i < 3; i++) { ctx.fillStyle = SK.ink; ctx.beginPath(); ctx.ellipse(x + (i - 1) * 11 * s, y - 6 * s, (i === 1 ? 5 : 6.5) * s, 5 * s, 0, 0, TAU); ctx.fill(); }
  const k = B % 2 ? 1 : -1;
  for (let i = 0; i < 3; i++) gline([[x + (i - 1) * 8 * s, y - 4 * s], [x + (i - 1) * 8 * s + k * (i % 2 ? 5 : -5) * s, y + 3 * s]], { w: 1.8 * s, key: key + i, amp: 0.3, second: false, step: 4 });
  gline([[x + 16 * s, y - 8 * s], [x + 24 * s, y - 16 * s]], { w: 1.6 * s, key: key + 'a', amp: 0.3, second: false, step: 4 });
}
// background life: the margin plane looping a figure-eight (the demo's)
function marginPlane(key) {
  const at = (p) => [830 + 120 * Math.sin(TAU * p), 410 + 55 * Math.sin(2 * TAU * p)];
  const p = TT / 3, trail = [];
  for (let i = 0; i <= 24; i++) trail.push(at(p - 0.35 + 0.35 * i / 24));
  ctx.save(); ctx.setLineDash([10, 12]); gpencil(trail, { key: key + 't', w: 2.2, a: 0.55, passes: 1, amp: 1 }); ctx.restore();
  const [x, y] = at(p), [x2, y2] = at(p + 0.01);
  paperPlane(x, y, Math.atan2(y2 - y, x2 - x), 1.15, key);
}

// the finished dart, top view (the fold cascade's result), drawn at (540, 780)
function dartPts(s = 1, cy = 780) {
  const nose = 420 * s, tail = 1150 * s, wingY = 1030 * s, wingX = 300;
  const s2 = 540 + (540 - wingX);
  return { nose: [SMX, lerp(cy - 350 * s, cy, 0) + (nose - 780)], P: [[SMX, 420], [wingX, wingY], [SX0 + 24, tail], [s2, tail], [SMX + 250, wingY]], spine: [[SMX, 420], [SMX, tail]], wings: [[[SMX, 470], [wingX, wingY]], [[SMX, 470], [s2, wingY]]] };
}

// =====================================================================
//  ERA 1 — THE MAKING: the five folds, pencil -> ink, the secret highlighted
// =====================================================================
function sMaking() {
  const cu = TIMELINE.cues;
  sketchPage({ grid: 'dots' });
  // the ground line the hero stands on; an ant; margin stars; the margin plane
  gpencil([[110, 1470], [420, 1464], [700, 1472], [960, 1466]], { key: 'ground', w: 3, a: 0.7 });
  ant(560 + 110 * TT, 1469, 1.4, 'ant');
  [[110, 560, 0], [168, 760, 1], [96, 930, 2]].forEach(([x, y, i]) => doodleStar(x, y, 22 + 7 * ((B + i) % 3 === 0), 'mstar' + i, { w: 3.2 }));

  // ---- THE SHEET: pencil construction, then ink (drawn, not popped)
  gpencil(SHEET_P, { key: 'sheetp', w: 2.6, a: 0.6, part: ev(cu.sheet, 0.7) });
  gfill(SHEET_P, SK.card, { key: 'sheetf', a: 0.85, off: [2, 3] });
  gline(SHEET_P, { key: 'sheet', w: 5, closed: true, part: ev(cu.sheet + 0.5, 0.6) });
  const sheetTip = writeEnd(SHEET_P, ev(cu.sheet, 0.7));
  if (TT < cu.half) pencilTool(sheetTip[0], sheetTip[1], -0.75 + 0.08 * Math.sin(B * 1.7), 1);

  // ---- FOLD 1: in half, open back up — the dashed centre crease
  stepNum(1, 150, 470, cu.five);
  ctx.save(); ctx.setLineDash([16, 14]);
  gpencil([[SMX, SY0 + 8], [SMX, SY1 - 8]], { key: 'crease1', w: 3.4, a: 0.85, part: ev(cu.half, 0.45) });
  ctx.restore();
  // the fold gesture: a curved arrow showing the halves closing then opening
  arrowPencil([[420, 520], [500, 560], [532, 640]], ev(cu.half + 0.3, 0.4));
  arrowPencil([[SMX, 660], [SMX, 660]], 0);   // (no-op placeholder keeps numbering honest)

  // ---- FOLD 2: both corners to the middle line — diagonal creases, flaps hatched
  stepNum(2, 150, 700, cu.corners - 0.1);
  const c2 = ev(cu.corners, 0.5);
  for (const sgn of [-1, 1]) {
    const cxp = sgn < 0 ? SX0 : SX1;
    gpencil([[cxp, SY0], [SMX, 760]], { key: 'd2' + sgn, w: 2.6, a: 0.75, part: c2 });
  }
  // the folded flaps: paper-filled triangles with hatch, inked edges (settling)
  if (c2 > 0.5) {
    const f2 = clamp((c2 - 0.5) * 2);
    for (const sgn of [-1, 1]) {
      const cxp = sgn < 0 ? SX0 : SX1;
      const flap = [[cxp, SY0], [SMX, 760], [cxp, 640]];
      gfill(flap, SK.card, { key: 'flap2' + sgn, a: 0.9 * f2, off: [1, 2] });
      ctx.save(); gclip(flap);
      ghatch(Math.min(cxp, SMX) - 40, 380, Math.max(cxp, SMX) + 40, 800, { ang: sgn * 0.7, gap: 11, col: SK.graph, w: 2, a: 0.4 * f2, key: 'fh2' + sgn });
      ctx.restore();
      gline([[cxp, SY0], [SMX, 760]], { key: 'fi2' + sgn, w: 4, part: clamp(c2 * 2 - 1) });
    }
  }

  // ---- FOLD 3: the edges back to the middle — steeper creases, the point sharpens
  stepNum(3, 150, 930, cu.edges - 0.1);
  const c3 = ev(cu.edges, 0.5);
  for (const sgn of [-1, 1]) {
    const cxp = sgn < 0 ? SX0 : SX1;
    gpencil([[cxp, 640], [SMX, 560]], { key: 'd3' + sgn, w: 2.6, a: 0.75, part: c3 });
    if (c3 > 0.6) gline([[cxp, 640], [SMX, 560]], { key: 'fi3' + sgn, w: 4, part: clamp(c3 * 2 - 1.2) });
  }
  // the pencil prop follows the working crease through folds 2-3
  if (TT >= cu.corners && TT < cu.edges + 0.4) {
    const w = writeEnd([[SX0, SY0], [SMX, 760], [SX1, SY0]], clamp((TT - cu.corners) / (cu.edges + 0.2 - cu.corners)));
    pencilTool(w[0], w[1], -0.6 + 0.1 * Math.sin(B * 1.9), 1);
  }

  // ---- FOLDS 4 + 5: in half, wings down — the finished dart silhouette
  stepNum(4, 826, 470, cu.wings - 0.1);
  stepNum(5, 826, 700, cu.wings + 0.3);
  const c4 = ev(cu.wings, 0.7);
  if (c4 > 0) {
    const D = dartPts();
    // the halves close: the centre line inks solid; the outer sheet dims to graphite
    gline(D.spine, { key: 'spine', w: 4.5, part: clamp(c4 * 1.4) });
    // the wings: their creases from the nose out, then the final outline
    for (const sgn of [0, 1]) gline(D.wings[sgn], { key: 'wing' + sgn, w: 4, part: clamp(c4 * 2 - 0.7 - sgn * 0.3) });
    gline(D.P, { key: 'dart', w: 5, closed: true, part: clamp(c4 * 2 - 1.1) });
    gfill(D.P, SK.card, { key: 'dartf', a: 0.9 * clamp(c4 * 2 - 1.3), off: [2, 3] });
    if (TT >= cu.wings && TT < cu.secret) {
      const w = writeEnd([...D.wings[0], ...D.wings[1].reverse()], clamp(c4 * 1.6));
      pencilTool(w[0], w[1], -0.5 + 0.1 * Math.sin(B * 2.1), 1);
    }
  }

  // ---- THE SECRET: one tiny fold at the nose — THE highlighter swipe
  stepNum(6, 826, 930, cu.secret);
  const ns = ev(cu.nose, 0.5);
  if (ns > 0) {
    // the nose band: two lines across the tip, the tip flap folds down
    gline([[SMX - 88, 480], [SMX + 88, 480]], { key: 'noseA', w: 4, part: ns });
    gline([[SMX - 74, 545], [SMX + 74, 545]], { key: 'noseB', w: 4, part: clamp(ns * 2 - 1) });
    // the folded tip: hatched (weight!) and inked
    const tipP = [[SMX - 74, 480], [SMX + 74, 480], [SMX + 62, 545], [SMX - 62, 545]];
    ctx.save(); gclip(tipP);
    ghatch(SMX - 80, 470, SMX + 80, 560, { ang: 0.4, gap: 8, col: SK.graph, w: 2.4, a: 0.75 * clamp(ns * 2 - 1), key: 'noseh' });
    ctx.restore();
    gline(tipP, { key: 'noseT', w: 4, closed: true, part: clamp(ns * 2 - 1) });
    // THE highlight: the one glowing thing on the page — over the nose band
    const hp = clamp((ns - 0.6) * 2.2);
    if (hp > 0) highlight(SMX - 96, SMX + 96, 470, 110, hp, { key: 'noseHi' });
    arrowPencil([[SMX + 120, 430], [SMX + 150, 500], [SMX + 130, 560]], clamp(ns * 2 - 1.2));
    if (TT >= cu.nose && TT < cu.weight) sparkle(SMX + 96, 430, 30 + 6 * (B % 2), 'nosesp');
  }

  // ---- THE PHYSICS: weight forward of the lift — a small side-view diagram
  const ph = ev(cu.weight, 0.5);
  if (ph > 0) {
    const dx = 180, dy = 1230;
    // the dart in profile, on a fulcrum at the quarter point
    const prof = [[dx - 130, dy], [dx + 120, dy - 10], [dx + 130, dy - 26], [dx - 130, dy - 12]];
    gfill(prof, SK.card, { key: 'proff', a: 0.9, off: [1, 2] });
    gline(prof, { key: 'prof', w: 4, closed: true, part: clamp(ph * 1.4) });
    gline([[dx - 30, dy], [dx - 30, dy + 40]], { key: 'ful', w: 3.4, part: clamp(ph * 2 - 0.6) });
    gline([[dx - 46, dy + 40], [dx - 14, dy + 40]], { key: 'fulb', w: 3.4, part: clamp(ph * 2 - 0.8) });
    // weight: down at the nose (forward); lift: up behind it
    gline([[dx - 96, dy - 40], [dx - 96, dy - 8]], { key: 'wArr', w: 4, part: clamp(ph * 2 - 0.9) });
    arrowPencil([[dx - 96, dy - 8], [dx - 96, dy - 4]], clamp(ph * 2 - 1.2));
    gline([[dx + 40, dy - 64], [dx + 40, dy - 32]], { key: 'lArr', w: 4, part: clamp(ph * 2 - 1.1) });
    arrowPencil([[dx + 40, dy - 32], [dx + 40, dy - 28]], clamp(ph * 2 - 1.4));
    handLetter('weight', dx - 156, dy - 74, 38, { col: SK.graph, key: 'wl', reveal: clamp(ph * 2 - 1) });
    handLetter('lift', dx + 10, dy - 92, 38, { col: SK.graph, key: 'll', reveal: clamp(ph * 2 - 1.2) });
  }

  // ---- THE DIHEDRAL: wings up, a shallow V — the front view
  const dh = ev(cu.shallow - 0.15, 0.4);
  if (dh > 0) {
    const vx = 700, vy = 1230;
    gline([[vx - 200, vy - 70], [vx, vy + 8], [vx + 200, vy - 70]], { key: 'vee', w: 4.5, part: dh });
    gline([[vx, vy + 8], [vx, vy + 34]], { key: 'veec', w: 3, part: clamp(dh * 2 - 0.8) });
    ctx.save(); ctx.setLineDash([8, 10]);
    gpencil([[vx - 200, vy + 6], [vx + 200, vy + 6]], { key: 'veeflat', w: 2.6, a: 0.6 });
    ctx.restore();
    handLetter('a shallow V', vx - 120, vy - 96, 36, { col: SK.graph, key: 'vl', reveal: clamp(dh * 2 - 1) });
  }

  // ---- the hero: the maker, on the ground line, watching the folds land
  const focus = TT >= cu.half, wow = TT >= cu.nose && TT < cu.wings + 1;
  doodleHero(230, 1380, 96, {
    key: 'hero', legs: true, mood: wow ? 'wow' : focus ? 'calm' : 'puzzled',
    look: [0.9, -0.5], step: 0,
    arms: TT >= cu.secret && TT < cu.nose ? [-1.1, 1.2] : [-0.5, 0.5],
    sy: 1 + 0.04 * Math.sin(TT * 3.2), sx: 1 - 0.03 * Math.sin(TT * 3.2),
  });
  if (!focus) handLetter('?', 320, 1230 + 6 * Math.sin(B * 0.9), 80, { col: SK.graph, key: 'q' });

  // ---- per-beat captions (each holds its window; one highlighted word each)
  if (TT < cu.half) pageCaption(['a sheet of paper', 'wants to fly'], [[1, 'fly']]);
  else if (TT < cu.corners) pageCaption(['fold one: in half,', 'and open it back up'], [[0, 'half']]);
  else if (TT < cu.edges) pageCaption(['corners to', 'the middle line'], [[1, 'middle']]);
  else if (TT < cu.wings) pageCaption(['edges in again,', 'then wings down'], [[1, 'wings']]);
  else if (TT < cu.nose) pageCaption(['now the secret:', 'a tiny fold at the nose'], [[1, 'nose']]);
  else if (TT < cu.shallow) pageCaption(['weight forward,', 'ahead of the lift'], [[0, 'forward']]);
  else pageCaption(['wings up a little,', 'like a shallow V'], [[1, 'shallow']]);
  pageTag('fold it');
}

// =====================================================================
//  ERA 2 — THE FLIGHT: the launch (the cut), the glide, the landing
// =====================================================================
function sFlight() {
  const cu = TIMELINE.cues;
  sketchPage({ grid: 'dots' });
  gpencil([[110, 1470], [420, 1464], [700, 1472], [960, 1466]], { key: 'ground', w: 3, a: 0.7 });
  ant(560 + 110 * TT, 1469, 1.4, 'ant2');
  [[110, 560, 0], [168, 760, 1], [96, 930, 2]].forEach(([x, y, i]) => doodleStar(x, y, 22 + 7 * ((B + i) % 3 === 0), 'mstar2' + i, { w: 3.2 }));
  marginPlane('mp2');

  // the flight path: launch from the hero's hand, up and across, a loop, glide to land
  const flightT = (u) => {
    // a hand-tuned path: rise, cruise, a small loop, descend to the landing
    if (u < 0.35) { const k = u / 0.35; return [lerp(300, 620, k), lerp(1230, 640, EZ.o2(k)) - Math.sin(k * Math.PI) * 60, -0.35 - 0.5 * k]; }
    if (u < 0.62) { const k = (u - 0.35) / 0.27; return [lerp(620, 810, k), 640 + Math.sin(k * Math.PI * 1.2) * 40, -0.85]; }
    if (u < 0.82) { const k = (u - 0.62) / 0.2; const a = k * TAU - 0.4; return [700 + Math.cos(a) * 110, 760 + Math.sin(a) * 90, a + Math.PI / 2]; }   // the loop
    const k = (u - 0.82) / 0.18;
    return [lerp(810, 640, k), lerp(850, 1230, k * k), 0.15 + 0.25 * k];
  };
  const fu = clamp(seg(TT, K1, cu.land), 0, 1);
  // the trail: dashed graphite behind the plane, written on as it flies
  const trail = [];
  for (let i = 0; i <= 46; i++) { const t = Math.min(fu, 1) * i / 46; const [x, y] = flightT(t); trail.push([x, y]); }
  ctx.save(); ctx.setLineDash([10, 13]);
  gpencil(trail, { key: 'ftrail', w: 2.6, a: 0.65, passes: 1, amp: 1.2 });
  ctx.restore();
  // the plane itself (the kit's paperPlane, side view)
  const [px, py, pa] = flightT(fu);
  if (fu < 1) paperPlane(px, py, pa, 2.1, 'plane');
  else {
    // landed: the plane rests on the ground, slightly crumpled, dust puffs, the check
    paperPlane(640, 1218, 0.06, 2.1, 'planeL');
    if (TT >= cu.land) for (let i = 0; i < 3; i++) gline([[640 - 60 - i * 40, 1240], [640 - 76 - i * 44, 1256]], { w: 3, key: 'dust' + i, second: false, a: 0.7 });
    if (TT >= cu.land + 0.2) checkMark(760, 1160, 1.3, clamp(seg(TT, cu.land + 0.2, cu.land + 0.5)));
  }

  // the hero: threw it (the arm swing at the cut), then follows the flight with its eyes
  const threw = seg(TT, K1 - 0.001, K1 + 0.3);
  const armSwing = threw > 0 ? lerp(2.4, -0.4, EZ.o2(clamp(threw))) : 0.4;
  const [lx, ly] = [px, py];
  doodleHero(230, 1380, 96, {
    key: 'hero', legs: true, mood: fu < 1 ? 'wow' : 'happy',
    look: [clamp((lx - 230) / 500, -1, 1), clamp((ly - 1380) / 500, -1, 0.2)], step: 0,
    arms: [-0.5, armSwing],
    sy: 1 + 0.05 * Math.sin(seg(TT, K1, K1 + 0.4) * Math.PI), sx: 1 - 0.04 * Math.sin(seg(TT, K1, K1 + 0.4) * Math.PI),
  });
  if (TT < K1 + 0.6) handLetter('!', 320, 1230 - 30 * Math.sin(seg(TT, K1, K1 + 0.4) * Math.PI), 96, { face: 'marker', col: SK.ink, key: 'bang', reveal: clamp(seg(TT, K1, K1 + 0.12)) });

  // the launch burst: a few speed lines at the hand
  if (TT < K1 + 0.5) for (let i = 0; i < 3; i++) gline([[330 + i * 26, 1160 + i * 22], [392 + i * 30, 1130 + i * 26]], { w: 3.4, key: 'spd' + i, second: false, a: 1 - clamp(seg(TT, K1 + 0.15, K1 + 0.5)) });

  // the ending: "go make one" hand-lettered big, underlined in red (once)
  const gm = ev(cu.make, 0.5);
  if (gm > 0) {
    const [x0, x1] = handLetter('go make one', CX, 560, 96, { face: 'marker', col: SK.ink, key: 'go', reveal: gm });
    underline(x0, x1, 596, { part: clamp((gm - 0.7) * 3) });
  }
  // per-beat captions
  if (TT < cu.glide) pageCaption(['throw it gently,', 'almost level'], [[0, 'gently']], { at: 0.05 });
  else pageCaption(['it should glide.', 'go make one'], [[1, 'glide']], { at: cu.glide - E0 });
  pageTag('fly it');
}
