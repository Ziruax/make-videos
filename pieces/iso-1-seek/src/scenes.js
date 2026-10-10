// =====================================================================
//  SCENES — iso-1-seek "Fifteen Milliseconds". One locked-off build: the
//  drive is drawn as it truly is — a tray (floor + four walls), two
//  platters on a spindle, a pivot post and an arm whose head hangs over
//  the platter and never touches it, and a lid on a back hinge that
//  covers everything when closed (painter's order does the hiding).
//  World units ~ px; motion on 1s, spring settles; TT is the clock.
// =====================================================================
const ISO_MAIN = { ox: 520, oy: 1010, u: 1 };
const cu = CUES;

// ---- the chassis: footprint, walls, the drop-in offset
const CH = { x: -220, y: -180, w: 440, d: 360 };            // the tray's footprint (walls z 42..118)
const driveDrop = (t) => (1 - spring(t, cu.drop + 0.18, { k: 130, damp: 0.6 })) * 240;
// ---- the arm: pivot inside the tray, length, radius -> angle (the branch that sweeps the disc)
const PIV = { x: -196, y: -128 };
const AD = Math.hypot(PIV.x, PIV.y), AL = 214;
const THP = Math.atan2(PIV.y, PIV.x);
const armTheta = (r) => THP + Math.acos(clamp((r * r - AD * AD - AL * AL) / (2 * AD * AL), -1, 1));
const headXY = (r) => { const th = armTheta(r); return [PIV.x + AL * Math.cos(th), PIV.y + AL * Math.sin(th)]; };
const R_PARK = 165, R_REST = 95, R_SEEK = 60, R_OUT = 148;  // parked off-disc -> rest -> an inner track -> the outer edge
function armR(t) {
  let r = R_PARK;
  r = springTo(t, cu.arm, r, R_REST, { k: 55, damp: 0.72 });    // swings in from the park ramp
  r = springTo(t, cu.seek1, r, R_SEEK, { k: 220, damp: 0.5 });  // the save: a servo seek, slight overshoot
  r = springTo(t, cu.hit, r, R_OUT, { k: 900, damp: 0.5 });     // THE FULL STROKE: ~0.1 s, a bounce at the end
  r = springTo(t, cu.crosses, r, R_SEEK, { k: 700, damp: 0.55 }); // the line says it: the arm crosses, live
  r = springTo(t, cu.close, r, R_PARK, { k: 90, damp: 0.7 });   // parks again as the lid closes
  return r;
}
// ---- the lid: a slab on a hinge along the back-top edge (y = -180, z = 118)
const LID_A = 70 * DEG;                                       // fully open
function lidAngle(t) {
  let a = 0;
  a = springTo(t, cu.lid, a, LID_A, { k: 110, damp: 0.68 });
  a = springTo(t, cu.close, a, 0, { k: 130, damp: 0.66 });
  return a;
}
function lidGeom(t) {
  const a = lidAngle(t);
  return { o: [CH.x, CH.y, 118 + driveDrop(t)], a: [1, 0, 0], b: [0, Math.cos(a), Math.sin(a)], n: [0, -Math.sin(a), Math.cos(a)] };
}
// ---- the spin: the marker's orbit (readable speed; the caption carries the true number)
const spinRamp = () => smooth(cu.spin, cu.spin + 1.2, TT);
const phi = () => TAU * 0.85 * Math.max(0, TT - cu.spin) * spinRamp();
// ---- the two true-proportion bars (a blink vs the seek)
const BAR = { a: { x: 200, y: 320 }, b: { x: 400, y: 320 }, w: 20, hMax: 220 };
const blinkFill = () => ev(cu.bars, t1('l7', 23.96) - 0.35 - cu.bars);
const seekH = () => 11 * spring(TT, cu.hit, { k: 600, damp: 0.6 });

// =====================================================================
function sceneDrive() {
  setIso(ISO_MAIN);
  const DZ = driveDrop(TT);

  // ---- 1. the plinth (two plates that drop in, back plate first; present from frame 0, mid-air)
  const pd = (i) => (1 - spring(TT, cu.drop + i * 0.09, { k: 150, damp: 0.6 })) * 190;
  isoPlates(-270, -210, 0, 540, 420, [{ h: 16, r: 46, dz: pd(0) }, { h: 12, gap: 6, inset: 14, r: 38, dz: pd(1) - pd(0) }]);
  const PZ = 34;

  // ---- 2. the tray: floor + back / left / right walls (the front wall comes after the interior)
  if (TT > cu.drop + 0.18) {
    isoBox(CH.x, CH.y, PZ + DZ, CH.w, CH.d, 8, { crease: false });                            // the floor (top at 42)
    isoBox(CH.x, CH.y, 42 + DZ, CH.w, 8, 76, { r: 14 });                                      // back wall
    isoBox(CH.x, -172, 42 + DZ, 8, 344, 76, { r: 14 });                                       // left wall
    isoBox(212, -172, 42 + DZ, 8, 344, 76, { r: 14 });                                        // right wall
    // the SATA port on the right wall's outer face
    const rf = faceOf([220, -172, 118 + DZ], [0, 1, 0], [0, 0, -1]);
    faceRR(rf, 128, 38, 68, 42, 4, { stroke: PAL.edge });
    for (let k = 0; k < 7; k++) faceLine(rf, [[136 + k * 8, 44], [136 + k * 8, 74]], PAL.inner);
    // the park ramp just inside the back edge (the head rests here when parked)
    isoBox(-14, -168, 63 + DZ, 30, 14, 10, { r: 4, seg: 3, creaseC: PAL.inner });
  }

  // ---- 3. the interior (hidden while the lid is closed — the lid's fill covers it)
  if (TT > cu.drop + 0.18) {
    isoCyl(0, 0, 42 + DZ, 24, 28);                                                            // the spindle hub (to z 70)
    isoCyl(0, 0, 46 + DZ, 150, 7);                                                            // platter one (46-53)
    isoCyl(0, 0, 56 + DZ, 150, 7);                                                            // platter two (56-63)
    const top = faceOf([-150, -150, 63 + DZ], [1, 0, 0], [0, 1, 0]);                          // the top platter's face
    for (const rr of [62, 92, 122]) faceEll(top, 150, 150, rr, rr, { stroke: PAL.inner, n: 40 });   // the tracks
    // the target track flashes edge-grey as the head arrives (the seek, then the outer edge)
    const flash = Math.max(1 - clamp(seg(TT, cu.seek1 + 0.25, cu.seek1 + 1.0)), 1 - clamp(seg(TT, cu.hit + 0.15, cu.hit + 1.0)));
    if (flash > 0) {
      const rr = TT > cu.hit ? R_OUT : R_SEEK;
      ctx.save(); ctx.globalAlpha = flash;
      faceEll(top, 150, 150, rr, rr, { stroke: PAL.edge, n: 40 });
      ctx.restore();
    }
    // THE SPIN, twice-marked: a grey dot with three trailing arcs on the platter face, plus two
    // ticks riding the platter's rim (the rim makes the speed read even at thumbnail size;
    // a tick shows only on the half of the rim that faces the viewer)
    if (TT > cu.spin) {
      const p = phi(), mr = 122;
      for (let k = 1; k <= 3; k++) {
        const a0 = p - 0.08 - k * 0.08, P = [];
        for (let j = 0; j <= 6; j++) P.push([150 + mr * Math.cos(a0 + (j / 6) * 0.07), 150 + mr * Math.sin(a0 + (j / 6) * 0.07)]);
        faceLine(top, P, PAL.inner);
      }
      faceEll(top, 150 + mr * Math.cos(p), 150 + mr * Math.sin(p), 7, 7, { fill: PAL.textD, n: 16 });
      for (const dp of [0, Math.PI]) {
        const a = p + dp;
        if (Math.cos(a) + Math.sin(a) > 0) line3([[150 * Math.cos(a), 150 * Math.sin(a), 56 + DZ], [150 * Math.cos(a), 150 * Math.sin(a), 63 + DZ]], PAL.edge);
      }
    }
    // the pivot: a base plate (the voice-coil magnet's corner) + the post
    isoBox(-212, -164, 42 + DZ, 52, 72, 10, { r: 10 });
    isoCyl(PIV.x, PIV.y, 42 + DZ, 17, 49);                                                   // the post (to z 91)
    // THE ARM: a slab rotating about the post (a visibly rotating part — off-axis is allowed)
    const r = armR(TT), th = armTheta(r);
    const ao = [PIV.x + 17 * Math.sin(th), PIV.y - 17 * Math.cos(th), 79 + DZ];
    isoSlab(ao, [Math.cos(th), Math.sin(th), 0], [-Math.sin(th), Math.cos(th), 0], [0, 0, 1], AL, 34, 12, { r: 8, seg: 5, creaseC: PAL.inner });
    isoBox(PIV.x - 26, PIV.y - 26, 78 + DZ, 52, 52, 14, { r: 10, seg: 4, creaseC: PAL.inner });   // the pivot block
    // THE HEAD (the accent): a dark block hanging at the tip, flying over the platter;
    // from the close-up it bobs ±1.2 on the air cushion (the hero's bob is the precedent)
    const [hx, hy] = headXY(r);
    const bob = TT > cu.float && lidAngle(TT) > 0.3 ? 1.2 * Math.sin(TT * TAU * 0.9) : 0;
    isoBox(hx - 9, hy - 9, 67 + DZ + bob, 18, 18, 12, { r: 3, seg: 3, fill: PAL.accent, edge: PAL.accent, crease: false });
    // the 5 nm gap bracket, drawn at the close-up (the caption names the number)
    if (TT > cu.gap) {
      ctx.save(); ctx.globalAlpha = clamp(spring(TT, cu.gap, { k: 120, damp: 0.8 }));
      line3([[hx + 13, hy - 2, 63 + DZ], [hx + 34, hy - 2, 63 + DZ]], PAL.edge);
      line3([[hx + 13, hy - 2, 67 + DZ], [hx + 34, hy - 2, 67 + DZ]], PAL.edge);
      line3([[hx + 34, hy - 2, 63 + DZ], [hx + 34, hy - 2, 67 + DZ]], PAL.inner);
      ctx.restore();
    }
    // the hit ping: three short accent rays off the head for ~0.3 s
    if (TT > cu.hit && TT < cu.hit + 0.32) {
      const u = 1 - (TT - cu.hit) / 0.32;
      for (const da of [-0.5, 0, 0.5]) {
        const a = th + da;
        line3([[hx + 16 * Math.cos(a), hy + 16 * Math.sin(a), 73 + DZ], [hx + (16 + 26 * u) * Math.cos(a), hy + (16 + 26 * u) * Math.sin(a), 73 + DZ]], PAL.accent);
      }
    }
  }

  // ---- 4. the front wall (after the interior: it hides the front slivers)
  if (TT > cu.drop + 0.18) isoBox(CH.x, 172, 42 + DZ, CH.w, 8, 76, { r: 14 });
  // the status LED on the front wall: a grey lamp (the accent stays with the head / the hero's eyes)
  if (TT > cu.drop + 0.3) {
    const ff = faceOf([CH.x, 180, 118 + DZ], [1, 0, 0], [0, 0, -1]);
    lamp(ff, 26, 16, 3.4, TT < cu.close ? blinkOn(TT, 1.0) : blinkOn(TT, 1.6));
    isoText(ff, '1 TB', 60, 22, 15, { color: PAL.textD });
  }

  // ---- 5. the lid (a slab on the back hinge; closed it covers the whole tray)
  if (TT > cu.drop + 0.18) {
    const g = lidGeom(TT);
    const S = isoSlab(g.o, g.a, g.b, g.n, CH.w, CH.d, 10, { r: 22, seg: 6 });
    const lf = slabFace(S);
    // the lid's top: a vent grid, the label sticker with a barcode, four screws
    for (let k = 0; k < 6; k++) faceRR(lf, 258 + k * 24, 54, 13, 64, 4, { seg: 3 });
    faceRR(lf, 64, 218, 132, 84, 8, { stroke: PAL.edge });
    isoText(lf, '1 TB', 92, 262, 30, { color: PAL.text });
    isoText(lf, '7200 RPM', 92, 290, 15, { color: PAL.textD });
    for (let k = 0; k < 7; k++) faceLine(lf, [[78 + k * 9, 226], [78 + k * 9, 240]], PAL.inner);
    for (const [u, v] of [[22, 22], [418, 22], [22, 338], [418, 338]]) faceEll(lf, u, v, 6, 6, { stroke: PAL.edge, n: 14 });
  }

  // ---- 6. the desk props (life: steam, a swaying plant, the hero's bob)
  if (TT > cu.drop + 0.4) isoMug(-252, 120, PZ + (1 - spring(TT, cu.drop + 0.45, { k: 180, damp: 0.55 })) * 150, 28, 48);
  if (TT > cu.drop + 0.5) isoPlant(250, -80, PZ + (1 - spring(TT, cu.drop + 0.55, { k: 180, damp: 0.55 })) * 150, 1);
  // the hero: watches the drive, then the bars; hops at the hit and at "still"
  if (TT > cu.hero) {
    const look = TT < cu.bars ? 0.55 : TT < cu.hit ? -0.55 : 0.4;
    cubeBot(255, 145, PZ + (1 - spring(TT, cu.hero, { k: 170, damp: 0.5 })) * 200, 68, { key: 'isoseek', hop: [cu.hit, cu.hop], look });
  }

  // ---- 7. the save: a file card drops in front, a cable to the SATA port
  if (TT > cu.save) {
    const fz = (1 - spring(TT, cu.save, { k: 170, damp: 0.6 })) * 130;
    isoPanelY(200, 230, fz, 100, 90, 10, { r: 8, seg: 4 });
    const cf = faceOf([200, 240, 90 + fz], [1, 0, 0], [0, 0, -1]);
    isoText(cf, 'report.txt', 16, 26, 16, { color: PAL.text });
    for (let k = 0; k < 3; k++) faceLine(cf, [[16, 40 + k * 14], [84, 40 + k * 14]], PAL.inner);
    isoCable([[248, 246, fz + 12], [292, 168, 26], [278, 40, 40], [244, -52, 58], [221, -30, 62 + DZ]], { w: 7 });
  }

  // ---- 8. THE TWO BARS (the payoff, true proportion: 300 ms vs 15 ms = 220 vs 11)
  if (TT > cu.bars) {
    const rise = clamp(spring(TT, cu.bars, { k: 120, damp: 0.8 }));
    ctx.save(); ctx.globalAlpha = rise;
    // a ground baseline joining the two bars (the zero line)
    faceLine(faceOf([186, 344, 0], [1, 0, 0], [0, 1, 0]), [[0, 0], [244, 0]], PAL.inner);
    // bar A: the blink (300 ms) — fills like a clock with the spoken line
    const hA = BAR.hMax * blinkFill();
    if (hA > 0.5) isoBox(BAR.a.x, BAR.a.y, 0, BAR.w, BAR.w, hA, { r: 4, seg: 3, creaseC: PAL.inner });
    // bar B: the seek (15 ms) — pops at THE HIT, instantly
    const hB = seekH();
    if (hB > 0.4) isoBox(BAR.b.x, BAR.b.y, 0, BAR.w, BAR.w, hB, { r: 2, seg: 2, creaseC: PAL.inner });
    ctx.restore();
    // the labels: screen-space mono, beside each bar's base (ground-skewed text dives toward
    // the caption band — measured, then moved)
    const f = () => {
      ctx.save(); ctx.globalAlpha = rise;
      ctx.font = `400 24px ${ISOMONO}`; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = PAL.text; ctx.textAlign = 'left';
      ctx.fillText('BLINK 300 MS', 424, 1292);
      ctx.fillStyle = TT > cu.hit ? PAL.text : PAL.textD;
      ctx.fillText('SEEK 15 MS', 636, 1362);
      ctx.restore();
    };
    if (DEFER) DEFER.push(f); else f();
  }

  // ---- 9. the phase tag (the engineering-document label, top left)
  const PHASES = [
    [0.2, '01', 'the drive'], [cu.lid, '02', 'the cutaway'], [cu.spin, '03', 'the spin'],
    [cu.float, '04', 'the head'], [cu.save, '05', 'the seek'], [cu.hit, '06', '15 ms'],
    [cu.close, '07', 'the close'],
  ];
  let ph = null;
  for (const p of PHASES) if (TT >= p[0]) ph = p;
  if (ph) tagAt(ph[0], ph[1], ph[2]);

  // ---- 10. the captions (one per spoken line; each springs in at its cue and hands over)
  const CAPS = [
    [1.0, 'no moving parts visible'],
    [cu.lid + 0.35, 'goodbye, warranty'],
    [cu.spin + 0.25, 'seventy-two hundred rpm'],
    [cu.arm + 0.1, 'one arm. one head.'],
    [cu.float, 'it flies. it never lands.'],
    [cu.gap, 'five nanometers of air'],
    [cu.bars, 'your eye, blinking'],
    [cu.hit + 0.1, 'fifteen milliseconds'],
    [cu.close + 0.5, 'seventy years young'],
  ];
  for (let i = 0; i < CAPS.length; i++) {
    const [t, s] = CAPS[i];
    const end = i + 1 < CAPS.length ? CAPS[i + 1][0] : DURATION + 1;
    if (TT >= t && TT < end) isoCaption(s, { at: t });
  }
}

// a phase tag that springs in at an absolute time (the kit's isoTag is era-based)
function tagAt(t0, num, label) {
  const f = () => {
    const a = clamp(spring(TT, t0 + 0.15, { k: 140, damp: 0.85 }));
    if (a <= 0.001) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = `400 30px ${ISOMONO}`; ctx.fillStyle = PAL.textD; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(num, 70, 318); const w = ctx.measureText(num).width;
    polyPath([[70 + w + 16, 308], [70 + w + 16 + 60 * a, 308]], false); hair(PAL.edge); ctx.stroke();
    ctx.fillStyle = PAL.text; ctx.fillText(label, 70 + w + 92, 318);
    ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}
