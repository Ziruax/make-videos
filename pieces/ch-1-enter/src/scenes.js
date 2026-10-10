
// =====================================================================
//  SCENES — ch-1-enter. World coords 1080x1920, time TT on 2s.
//  F5: the dot (the command) holds ~(540, 880) through every station;
//  day = warm paper userland, night = navy inside the machine.
//  The red dashed plan (the pipeline) draws first; the journey follows it.
// =====================================================================
const HX = 540, HY = 880;    // the hero's home through the whole ride
const dot2 = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };

// a terminal window drawn as an inked card (the day-world object)
function termCard(x, y, w, h, key, o = {}) {
  paint(rrectPts(x, y, w, h, 16), { fill: C.paper, key: key + 'b', w: 3.5, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.55, per: 90 }] });
  ink([[x + 14, y + 58], [x + w - 14, y + 58]], { w: 2.6, key: key + 'bar' });
  inkText3('$', x + 26, y + 112, key);
}
// small inked monospace line helper (dark, on paper)
function inkText3(s, x, y, key) { monoText(s, x, y, 44, C.ink, { key: key + 't' }); }

// a keycap that presses (used for l and s and Enter)
function keycap(x, y, s, label, key, press) {
  const dy = 8 * press;
  paint(rrectPts(x, y + dy, 120 * s, 110 * s, 12), { fill: press > 0.5 ? C.cream : '#faf3e2', key: key + 'b', w: 3.4, tex: [{ k: 'hatch', a: 0.7, gap: 6, al: 0.16, dens: (px, py) => clamp((px - x + py - y) / (200 * s)) }] });
  monoText(label, x + 60 * s, y + dy + 70 * s, 44 * s, C.ink, { key: key + 'l' });
}
// the laptop: base + screen (a small dark island on the paper world)
function laptop(x, y, s, key, screenLines, typeFrac, o = {}) {
  paint(rrectPts(x - 420 * s, y - 300 * s, 840 * s, 560 * s, 14), { fill: C.paper, key: key + 'fr', w: 4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 110 }] });
  paint(rrectPts(x - 390 * s, y - 270 * s, 780 * s, 440 * s, 8), { fill: C.navy2, key: key + 'sc', w: 3, line: C.ink, tex: [{ k: 'cross', c: C.navy, al: 0.5, gap: 8 }] });
  monoText('$', x - 350 * s, y - 190 * s, 46 * s, C.cyan, { key: key + 'p' });
  screenLines.forEach((sl, i) => monoText(sl, x - 290 * s, y - 190 * s + i * 74 * s, 42 * s, i % 2 ? '#9fe8dc' : C.cream, { key: key + 'l' + i, count: Math.floor(clamp((typeFrac - i * 0.18) / 0.5) * sl.length) }));
  paint(rrectPts(x - 460 * s, y + 260 * s, 920 * s, 60 * s, 10), { fill: C.wood, key: key + 'bs', w: 3.4, tex: [{ k: 'pencil', c: C.woodL, al: 0.3, per: 70, a: 0.02 }] });
  if (o.cursor !== false && ((B % 6) < 3)) ink([[x - 290 * s + monoW(42 * s) * (screenLines[0].length + 1), y - 190 * s - 34], [x - 290 * s + monoW(42 * s) * (screenLines[0].length + 1), y - 190 * s + 14]], { w: 8, color: C.cyan, key: key + 'cur' });
}

// =====================================================================
//  STATION 1 — the desk: you type two letters and press Enter
// =====================================================================
function sDesk() {
  const cu = TIMELINE.cues;
  woodSurface(-40, -40, W + 40, H + 40, 'desk1', {});
  // the red plan: the whole journey, dashed, drawn as the line is spoken
  planInk([[150, 260], [930, 260]], { key: 'planTop', frac: ev(cu.plan - 0.6, 0.6) });
  planInk([[540, 260], [540, 700]], { key: 'planDn', frac: ev(cu.plan - 0.3, 0.5) });
  // the laptop with the line being typed
  const typed = clamp((TT - cu.keyL) / 0.5) + clamp((TT - cu.keyS) / 0.5);
  laptop(540, 760, 1.0, 'lp1', ['ls'], clamp((TT - cu.keyL) / 0.6), { cursor: TT < cu.enter });
  // the two keycaps pressing on their words (l, s), Enter big at the right
  keycap(240, 1300, 1.0, 'l', 'kl', seg(TT, cu.keyL, cu.keyL + 0.12));
  keycap(420, 1300, 1.0, 's', 'ks', seg(TT, cu.keyS, cu.keyS + 0.12));
  keycap(660, 1290, 1.15, 'enter', 'ke', seg(TT, cu.enter, cu.enter + 0.14));
  ink([[660, 1272], [660 + 138, 1272]], { w: 3, color: 'rgba(212,56,44,0.9)', amt: 1.5, key: 'entar', frac: ev(cu.enter, 0.3) });   // the arrow on the enter cap
  // the dot launches from the screen on Enter
  const lk = popS(cu.launch);
  if (lk > 0) dotHero(HX, lerp(700, HY, lk), 110 * (0.7 + 0.3 * lk), { key: 'hero', mood: TT < cu.enter ? 'focus' : 'wow' });
  else dotHero(HX, 700, 78, { key: 'hero', mood: 'focus' });
  // background life: the mug + steam, crumbs, a sticky note
  inkMug(180, 560, 100, 'mug1');
  for (let i = 0; i < 8; i++) { const R = RNG('crumb1', i); ctx.fillStyle = C.woodD; ctx.beginPath(); ctx.arc(R.r(80, 980), R.r(1520, 1780), R.r(3, 6), 0, TAU); ctx.fill(); }
  ctx.save(); ctx.translate(720, 1080); ctx.rotate(0.07);
  paint(box(0, 0, 220, 190), { fill: C.yellowL, key: 'sticky1', w: 2.6, tex: [{ k: 'pencil', c: C.yellow, al: 0.5, per: 70 }] });
  handText('just ls', 26, 100, 46, C.ink, { key: 'stk1' });
  ctx.restore();
  inkTag('userland');
  inkCaption('you press Enter');
}

// =====================================================================
//  STATION 2 — the parse: the line splits into words
// =====================================================================
function sParse() {
  const cu = TIMELINE.cues;
  paperSheet('sheet2');
  // the typed line, big, in an inked strip
  paint(rrectPts(140, 420, 800, 150, 10), { fill: C.cream, key: 'lineB', w: 3.4, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 80 }] });
  monoText('$ ls', 190, 520, 64, C.ink, { key: 'lineT' });
  // the strip splits: a scissor line, then the word pops out below as a box
  const sp = ev(cu.split, 0.5);
  if (sp > 0) {
    ink([[540 - 260 * sp, 570], [540 + 260 * sp, 420]], { w: 3, color: 'rgba(212,56,44,0.85)', amt: 2, key: 'splitL', dash: [12, 9] });
  }
  // argv box(es): '$' stays with the shell; 'ls' becomes the command
  const wk = popS(cu.words);
  if (wk > 0) {
    ctx.save(); ctx.translate(540, 980); ctx.scale(0.7 + 0.3 * wk, 0.7 + 0.3 * wk);
    paint(rrectPts(-180, -80, 360, 160, 12), { fill: C.paper, key: 'argvB', w: 4, tex: [{ k: 'hatch', a: 0.6, gap: 7, al: 0.2, dens: (px, py) => clamp((px + py - 200) / 500) }] });
    monoText('ls', -60, 40, 72, C.ink, { key: 'argvT' });
    handText('the command', -180, 150, 34, 'rgba(58,36,23,0.75)', { key: 'argvLbl' });
    ctx.restore();
  }
  // the shell keeps the prompt (top, small)
  monoText('$', 190, 660, 60, 'rgba(58,36,23,0.55)', { key: 'promptT' });
  handText('the shell keeps the prompt', 250, 706, 38, 'rgba(58,36,23,0.88)', { key: 'promptL' });
  // the dot drops into the box
  dotHero(HX, lerp(700, HY, popS(cu.words + 0.05)), 110, { key: 'hero', mood: 'happy' });
  // background life: a pencil, construct marks
  drawPencil(880, 360, -0.7, 300, 1, 'pen2');
  construct(150, 1500, 120, { key: 'con2' });
  inkTag('parse');
  inkCaption('the line becomes a command');
}

// =====================================================================
//  STATION 3 — fork: the shell makes a copy of itself
// =====================================================================
function sFork() {
  const cu = TIMELINE.cues;
  paperSheet('sheet3');
  // one shell box that splits into two (a cell dividing) — both boxes stay inside the safe area
  const fk = ev(cu.twin, 0.7);
  const gap = 30 + 210 * fk;
  // parent shell (left, keeps the prompt) and the copy (right, carries the dot)
  [[540 - gap, 'sh', false], [540 + gap, 'sh', true]].forEach(([cx, label, isChild], i) => {
    const k = popS(i === 0 ? K2 + 0.1 : cu.twin);
    if (k <= 0) return;
    ctx.save(); ctx.translate(cx, 880); ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
    const dash = isChild && fk < 1 ? [10, 8] : undefined;
    if (dash) ctx.setLineDash(dash);
    paint(rrectPts(-160, -130, 320, 260, 14), { fill: isChild ? C.cream : C.paper, key: 'sh' + i, w: 4, tex: [{ k: 'hatch', a: 0.6, gap: 8, al: 0.18, dens: (px, py) => clamp((px + py) / 700) }] });
    ctx.setLineDash([]);
    monoText(label, -40, 20, 60, C.ink, { key: 'shT' + i });
    handText(i ? 'the copy' : 'the shell', -160, 190, 34, 'rgba(58,36,23,0.7)', { key: 'shL' + i });
    ctx.restore();
  });
  // the twin dot pops beside the hero (the parent's pale twin), then the hero hops to the copy
  const tk = popS(cu.twin + 0.1);
  if (tk > 0) dotHero(HX - gap, 1450, 78, { key: 'twin', mood: 'smile' });
  const hop = EZ.back(seg(TT, cu.fork, cu.fork + 0.4));
  dotHero(lerp(HX, HX + gap, hop), HY, 110, { key: 'hero', mood: 'wow' });
  // the split line above (red, the plan doing it for real now)
  planInk([[HX, 620], [HX, 760]], { key: 'forkP', frac: ev(cu.twin, 0.4) });
  planInk([[HX - 160, 620], [HX + 160, 620]], { key: 'forkP2', frac: ev(cu.fork, 0.5) });
  // background life: crumbs, a coffee ring
  ctx.strokeStyle = 'rgba(110,65,40,0.3)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(190, 1600, 70, 0, TAU); ctx.stroke();
  construct(900, 360, 100, { key: 'con3' });
  inkTag('fork');
  inkCaption('a copy of itself');
}

// =====================================================================
//  STATION 4 — exec: the copy swaps out for the real program
// =====================================================================
function sExec() {
  const cu = TIMELINE.cues;
  paperSheet('sheet4');
  // the program's file on disk, right: an inked folder whose code streams left
  const xk = popS(K3 + 0.15);
  ctx.save(); ctx.translate(860, 880); ctx.scale(xk, xk);
  paint(box(-110, -80, 220, 200), { fill: C.yellowL, key: 'foldB', w: 3.6, tex: [{ k: 'pencil', c: C.yellow, al: 0.45, per: 70 }] });
  paint([[-110, -80], [-60, -130], [110, -130], [110, -80]], { fill: C.yellowL, key: 'foldT', w: 3.6, tex: [{ k: 'hatch', a: 0.5, gap: 6, al: 0.2 }] });
  monoText('ls', -30, 50, 56, C.ink, { key: 'foldT2' });
  handText('on disk', -110, 170, 34, 'rgba(58,36,23,0.7)', { key: 'foldL' });
  ctx.restore();
  // the child's box (dashed in fork, now solidifying): the label flips sh -> ls
  const solid = ev(cu.exec, 0.4);
  if (solid < 1) ctx.setLineDash([10, 8]);
  paint(rrectPts(250, 750, 420, 280, 14), { fill: C.cream, key: 'childB', w: 4, tex: [{ k: 'hatch', a: 0.6, gap: 8, al: 0.15 + 0.1 * solid, dens: (px, py) => clamp((px + py - 300) / 700) }] });
  ctx.setLineDash([]);
  monoText(solid > 0.5 ? 'ls' : 'sh', 400, 900, 72, C.ink, { key: 'childT' });
  // the code streams in: inked lines flowing from the folder into the box
  const ck = ev(cu.code, 0.9);
  if (ck > 0) {
    for (let i = 0; i < 6; i++) {
      const f = clamp(ck * 2.2 - i * 0.18);
      if (f <= 0) continue;
      const y = 800 + i * 38;
      ink([[lerp(760, 680, f), y + i * 6], [lerp(760, 680, f) - 260 * f, y + i * 6]], { w: 2.6, color: 'rgba(58,36,23,0.7)', amt: 1.2, key: 'code' + i });
    }
  }
  dotHero(HX, lerp(HY, 1240, 0.2), 110, { key: 'hero', mood: TT < cu.exec ? 'focus' : 'happy' });
  // the old copy ghost: a hollow outline with dashes, drifting up-left (skipped, not faded)
  if (ev(cu.exec, 0.3) > 0) {
    ctx.save(); ctx.setLineDash([7, 7]);
    ink(ellipsePts(220, 520, 60, 60, 0, 20), { closed: true, w: 3, color: 'rgba(58,36,23,0.45)', key: 'ghost' });
    ctx.restore();
    handText('swapped out', 130, 430, 32, 'rgba(58,36,23,0.6)', { key: 'ghostL' });
  }
  inkTag('exec');
  inkCaption('the real ls loads in');
}

// =====================================================================
//  STATION 5 — inside the machine: it asks the kernel (navy world)
// =====================================================================
function sKernel() {
  const cu = TIMELINE.cues;
  darkWorld('kernelW');
  hexGrid({ x0: -40, y0: 1420, x1: W + 40, y1: H + 40 }, 64, { key: 'hexK' });
  // stars + pipes (background life)
  for (let i = 0; i < 20; i++) { const R = RNG('stK', i); star4(R.r(40, 1040), R.r(260, 700), R.r(4, 9) * (0.7 + 0.3 * ((B + i) % 2)), C.white); }
  ink([[0, 380], [330, 380], [330, 240]], { w: 3, color: C.navy3, key: 'pipe1' });
  ink([[1080, 340], [760, 340], [760, 240]], { w: 3, color: C.navy3, key: 'pipe2' });
  // the kernel: a big gate/tower with the label, periwinkle ink
  const kk = popS(B1 + 0.25);
  ctx.save(); ctx.translate(540, 560); ctx.scale(0.85 + 0.15 * kk, 0.85 + 0.15 * kk);
  paint(box(-300, -120, 600, 340), { fill: C.navy2, key: 'kernB', line: C.peri, w: 4.5, tex: [{ k: 'cross', c: C.navy, al: 0.55, gap: 9 }] });
  // crenellations (a fortress)
  for (let i = 0; i < 6; i++) paint(box(-300 + i * 100, -190, 72, 74), { fill: C.navy2, key: 'cren' + i, line: C.peri, w: 3.6, tex: [{ k: 'cross', c: C.navy, al: 0.5, gap: 10 }] });
  monoText('kernel', -150, 60, 76, C.cyan, { key: 'kernT' });
  handText('the boss of the machine', -300, 280, 36, C.peri, { key: 'kernL' });
  ctx.restore();
  // the request card, handed up by the dot
  const rk = popS(cu.ask + 0.1);
  if (rk > 0) {
    ctx.save(); ctx.translate(540, 1000); ctx.scale(0.8 + 0.2 * rk, 0.8 + 0.2 * rk); ctx.rotate(-0.02);
    paint(rrectPts(-260, -70, 520, 150, 10), { fill: C.navy2, key: 'reqB', line: C.peri, w: 3.4, tex: [{ k: 'cross', c: C.navy, al: 0.4, gap: 9 }] });
    handText("what's in this folder?", -235, 34, 48, C.white, { key: 'reqT' });
    ctx.restore();
  }
  // the hero, glowing, below the gate
  dotHero(HX, HY + 160, 110, { key: 'hero', dark: true, mood: 'wow' });
  inkTag('inside the machine');
  inkCaption('ask the kernel');
}

// =====================================================================
//  STATION 6 — the kernel asks the disk (deeper navy)
// =====================================================================
function sDisk() {
  const cu = TIMELINE.cues;
  darkWorld('diskW', { fill: C.navyD });
  // the platter: a huge disc, hatched, with the spinning track
  const cx = 540, cy = 820, R = 380;
  paint(ellipsePts(cx, cy + 40, R, R * 0.28, 0, 64), { fill: C.navy3, key: 'platSh', line: false, tex: [{ k: 'cross', c: C.navy, al: 0.5, gap: 10 }] });
  paint(ellipsePts(cx, cy, R, R * 0.28, 0, 64), { fill: C.navy2, key: 'platB', line: C.peri, w: 4, tex: [{ k: 'cross', c: C.navy, al: 0.6, gap: 8 }, { k: 'stipple', c: C.periD, al: 0.3, per: 3000 }] });
  // the tracks: concentric dashed ellipses, rotating on 2s
  for (let i = 1; i <= 4; i++) {
    const rr = R * (0.35 + i * 0.16);
    ctx.save(); ctx.setLineDash([18, 22]); ctx.lineDashOffset = -B * 14;
    ink(ellipsePts(cx, cy, rr, rr * 0.28, 0, 56), { closed: true, w: 2.4, color: C.periD, key: 'trk' + i });
    ctx.restore();
  }
  // the arm + head: sweeps across the platter to the read position
  const ak = ev(cu.head, 0.7);
  const armA = -0.5 + 0.75 * ak;
  ink([[180, 320], [180 + 520 * Math.cos(armA), 320 + 520 * Math.sin(armA)]], { w: 16, color: C.peri, key: 'arm' });
  ink([[180, 320], [180 + 520 * Math.cos(armA + 0.06), 320 + 520 * Math.sin(armA + 0.06)]], { w: 6, color: C.cyan, key: 'arm2' });
  ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(180 + 520 * Math.cos(armA), 320 + 520 * Math.sin(armA), 14, 0, TAU); ctx.fill();
  // bytes surfacing on the track near the head (the answer being read)
  const bk = ev(cu.disk, 0.6);
  if (bk > 0) for (let i = 0; i < 8; i++) {
    const ba = -0.4 + i * 0.28, br = R * 0.62;
    star4(cx + Math.cos(ba) * br, cy + Math.sin(ba) * br * 0.28, 9 * (0.6 + 0.4 * ((B + i) % 2)), C.cyan);
  }
  handText('the disk', 660, 1290, 44, C.peri, { key: 'diskL' });
  dotHero(HX, 1350, 110, { key: 'hero', dark: true, mood: 'focus' });
  inkTag('deeper');
  inkCaption('the kernel asks the disk');
}

// =====================================================================
//  STATION 7 — the return: bytes rush home (the anchor: the dot holds)
// =====================================================================
function sReturn() {
  const cu = TIMELINE.cues;
  darkWorld('retW');
  hexGrid({ x0: -40, y0: 1500, x1: W + 40, y1: H + 40 }, 64, { key: 'hexR' });
  // the pipe: a dashed periwinkle conduit from bottom to the dot
  planInk([[540, 1650], [540, 1150]], { key: 'pipeR', frac: ev(cu.back, 0.4), c: 'rgba(200,208,240,0.85)', dash: [14, 10] });
  // the bytes rise in 16th steps — the rush (stepped on 2s like everything)
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t0b = cu.back + i * E16;
    const u = clamp(seg(TT, t0b, t0b + 0.3));
    if (u <= 0) continue;
    const bx = 540 + Math.sin(i * 2.4) * 150, by = lerp(1650, 1060, u * u * (3 - 2 * u));
    const cc = i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.magenta : C.peri;
    paint(box(bx - 22, by - 22, 44, 44), { fill: C.navy2, key: 'byt' + i, line: cc, w: 2.6, tex: [{ k: 'cross', c: C.navy, al: 0.4, gap: 9 }] });
  }
  // the gathered names stack above the dot as they arrive (the last few land into a list)
  const gk = clamp((TT - (cu.back + 14 * E16)) / 0.5);
  if (gk > 0) {
    const names = ['notes.txt', 'hero.png', 'todo.md'];
    names.forEach((nm, i) => {
      const f = clamp(gk * 3 - i * 0.8);
      if (f <= 0) return;
      monoText(nm, 640, 560 + i * 64, 40, C.cream, { key: 'nm' + i, count: Math.floor(f * nm.length) });
    });
  }
  // THE ANCHOR: the dot holds (540, 880) exactly through the rush
  dotHero(HX, HY, 110, { key: 'hero', dark: true, mood: 'wow' });
  inkTag('the return');
  inkCaption('bytes rush home');
}

// =====================================================================
//  STATION 8 — the write: the answer lands on your screen (day again)
// =====================================================================
function sWrite() {
  const cu = TIMELINE.cues;
  woodSurface(-40, -40, W + 40, H + 40, 'desk8', {});
  // the laptop again — now filling with the answer, line by line, fast
  const lines = ['notes.txt  hero.png', 'todo.md  plan.md', '10 files'];
  laptop(540, 760, 1.0, 'lp8', ['ls', ...lines], clamp((TT - (B2 + 0.3)) / 1.4), { cursor: false });
  // the dot rides above the screen, watching its work land
  dotHero(HX, 300, 100, { key: 'hero', mood: 'happy' });
  // the mug moved closer; the day is back
  inkMug(880, 560, 96, 'mug8');
  for (let i = 0; i < 8; i++) { const R = RNG('crumb8', i); ctx.fillStyle = C.woodD; ctx.beginPath(); ctx.arc(R.r(80, 980), R.r(1520, 1780), R.r(3, 6), 0, TAU); ctx.fill(); }
  inkTag('userland');
  inkCaption('the answer writes itself');
}

// =====================================================================
//  STATION 9 — the payoff: all of that in a few milliseconds
// =====================================================================
function sPayoff() {
  const cu = TIMELINE.cues;
  paperSheet('sheet9');
  // the stopwatch: big, inked; the hand swept a sliver
  const cx = 540, cy = 880, R = 330;
  paint(ellipsePts(cx + 20, cy + 26, R, R, 0, 64), { fill: 'rgba(58,36,23,0.22)', line: false, key: 'watchSh', tex: [{ k: 'hatch', a: 0.8, gap: 5, al: 0.5 }] });
  paint(ellipsePts(cx, cy, R, R, 0, 64), { fill: C.paper, key: 'watchB', w: 5, tex: [{ k: 'pencil', c: '#e8d6b0', al: 0.5, per: 120 }, { k: 'hatch', a: 0.7, gap: 6, al: 0.16, dens: (px, py) => clamp((px + py - 900) / 900) }] });
  // ticks
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[cx + Math.cos(a) * (R - 44), cy + Math.sin(a) * (R - 44)], [cx + Math.cos(a) * (R - 16), cy + Math.sin(a) * (R - 16)]], { w: 4, key: 'tick' + i }); }
  // the button + crown
  paint(box(cx - 26, cy - R - 60, 52, 50), { fill: C.cream, key: 'wbtn', w: 3.4, tex: [{ k: 'hatch', a: 0.6, gap: 6, al: 0.2 }] });
  // the hand: swept only a sliver (a few milliseconds!) — pops on the hit
  const hk = popS(cu.hit);
  const handA = -Math.PI / 2 + 0.38 * EZ.io(clamp(seg(TT, cu.hit, cu.hit + 0.3)));
  ink([[cx, cy], [cx + Math.cos(handA) * (R - 90), cy + Math.sin(handA) * (R - 90)]], { w: 7, color: C.red, key: 'wHand', frac: hk });
  dot2(cx, cy, 14, C.ink);
  // the readout: "0.003 s" writes on after the hand lands
  const rk = ev(cu.watch, 0.6);
  inkCard('0.003 s', 540, 1330, 64, { s: popS(cu.watch - 0.1), frac: rk });
  // the dot leans on the stopwatch, wow
  dotHero(220, 620, 96, { key: 'hero', mood: 'wow' });
  construct(900, 1560, 110, { key: 'con9' });
  drawPencil(880, 330, -0.8, 280, 1, 'pen9');
  inkTag('the whole trip');
  inkCaption('all of it, in milliseconds');
}

// =====================================================================
//  STATION 10 — the cursor: the end is the start
// =====================================================================
function sCursor() {
  const cu = TIMELINE.cues;
  woodSurface(-40, -40, W + 40, H + 40, 'desk10', {});
  // the SAME framing as station 1: the laptop, the empty prompt, the blink
  laptop(540, 760, 1.0, 'lp10', [''], 1, { cursor: false });
  // the dot settles INTO the cursor line (right of the mug, clear of it) and blinks with it (the loop)
  const st = EZ.io(clamp(seg(TT, K7 + 0.2, K7 + 0.6)));
  const blinkOn = (B % 6) < 3;
  dotHero(lerp(HX, 340, st), lerp(300, 590, st), 110 * (1 - 0.35 * st), { key: 'hero', mood: 'smile' });
  if (st > 0.9 && !blinkOn) { /* the dot IS the cursor: dim its eyes? the blink reads from the dot itself */ }
  // the enter key again, waiting
  keycap(660, 1290, 1.15, 'enter', 'ke10', 0);
  ink([[660, 1272], [660 + 138, 1272]], { w: 3, color: 'rgba(212,56,44,0.9)', amt: 1.5, key: 'entar10' });
  // the mug, the sticky note (the world came back)
  inkMug(180, 560, 100, 'mug10');
  ctx.save(); ctx.translate(700, 1080); ctx.rotate(0.07);
  paint(box(0, 0, 220, 190), { fill: C.yellowL, key: 'sticky10', w: 2.6, tex: [{ k: 'pencil', c: C.yellow, al: 0.5, per: 70 }] });
  handText('again?', 30, 105, 48, C.ink, { key: 'stk10' });
  ctx.restore();
  inkTag('userland');
  inkCaption('press Enter again');
}
