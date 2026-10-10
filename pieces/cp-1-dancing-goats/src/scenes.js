
// =====================================================================
//  SCENES — cp-1-dancing-goats. World coords 1080x1920, motion on 2s.
//  Six full-bleed paper worlds; one dominant wall colour each so eras read
//  on a contact sheet. Orange = the spark ONLY. Cherry red = the fruit.
//  Bridge objects (>=200px, in frame at every boundary): the cherry, the
//  bean, the pot, the big cup, the bouquet. The spark gains a ray per era.
// =====================================================================
const CHERRY = '#c34536', CHERRYD = '#8e2f24', BEANC = '#5b3a29', CREASE = '#3d2817';

// ---- a red coffee cherry (the piece's looper): fruit + stem + leaf
function cherry(x, y, r, key, o = {}) {
  cut(ellipsePts(x, y, r, r * 0.96, 0, 30), o.fill ?? CHERRY, { key: key + 'f', crayon: CHERRYD, crAl: 0.35, crPer: 26, tear: 1.1 });
  cut(ellipsePts(x - r * 0.32, y - r * 0.42, r * 0.22, r * 0.16, -0.6, 12), '#f6d7c2', { key: key + 'sh', shadow: false, grain: 0.4 });   // the highlight
  if (o.stem !== false) ink([[x, y - r * 0.9], [x + r * 0.18, y - r * 1.5], [x + r * 0.5, y - r * 1.75]], { w: 7, color: PAL.greenD, amt: 0.3, key: key + 'st' });
  if (o.leaf !== false) cut(rot(ellipsePts(x + r * 0.75, y - r * 1.55, r * 0.42, r * 0.2, 0, 14), x + r * 0.75, y - r * 1.55, -0.5), PAL.green, { key: key + 'lf', sb: 5 });
}

// ---- a roasted bean (oval + the centre crease)
function bean(x, y, rx, ry, key, o = {}) {
  const rotA = o.rot ?? 0.35;
  cut(rot(ellipsePts(x, y, rx, ry, 0, 26), x, y, rotA), BEANC, { key: key + 'b', crayon: CREASE, crAl: 0.5, crPer: 20, tear: 0.8 });
  ink([[x - Math.cos(rotA) * rx * 0.8, y - Math.sin(rotA) * rx * 0.8], [x + Math.cos(rotA) * rx * 0.8, y + Math.sin(rotA) * rx * 0.8]], { w: 5, color: CREASE, amt: 0.25, key: key + 'c' });
}

// ---- a dancing paper goat: body, head with face, prancing legs; bounces on 2s
function goat(x, y, s, key, ph = 0) {
  const k = key, hop = Math.sin(TT * TAU * 1.4 + ph);
  const yb = y - Math.abs(hop) * 16 * s;
  const legA = Math.sin(TT * TAU * 1.4 + ph) * 0.5;
  // legs (two capsules, opposite swing)
  cut(capsulePts(x - 26 * s, yb + 18 * s, x - 26 * s - Math.sin(legA) * 26 * s, yb + 66 * s, 13 * s), PAL.cream, { key: k + 'l1', sb: 4, tear: 0.7 });
  cut(capsulePts(x + 26 * s, yb + 18 * s, x + 26 * s + Math.sin(legA) * 26 * s, yb + 66 * s, 13 * s), PAL.cream, { key: k + 'l2', sb: 4, tear: 0.7 });
  // body + tail
  cut(ellipsePts(x, yb, 66 * s, 40 * s, 0, 22), PAL.cream, { key: k + 'bd', crayon: '#d8c9a8', crAl: 0.3, crPer: 40 });
  cut(ellipsePts(x + 62 * s, yb - 18 * s, 12 * s, 20 * s, 0.4, 10), PAL.cream, { key: k + 'tl', sb: 4 });
  // head + horns + face (looks where it prances)
  const hx = x + 74 * s + Math.sin(TT * 2.2 + ph) * 5 * s, hy = yb - 44 * s;
  cut(ellipsePts(hx, hy, 30 * s, 24 * s, 0.15, 16), PAL.cream, { key: k + 'hd' });
  cut(capsulePts(hx - 12 * s, hy - 20 * s, hx - 20 * s, hy - 44 * s, 7 * s), PAL.charcoal, { key: k + 'h1', sb: 3 });
  cut(capsulePts(hx + 6 * s, hy - 20 * s, hx + 2 * s, hy - 46 * s, 7 * s), PAL.charcoal, { key: k + 'h2', sb: 3 });
  cut(ellipsePts(hx + 22 * s, hy + 2 * s, 6 * s, 8 * s, 0.5, 8), PAL.cream, { key: k + 'er' });
  dot(hx - 6 * s, hy - 4 * s, 3.4 * s); dot(hx + 10 * s, hy - 4 * s, 3.4 * s);
  ink(arcPts(hx + 2 * s, hy + 8 * s, 7 * s, 0.3, Math.PI - 0.3, 6), { w: 2.8 * s, color: PAL.ink, amt: 0.2, key: k + 'm' });
  // beard tuft
  cut(ellipsePts(hx + 20 * s, hy + 14 * s, 6 * s, 10 * s, 0.3, 8), PAL.cream, { key: k + 'bt', sb: 3 });
}

// ---- a paper sun with torn rays (background life; never the hero)
function sunDisc(x, y, r, key) {
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU + Math.sin(TT * 1.3 + i) * 0.02; cut(capsulePts(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25, r * 0.16), PAL.yellow, { key: key + 'r' + i, sb: 5, tear: 0.8, grain: 0.5 }); }
  cut(ellipsePts(x, y, r, r, 0, 26), PAL.mustard, { key: key + 'c', crayon: '#c28a2e', crAl: 0.35, crPer: 30 });
}

// ---- birds on a wire
function birdsOnWire(x0, x1, y, n, key) {
  ink([[x0 - 20, y], [x1 + 20, y - 12]], { w: 4, color: PAL.ink, amt: 0.4, key: key + 'w' });
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, i / (n - 1)), by = y - 8 - (i % 2) * 6;
    cut([[bx, by - 10], [bx + 14, by + 4], [bx + 20, by - 8], [bx + 30, by + 4]], PAL.charcoal, { key: key + 'b' + i, sb: 3, tear: 0.6 });
  }
}

// ---- a coffee bush: leaf mass + hanging cherries (the little ones)
function coffeeBush(x, y, s, key, cherries = true) {
  cut(rect(x - 14 * s, y + 10 * s, 28 * s, 70 * s, 8 * s), PAL.woodD, { key: key + 'tr', sb: 5 });
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.42, L = (90 + (i % 3) * 26) * s;
    cut(rot(ellipsePts(x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5, L * 0.5, 34 * s, 0, 14), x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5, a), i % 2 ? PAL.green : PAL.greenD, { key: key + 'l' + i, sb: 5 });
  }
  if (cherries) for (let i = 0; i < 3; i++) { const cx = x + (i - 1) * 46 * s, cy = y + 30 * s + (i % 2) * 26 * s; cut(ellipsePts(cx, cy, 15 * s, 15 * s, 0, 14), CHERRY, { key: key + 'ch' + i, sb: 4, crayon: CHERRYD, crAl: 0.3, crPer: 16, grain: 0.5 }); }
}

// ---- the big coffee pot / urn (copper): the brewing thread's body, >=200px
function coffeePot(x, y, s, key, o = {}) {
  const B = o.urn ? PAL.charcoal : PAL.mustard;
  // body (a soft trapezoid), lid, spout, handle
  cut([[x - 85 * s, y], [x + 85 * s, y], [x + 70 * s, y + 200 * s], [x - 70 * s, y + 200 * s]], B, { key: key + 'bd', pat: pat.dots('rgba(255,255,255,0.16)', 5, 34), crayon: o.urn ? '#3a3a44' : '#c28a2e', crAl: 0.3, crPer: 40 });
  cut(ellipsePts(x, y, 92 * s, 20 * s, 0, 20), B, { key: key + 'rm', sb: 4 });
  cut(ellipsePts(x, y - 16 * s, 46 * s, 26 * s, 0, 16), B, { key: key + 'ld', sb: 5 });
  dot(x, y - 34 * s, 12 * s, o.urn ? '#3a3a44' : '#c28a2e');
  ink([[x + 88 * s, y + 26 * s], [x + 132 * s, y - 6 * s], [x + 128 * s, y + 26 * s]], { w: 12 * s, color: B, amt: 0.3, key: key + 'sp' });
  cut(capsulePts(x - 84 * s, y + 60 * s, x - 130 * s, y + 110 * s, 16 * s), B, { key: key + 'hl', sb: 4 });
  if (o.steam !== false) for (let i = 0; i < 3; i++) { const P = []; for (let k = 0; k <= 8; k++) P.push([x - 30 * s + i * 30 * s + Math.sin(k * 0.9 + i + TT * 3.4) * 11 * s, y - 40 * s - k * 16 * s]); ink(P, { w: 6 * s, color: 'rgba(255,255,255,0.7)', amt: 0.7, key: key + 'st' + i }); }
}

// ---- a big paper cup (the modern cup; the T5/T6 bridge object)
function bigCup(x, y, s, key) {
  cut([[x - 95 * s, y], [x + 95 * s, y], [x + 74 * s, y + 150 * s], [x - 74 * s, y + 150 * s]], PAL.paper, { key: key + 'bd', pat: pat.stripes('rgba(190,120,80,0.20)', 16, 60, 0.1), crayon: '#d8c9a8', crAl: 0.25, crPer: 40 });
  cut(ellipsePts(x, y, 97 * s, 26 * s, 0, 20), PAL.cream, { key: key + 'rp', sb: 4 });
  cut(ellipsePts(x, y - 6 * s, 74 * s, 16 * s, 0, 16), '#6b4a33', { key: key + 'cf', shadow: false, grain: 0.6 });   // the coffee
  cut(capsulePts(x + 96 * s, y + 50 * s, x + 118 * s, y + 96 * s, 30 * s), PAL.paper, { key: key + 'hd', sb: 5 });
  for (let i = 0; i < 3; i++) { const P = []; for (let k = 0; k <= 9; k++) P.push([x - 34 * s + i * 34 * s + Math.sin(k * 0.9 + i + TT * 3.2) * 13 * s, y - 30 * s - k * 22 * s]); ink(P, { w: 7 * s, color: 'rgba(255,255,255,0.75)', amt: 0.75, key: key + 'st' + i }); }
}

// ---- the bouquet (the smuggled seedling's ride): paper flowers in a cone
function bouquet(x, y, s, key, o = {}) {
  // the wrap cone
  cut([[x - 70 * s, y + 190 * s], [x + 70 * s, y + 190 * s], [x + 30 * s, y + 30 * s], [x - 30 * s, y + 30 * s]], PAL.cream, { key: key + 'cn', pat: pat.stripes('rgba(120,90,60,0.14)', 12, 46, 0.2) });
  // flowers: pink/cream/white heads on stems
  const heads = [[-46, -30, PAL.pink], [-12, -70, PAL.paper], [26, -40, PAL.pinkL], [52, 6, PAL.paper], [0, -6, PAL.pink]];
  heads.forEach(([dx, dy, c], i) => {
    const fx = x + dx * s, fy = y + dy * s + Math.sin(TT * 2 + i) * 3 * s;
    ink([[x + dx * 0.3 * s, y + 40 * s], [fx, fy + 26 * s]], { w: 6 * s, color: PAL.greenD, amt: 0.3, key: key + 'sm' + i });
    for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; cut(ellipsePts(fx + Math.cos(a) * 22 * s, fy + Math.sin(a) * 22 * s, 18 * s, 12 * s, a, 12), c, { key: key + 'pt' + i + p, sb: 4 }); }
    cut(ellipsePts(fx, fy, 12 * s, 12 * s, 0, 12), PAL.yellow, { key: key + 'ct' + i, shadow: false });
  });
}

// ---- the tiny sprout (the seedling): grows from a point, leaves pop
function sprout(x, y, h, key) {
  const P = []; for (let k = 0; k <= 10; k++) P.push([x + Math.sin(k * 0.6 + TT * 1.6) * 7, y - h * (k / 10) * (0.7 + 0.3 * k / 10)]);
  ink(P, { w: 8, color: PAL.greenD, amt: 0.3, key: key + 'st' });
  cut(rot(ellipsePts(x - 2, y - h, 30, 13, 0, 12), x - 2, y - h, -0.4), PAL.green, { key: key + 'l1', sb: 4 });
  cut(rot(ellipsePts(x + 2, y - h + 8, 26, 11, 0, 12), x + 2, y - h + 8, 0.5), PAL.green, { key: key + 'l2', sb: 4 });
}

// =====================================================================
//  ERA 1 / ERA 7 — the Ethiopian hillside (the legend; and the return)
// =====================================================================
function sHillsides(o = {}) {
  const cu = TIMELINE.cues, end = o.end;
  // sky wall + torn hills
  cut(rect(-30, -30, W + 60, H * 0.62, 0), PAL.sky, { key: 'skyw', shadow: false, tear: 0, pat: pat.dots('rgba(255,255,255,0.30)', 3, 90), shade: false });
  cut([[-40, 1020], [300, 940], [700, 1000], [1120, 930], [1120, 2000], [-40, 2000]], PAL.green, { key: 'hill1', shadow: false, tear: 1.6, pat: pat.stripes('rgba(255,255,255,0.14)', 6, 26, 0.3) });
  cut([[-40, 1180], [260, 1120], [820, 1160], [1120, 1100], [1120, 2000], [-40, 2000]], PAL.greenD, { key: 'hill2', shadow: false, tear: 1.6, pat: pat.stripes('rgba(30,60,30,0.20)', 5, 22, 0.3) });
  sunDisc(830, 420, 66, 'sun');
  birdsOnWire(90, 380, 330, 4, 'bw');
  // the coffee bush + the BIG cherry (the bridge object, r 105)
  coffeeBush(760, 1120, 1.0, 'bushR');
  cut([[-40, 1640], [500, 1570], [1000, 1660], [1120, 1600], [1120, 2000], [-40, 2000]], PAL.green, { key: 'ground', shadow: false, tear: 1.4, pat: pat.stripes('rgba(255,255,255,0.10)', 4, 20, 0.3) });
  // the hero bush, centre: tall, with the big cherry hanging at (540, 790)
  coffeeBush(560, 1150, 1.35, 'bushH', false);
  cherry(540, 790, 105, 'cherryH', { stem: false });
  ink([[540, 790 - 100], [560, 790 - 190], [610, 790 - 210]], { w: 10, color: PAL.woodD, amt: 0.3, key: 'bstem' });
  // the spark: asleep in the cherry (end), or wakes and rises above it (open)
  if (end) {
    spark(540, 800, 80, { rays: 10, mood: 'happy', key: 'heroE', s: 0.85 + 0.15 * Math.sin(TT * 2.4) * 0.2 });
    // the goat's cup: the world came back with the coffee in it
    if (popS(cu.sip) > 0) { ctx.save(); ctx.translate(660, 1330); ctx.scale(0.75 * popS(cu.sip), 0.75 * popS(cu.sip)); bigCup(0, 0, 0.5, 'goatcup'); ctx.restore(); }
    goat(760, 1290, 0.95, 'goatE', 2.1);
    goat(620, 1380, 0.8, 'goatE2', 4.0);
    // the title tag writes itself
    tag('the bean that woke the world', 540, 520, 44, { rot: -0.02, s: popS(cu.title), frac: ev(cu.title + 0.25, 1.1) });
  } else {
    const wk = cu.wake;
    spark(540, 790 - 170 * popS(wk), 92, { rays: 5, mood: TT < wk + 0.6 ? 'wow' : 'happy', key: 'hero', s: 0.55 + 0.45 * popS(wk) });
    goat(760, 1290, 0.95, 'goat1', 2.1);
    goat(620, 1380, 0.8, 'goat2', 4.0);
    goat(860, 1330, 0.85, 'goat3', 0.6);
  }
  // Kaldi the herder, watching his flock bounce
  person(230, 1320, 0.9, { shirt: PAL.tweed, mood: end ? 'smile' : 'wow', beard: true, key: 'kaldi' });
  plant(110, 1480, 0.9, PAL.mustard, 'pl1');
  yearTag(end ? 'the hillside' : 'Ethiopia · legend');
  capStrip(end ? 'not bad for a goat snack' : 'the goats danced first');
}

// =====================================================================
//  ERA 2 — Yemen, 1400s: the monastery night (mustard walls, wood, fire)
// =====================================================================
function sMonastery() {
  const cu = TIMELINE.cues;
  // ochre walls + wainscot
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.mustard, { key: 'wallM', shadow: false, tear: 0, pat: pat.lines('rgba(120,80,20,0.10)', 90) });
  cut(rect(-30, 1240, W + 60, 800, 0), PAL.wood, { key: 'floorM', shadow: false, tear: 0, pat: pat.grainWood('rgba(120,60,20,0.20)'), sy: -5 });
  // the night window + stars + moon sliver
  cut(rect(690, 360, 260, 320, 8), PAL.woodD, { key: 'winM' });
  cut(rect(710, 380, 220, 280, 4), PAL.night, { key: 'glassM', shadow: false, pat: (bb) => { const R = RNG('starsM'); for (let i = 0; i < 16; i++) sparkle(R.r(bb.x0, bb.x1), R.r(bb.y0, bb.y1), R.r(3, 6) * (0.6 + 0.4 * ((B + i) % 2))); } });
  cut(ellipsePts(880, 460, 30, 30, 0, 20), '#f6ecc8', { key: 'moonM' });
  // hanging prayer beads on the wall, left
  ink([[170, 330], [170, 640]], { w: 3, color: PAL.woodD, amt: 0.3, key: 'beadS' });
  for (let i = 0; i < 9; i++) cut(ellipsePts(170, 350 + i * 34, 12, 12, 0, 10), PAL.woodD, { key: 'bead' + i, sb: 3, grain: 0.5 });
  // the shelf with jars
  cut(rect(60, 520, 200, 18, 4), PAL.woodD, { key: 'shelfM' });
  cut(rect(90, 420, 60, 100, 8), PAL.teal, { key: 'jar1', pat: pat.dots('rgba(255,255,255,0.2)', 4, 20) });
  cut(rect(170, 440, 54, 80, 8), PAL.paper, { key: 'jar2' });
  // the fire + the POT on it (the T2 bridge object, at (560, 850))
  for (let i = 0; i < 4; i++) { const fa = -Math.PI / 2 + (i - 1.5) * 0.5, fl = 30 + 22 * Math.abs(Math.sin(TT * 7 + i)); cut(capsulePts(560 + Math.cos(fa) * 30, 1120 + Math.sin(fa) * 10, 560 + Math.cos(fa) * (30 + fl), 1120 - fl, 20), PAL.yellow, { key: 'fire' + i, sb: 4, tear: 1.5, grain: 0.4 }); }
  cut(rect(420, 1120, 280, 40, 10), PAL.charcoal, { key: 'stove', pat: pat.grainWood('rgba(0,0,0,0.2)') });
  coffeePot(560, 850, 1.05, 'potM');
  // the roasted bean (arrived through the T1 bridge) lying on the table
  cut(rect(-30, 1240, W + 60, 24, 0), PAL.woodL, { key: 'tableM', shadow: false, tear: 0 });
  bean(540, 1000, 74, 108, 'beanA');
  // the roasting pan right: dark iron + small beans
  cut(ellipsePts(800, 1060, 130, 34, 0, 22), PAL.charcoal, { key: 'panM', pat: pat.grainWood('rgba(255,255,255,0.05)') });
  for (let i = 0; i < 5; i++) cut(ellipsePts(760 + i * 26, 1040 - (i % 2) * 14, 16, 22, 0.3, 10), BEANC, { key: 'pb' + i, sb: 3, grain: 0.5 });
  // the monk, praying-then-brewing (mood focus), steam rising
  person(250, 1230, 0.95, { shirt: PAL.tweed, beard: true, mood: 'focus', skin: PAL.skin3, key: 'monk' });
  // a moth circles the candle, left
  cut(capsulePts(200, 700, 200, 840, 26), PAL.paper, { key: 'candleM' });
  cut(ellipsePts(200, 688, 16, 22, 0, 12), PAL.yellow, { key: 'cflame' });
  const ma = TT * 5.2, mx = 200 + Math.cos(ma) * 70, my = 640 + Math.sin(ma) * 40;
  cut(rot(ellipsePts(mx, my, 14, 7, 0, 10), mx, my, Math.sin(TT * 22) * 0.7), PAL.paper, { key: 'moth', sb: 3 });
  // the spark: the buzz that keeps the monk up — 6 rays, focused
  spark(300, 660, 88, { rays: 6, mood: 'focus', key: 'heroM' });
  yearTag('Yemen · 1400s');
  capStrip('brewed to pray all night');
}

// =====================================================================
//  ERA 3 — London, 1652: the coffeehouse (tweed walls, the long table)
// =====================================================================
function sCoffeehouse() {
  const cu = TIMELINE.cues;
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.tweed, { key: 'wallL', shadow: false, tear: 0, pat: pat.stripes('rgba(60,50,40,0.14)', 26, 120) });
  cut(rect(-30, 1280, W + 60, 760, 0), PAL.wood, { key: 'floorL', shadow: false, tear: 0, pat: pat.grainWood('rgba(120,60,20,0.22)'), sy: -5 });
  // bunting
  for (let i = 0; i < 9; i++) { const bx = 60 + i * 110; ink([[bx, 300], [bx + 110, 292]], { w: 3, color: PAL.woodD, amt: 0.3, key: 'blt' + i }); cut([[bx + 20, 300], [bx + 88, 296], [bx + 54, 360]], [PAL.pink, PAL.teal, PAL.paper, PAL.mustard][i % 4], { key: 'blf' + i, sb: 4, tear: 0.8 }); }
  // the chalkboard: "the news — 1 penny" (writes on at cu.news)
  cut(rect(360, 400, 380, 260, 14), PAL.charcoal, { key: 'chalk', pat: pat.dots('rgba(255,255,255,0.05)', 2, 26) });
  cut(rect(348, 388, 404, 288, 18), PAL.woodD, { key: 'chalkF' });
  handText('today\'s news', 540, 490, 56, '#e8e2d2', { key: 'ch1', rot: -0.01 });
  handText('1 penny', 540, 580, 64, '#e8e2d2', { key: 'ch2', frac: ev(cu.news, 0.7), rot: 0.01 });
  // the URN arrived from the pot (the T2 B object, at (560, 850))
  coffeePot(560, 850, 1.15, 'urnL', { urn: true });
  cut(rect(420, 1090, 280, 60, 10), PAL.woodD, { key: 'urnstand' });
  // the long table + mugs + papers; mugs pop on "penny", staggered
  cut(rect(-30, 1190, W + 60, 90, 8), PAL.woodL, { key: 'tableL', pat: pat.grainWood('rgba(120,60,20,0.25)') });
  [[240, 1170], [410, 1160], [830, 1180]].forEach(([mx, my], i) => {
    const k = popS(cu.cups + i * 0.22); if (k <= 0) return;
    ctx.save(); ctx.translate(mx, my); ctx.scale(k, k); mug(0, 0, 1.0, [PAL.teal, PAL.pink, PAL.mustard][i], 'mugL' + i, TT > cu.steam); ctx.restore();
  });
  cut(rect(600, 1140, 180, 70, 4), PAL.paper, { key: 'newsppr', rot: 0, sb: 6 });
  ink([[620, 1165], [760, 1162]], { w: 3, color: 'rgba(60,50,40,0.5)', amt: 0.3, key: 'npl1' });
  ink([[620, 1185], [740, 1183]], { w: 3, color: 'rgba(60,50,40,0.5)', amt: 0.3, key: 'npl2' });
  // two Londoners, chatting over the table (bobbing on 2s)
  person(210, 1060, 0.9, { shirt: PAL.blue, mood: 'happy', glasses: true, key: 'lk1' });
  person(800, 1070, 0.9, { shirt: PAL.purple, mood: 'happy', skin: PAL.skin1, key: 'lk2' });
  // the big cup front-centre: the T3 bridge object (at (505, 1150))
  bigCup(505, 1150, 1.0, 'bigcupL');
  // candle + a cat asleep on the chair
  cut(capsulePts(880, 1080, 880, 1180, 22), PAL.paper, { key: 'cndL' });
  cut(ellipsePts(880, 1068, 13, 18, 0, 10), PAL.yellow, { key: 'cfl2' });
  cat(150, 1450, 0.8, PAL.charcoal, 'catL');
  // the spark above the table, delighted — 7 rays
  spark(300, 720, 88, { rays: 7, mood: 'happy', key: 'heroL' });
  yearTag('London · 1652');
  capStrip('penny universities');
}

// =====================================================================
//  ERA 4a — Brazil, 1727, night: the heist (navy wall, hush, one seedling)
// =====================================================================
function sNightHeist() {
  const cu = TIMELINE.cues;
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.navy, { key: 'wallN', shadow: false, tear: 0, pat: pat.dots('rgba(255,240,200,0.10)', 3, 110) });
  cut(rect(-30, 1250, W + 60, 790, 0), PAL.woodD, { key: 'floorN', shadow: false, tear: 0, pat: pat.grainWood('rgba(0,0,0,0.28)'), sy: -5 });
  // the night window + the moon + stars
  cut(rect(580, 360, 320, 380, 10), PAL.woodD, { key: 'winN' });
  cut(rect(600, 380, 280, 340, 4), PAL.night, { key: 'glassN', shadow: false, pat: (bb) => { const R = RNG('starsN'); for (let i = 0; i < 22; i++) sparkle(R.r(bb.x0, bb.x1), R.r(bb.y0, bb.y1), R.r(3, 7) * (0.6 + 0.4 * ((B + i) % 2))); } });
  cut(ellipsePts(740, 500, 46, 46, 0, 24), '#f6ecc8', { key: 'moonN' });
  // a paper ship rides the window's horizon — the seedling's crossing from Cayenne
  cut([[620, 690], [800, 690], [770, 722], [650, 722]], PAL.woodD, { key: 'shipH', sb: 4, tear: 1 });
  cut([[660, 688], [660, 600], [740, 672]], '#e8dfc8', { key: 'shipS', sb: 4, tear: 0.8 });
  cut([[676, 664], [676, 600], [726, 656]], '#d8ccb0', { key: 'shipS2', sb: 4, tear: 0.8 });
  // a few stars in the empty upper-left of the night wall
  { const R = RNG('wallstars'); for (let i = 0; i < 7; i++) sparkle(R.r(90, 420), R.r(280, 620), R.r(3, 6) * (0.6 + 0.4 * ((B + i) % 2))); }
  // a curtain edge, right
  cut(rect(930, 300, 160, 900, 0), PAL.night, { key: 'curtN', shadow: false, tear: 2.2, pat: pat.stripes('rgba(255,255,255,0.05)', 30, 90) });
  // the table + the BOUQUET (the T3 bridge object, pops on "1727")
  cut(rect(-30, 1250, W + 60, 26, 0), PAL.woodL, { key: 'tableN', shadow: false, tear: 0 });
  const bq = popS(T3 + 0.15);   // pops as the bridge opens the night world (in frame at the boundary)
  if (bq > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale((0.4 + 0.6 * bq) * 1.15, (0.4 + 0.6 * bq) * 1.15); bouquet(0, 0, 1.0, 'bqN'); ctx.restore(); }
  // a low candle, left, barely burning
  cut(capsulePts(210, 1120, 210, 1240, 24), PAL.paper, { key: 'cndN' });
  cut(ellipsePts(210, 1104, 12, 17, 0, 10), PAL.yellow, { key: 'cflN' });
  // the seedling: sprouts from the bouquet's cone IN THE SILENCE, then holds
  const gr = seg(TT, cu.seedling, cu.seedling + 0.7);
  if (gr > 0) sprout(540, 870, 170 * EZ.io(gr), 'sproutN');
  // the spark, hushed in the corner near the window: 8 rays, focused, dim (small)
  spark(260, 700, 72, { rays: 8, mood: 'focus', key: 'heroN' });
  yearTag('Brazil · 1727');
  capStrip('one seedling');
}

// =====================================================================
//  ERA 4b — the bloom: the plantation hits (the payoff, loudest)
// =====================================================================
function sPlantation() {
  const cu = TIMELINE.cues;
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.green, { key: 'wallP', shadow: false, tear: 0, pat: pat.stripes('rgba(255,255,255,0.10)', 22, 90, 0.15) });
  sunDisc(830, 400, 64, 'sunP');
  birdsOnWire(100, 380, 330, 3, 'bwP');
  // the rows: three receding rows of bushes; cherries POP in a cascade from the slam
  for (let row = 0; row < 3; row++) {
    const s = 0.62 + row * 0.24, y = 700 + row * 280;
    for (let i = 0; i < 4; i++) {
      const x = 150 + i * 270 + (row % 2) * 60;
      coffeeBush(x, y, s, 'bshP' + row + i);
      // the pop cherries: land staggered from the slam (T4)
      for (let c = 0; c < 2; c++) {
        const k = popS(cu.slam + 0.1 + row * 0.14 + i * 0.07 + c * 0.05); if (k <= 0) continue;
        ctx.save(); ctx.translate(x + (c ? 42 : -44) * s, y + 34 * s); ctx.scale(k, k);
        cherry(0, 0, 26 * s, 'pchP' + row + i + c, { stem: false, leaf: false });
        ctx.restore();
      }
    }
  }
  // the hero bush grown from the seedling: centre, tall, with the big cherry (T5 bridge A)
  coffeeBush(560, 1150, 1.5, 'bushHP');
  cherry(540, 800, 115, 'cherryHP');
  ink([[540, 690], [560, 620], [615, 600]], { w: 11, color: PAL.woodD, amt: 0.3, key: 'bstemP' });
  // a picker reaching into the bush (a hand + basket)
  person(215, 1260, 0.95, { shirt: PAL.mustard, mood: 'wow', skin: PAL.skin2, key: 'pickP' });
  hand(430, 1150, 0.7, -2.3, PAL.skin2, PAL.mustard, { key: 'handP' });
  cut(capsulePts(880, 1290, 880, 1420, 90, 6), PAL.wood, { key: 'bktP' });
  for (let i = 0; i < 5; i++) cut(ellipsePts(848 + i * 16, 1282 - (i % 3) * 8, 15, 15, 0, 10), CHERRY, { key: 'bktc' + i, sb: 3, grain: 0.5 });
  // the spark just LANDED (the slam pop): 9 rays, wow — nearly full at the cut frame
  spark(280, 640, 94, { rays: 9, mood: 'wow', key: 'heroP', s: 0.6 + 0.4 * popS(cu.slam - 0.25) });
  capStrip('it liked the weather');
}

// =====================================================================
//  ERA 5 — today: two billion cups (yellow morning world)
// =====================================================================
function sToday() {
  const cu = TIMELINE.cues;
  cut(rect(-30, -30, W + 60, H + 60, 0), PAL.yellow, { key: 'wallT', shadow: false, tear: 0, pat: pat.dots('rgba(255,255,255,0.16)', 4, 96) });
  sunDisc(830, 380, 60, 'sunT');
  birdsOnWire(110, 360, 330, 3, 'bwT');
  // the BIG cup pops as the bridge opens today (the T5 B object, at (540, 830))
  const bc = popS(T5 + 0.05);
  if (bc > 0) { ctx.save(); ctx.translate(540, 830); ctx.scale(0.55 + 0.45 * bc, 0.55 + 0.45 * bc); bigCup(0, 0, 1.15, 'bigcupT'); ctx.restore(); }
  // the world's cups: a grid popping from "billion", 0.12s apart — two billion made visible
  const cups = [[190, 1300], [330, 1240], [470, 1310], [640, 1240], [790, 1310], [900, 1230], [260, 1430], [600, 1440], [850, 1430]];
  cups.forEach(([mx, my], i) => {
    const k = popS(cu.billion + i * 0.12); if (k <= 0) return;
    ctx.save(); ctx.translate(mx, my); ctx.scale(0.62 * k, 0.62 * k); mug(0, 0, 1.0, [PAL.teal, PAL.pink, PAL.paper, PAL.purple, PAL.teal, PAL.pink, PAL.paper, PAL.teal, PAL.pink][i], 'mugT' + i, true); ctx.restore();
  });
  // the count tag + the Brazil tag (hand-lettered, on the words)
  tag('2 000 000 000 cups a day', 470, 470, 46, { rot: -0.02, s: popS(cu.count + 0.1), frac: ev(cu.count + 0.25, 1.0) });
  tag('1 in 3 beans: Brazil', 700, 1080, 40, { rot: 0.03, s: popS(cu.threeBeans + 0.1), frac: ev(cu.threeBeans + 0.25, 0.8) });
  plant(110, 1230, 0.9, PAL.pink, 'plT');
  // a croissant + the paper: breakfast world
  cut(capsulePts(160, 1350, 300, 1360, 60, 10), PAL.mustard, { key: 'crsT', pat: pat.grainWood('rgba(120,70,20,0.25)') });
  cut(capsulePts(180, 1355, 240, 1350, 56, 8), PAL.woodL, { key: 'crsT2' });
  // the spark: 10 rays, happy, right of the big cup
  spark(280, 700, 90, { rays: 10, mood: 'happy', key: 'heroT' });
  yearTag('today');
  capStrip('two billion cups a day');
}

// ---- END OF SCENES (era 7 = sHillsides({ end: true }), defined above) ----
