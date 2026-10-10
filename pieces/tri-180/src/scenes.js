// =====================================================================
//  SCENES — tri-180. World coordinates 1080x1920, no camera; TT on 1s.
//  Colour code: α red, β green, γ blue, the result yellow.
// =====================================================================
const QA = MC.red, QB = MC.green, QG = MC.blue, QY = MC.yellow;

// wedge as a closed polygon: sector from a0 to a1 around (cx, cy)
function wedgePts(cx, cy, r, a0, a1) {
  const P = [[cx, cy]];
  const n = 26;
  for (let i = 0; i <= n; i++) P.push([cx + Math.cos(lerp(a0, a1, i / n)) * r, cy + Math.sin(lerp(a0, a1, i / n)) * r]);
  return P;
}
// draw a filled+outlined wedge (the angle itself, carried between eras)
function wedge(P, c, al = 1) {
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha = al;
  polyPath(P); ctx.globalAlpha = al * 0.26; ctx.fillStyle = c; ctx.fill();
  ctx.globalAlpha = al; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
const thereBack2 = (u) => { u = clamp(u); return u < 0.5 ? smoothM(u * 2) : 1 - smoothM((u - 0.5) * 2); };

// ---- camera: ONE slow eased push per act, each mapping to a step of the argument ----
// era 1 pushes onto the triangle while its details arrive; era 2 pulls back to reveal the
// whole straight line (the payoff IS the wide view). STYLE.md: "the camera stays still; if you
// need a zoom, make it one slow, eased push" — this is that push, and the reveal it earns.
const CAM_P = [620, 895];   // the triangle's centroid (era 1's focus)
function pieceCam(era, t) {
  if (era === 0) {
    const u = smoothM(seg(t, 1.0, 5.3));
    return u <= 0 ? null : camOf({ z: 1 + 0.13 * u, p: CAM_P, to: CAM_P });
  }
  const u = smoothM(seg(t, T_BR + 0.15, T_BR + 0.95));
  return camOf({ z: 1.13 - 0.13 * u, p: CAM_P, to: CAM_P });
}
// pin a screen point under the current camera -> world coords (keeps the hero readable)
const uncam = (sx, sy) => { const c = pieceCam(eraAt(TT), TT) || CAM0; return [(sx - c.tx) / c.z, (sy - c.ty) / c.z]; };

// ---- era 1: the triangle, its arcs, the labels --------------------------
function sceneTriangle() {
  const cu = CUES;
  fillAll(MC.bg);
  mathTag('the interior angles');
  // sides, lagged (γ's legs first: O→A then B→O, hypotenuse last), each vertex dot popping on arrival
  const triP = runS(cu.tri, 1.1);
  [[O_, A_, 0], [B_, O_, 0.25], [A_, B_, 0.5]].forEach(([p, q, lag], i) => {
    segLine(p[0], p[1], q[0], q[1], MC.white, 5, clamp(triP * 1.7 - lag, 0, 1));
  });
  // vertex dots (manim's Dot): pop at the corners as the sides land, colour-coded to the angle they hold
  [[O_, QG], [B_, QA], [A_, QB]].forEach(([v, c], i) => {
    const u = thereBack(clamp(triP * 1.7 - i * 0.2 - 0.05, 0, 1) * 1.6);
    if (u > 0) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(v[0], v[1], 9 * u, 0, TAU); ctx.fill(); }
  });
  // DrawBorderThenFill (STYLE.md): the border draws, then the fill fades up at 12% —
  // the manim idiom, and the step that makes the arrival readable at phone size
  const fillP = runS(cu.tri + 1.2, 0.8);
  if (fillP > 0) { polyPath(TRI); ctx.fillStyle = MC.white; ctx.globalAlpha = 0.12 * fillP; ctx.fill(); ctx.globalAlpha = 1; }
  // angle arcs sweep in on "angles", lagged 0.5 across the three corners
  const arcP = runS(cu.arcs, 0.75);
  [[O_, A_O, QG, 'γ'], [B_, A_B, QA, 'α'], [A_, A_A, QB, 'β']].forEach(([v, [a0, a1], c], i) => {
    angleArc(v[0], v[1], ARC_R, a0, a1, c, clamp(arcP * 1.5 - i * 0.25, 0, 1), 4);
  });
  // faint construction extensions of each side, staggered — the workbook scaffold keeps 2.6-3.6s alive
  // and reads as how the drawing was made (one idea per frame: the triangle under construction)
  const guid = runS(cu.tri + 1.7, 1.0);
  if (guid > 0) {
    const EXT = 46;   // how far each side line extends past its ends
    [[O_, A_], [B_, O_], [A_, B_]].forEach(([p, q], i) => {
      const gu = clamp(guid * 1.6 - i * 0.22, 0, 1); if (gu <= 0) return;
      const a = Math.atan2(q[1] - p[1], q[0] - p[0]);
      segLine(p[0] - Math.cos(a) * EXT, p[1] - Math.sin(a) * EXT, q[0] + Math.cos(a) * EXT, q[1] + Math.sin(a) * EXT, MC.grey, 2, gu, 0.5);
    });
  }
  // labels settle just after "hides", staggered (α, γ, β — one every ~0.35s)
  const labP = (d) => runS(cu.labels + d, 0.55);
  const mid = (a0, a1) => lerp(a0, a1, 0.5);
  const labAt = (v, a, s, c, u) => {
    const x = v[0] + Math.cos(a) * (ARC_R + 46), y = v[1] + Math.sin(a) * (ARC_R + 46);
    writeText(s, x, y + 14, 44, u, { align: 'left', it: true, color: c });
  };
  labAt(O_, mid(A_O[0], A_O[1]), 'γ', QG, labP(0.35));
  labAt(B_, mid(A_B[0], A_B[1]), 'α', QA, labP(0));
  labAt(A_, mid(A_A[0], A_A[1]), 'β', QB, labP(0.7));
  // the right-angle mark at O draws itself on "Take" — a true detail, and the era keeps moving
  rightAngle(O_[0], O_[1], [1, 0], [0, -1], 30 * runS(cu.take, 0.4), QG, 0.9);
  // on "corners": the wedges come OFF — each corner wedge fills, one pulse
  const det = seg(TT, cu.detach, cu.detach + 0.55);
  if (det > 0) {
    [[O_, A_O, QG], [B_, A_B, QA], [A_, A_A, QB]].forEach(([v, [a0, a1], c], i) => {
      const u = clamp(det * 1.6 - i * 0.2, 0, 1);
      wedge(wedgePts(v[0], v[1], ARC_R, a0, a1), c, 0.9 * thereBack2(u));
    });
  }
  // hero watches the drawing — its gaze tracks whatever is being drawn right now; feet pinned to
  // screen (830, 1470) under the camera so it never drifts into the platform-UI strip
  let lookPt = [(O_[0] + A_[0] + B_[0]) / 3, (O_[1] + A_[1] + B_[1]) / 3];
  const sides = [[O_, A_, 0], [B_, O_, 0.25], [A_, B_, 0.5]];
  sides.forEach(([p, q, lag]) => { const u = clamp(triP * 1.7 - lag, 0, 1); if (u > 0.02 && u < 0.98) lookPt = [lerp(p[0], q[0], u), lerp(p[1], q[1], u)]; });
  const arcV = [[O_, A_O], [B_, A_B], [A_, A_A]];
  arcV.forEach(([v, [a0, a1]], i) => { const u = clamp(arcP * 1.5 - i * 0.25, 0, 1); if (u > 0.02 && u < 0.98) lookPt = [v[0] + Math.cos(lerp(a0, a1, u)) * ARC_R, v[1] + Math.sin(lerp(a0, a1, u)) * ARC_R]; });
  if (det > 0) lookPt = [lookPt[0] * 0.4 + CX * 0.6, 900];
  const hw = uncam(830, 1470), hz = 0.85 / (pieceCam(0, TT) || CAM0).z;
  piHero(hw[0], hw[1], hz, { look: lookPt, mood: TT >= cu.take ? 'focus' : 'calm', key: 'pi1' });
  mathCaption('every triangle hides a straight line');
}

// ---- era 2: the wedges fill exactly the upper half-disc = 180° ----------
function sceneLine() {
  const cu = CUES;
  fillAll(MC.bg);
  mathTag('the proof');
  // the baseline (the straight line that was hidden)
  showCreation([BASE0, BASE1], runS(cu.base, 0.55), { c: MC.white, w: 5 });
  // the half-disc outline, faint grey construction
  showCreation(arcPts(C2[0], C2[1], R2, Math.PI, TAU, 40), runS(cu.base + 0.1, 0.7), { c: MC.grey, w: 2.5 });
  // the three wedges fly in from their era-1 corners, staggered, and land
  // adjacent: α (left) + γ (middle) + β (right) = the upper half-disc
  const rows = [
    [QA, Math.PI, Math.PI + A_RAD, B_, 'α'],      // 53.13°, from corner B
    [QG, Math.PI + A_RAD, Math.PI + A_RAD + Math.PI / 2, O_, 'γ'],  // 90°, from corner O
    [QB, TAU - B_RAD, TAU, A_, 'β'],              // 36.87°, from corner A
  ];
  rows.forEach(([c, a0, a1, from, name], i) => {
    const u = runS(cu.wedges + i * 0.16, 0.5);       // eased fly-in
    const P = wedgePts(C2[0], C2[1], R2, a0, a1);
    const dx = (from[0] - C2[0]) * (1 - u), dy = (from[1] - C2[1]) * (1 - u);
    ctx.save(); ctx.translate(dx, dy);
    wedge(P, c, u > 0 ? 1 : 0);
    // the label rides its wedge
    const ma = lerp(a0, a1, 0.5), lr = R2 * 0.62;
    writeText(name, C2[0] + Math.cos(ma) * lr - 12, C2[1] + Math.sin(ma) * lr + 14, 44, u, { align: 'left', it: true, color: c });
    ctx.restore();
  });
  // the live readout counts to 180 in discrete steps and LANDS on "eighty"
  const countP = runS(cu.count, 0.55);
  const step = (u) => Math.round((180 * u) / 15) * 15;   // discrete steps: 0,15,…,180 — every shown value reads as a count
  const roFade = 1 - runS(cu.formula + 0.6, 0.45);       // the conclusion formula replaces the readout
  if (roFade > 0)
    readout([mv('α', QA), '+', mv('γ', QG), '+', mv('β', QB)], step(countP), 0, 130, 1300, 56, { c: QY, align: 'left', al: roFade });
  // the conclusion formula, written after the count lands
  writeTex(
    [mv('α', QA), '+', mv('γ', QG), '+', mv('β', QB), '=', mn('180', QY, { id: 'res' }), { sp: 0.06 }, mn('°', QY)],
    CX, 460, 88, runS(cu.formula, 0.9),
  );
  // a brace under the line (side −1 = label BELOW the baseline, clear of the wedges)
  mBrace(BASE0[0] + 60, BASE1[1] + 14, BASE1[0] - 60, BASE1[1] + 14, { side: -1, label: 'a straight angle', p: runS(cu.formula + 0.25, 0.6) });
  // the flash on "time" — the payoff
  const fl = seg(TT, cu.flash, cu.flash + 0.45);
  if (fl > 0) flashAt(C2[0], C2[1] - R2 * 0.55, smoothM(fl), MC.yellowP, 70, 5);
  // hero: wow at the flash, feet pinned to screen (830, 1470)
  const hw2 = uncam(830, 1470), hz2 = 0.85 / (pieceCam(1, TT) || CAM0).z;
  piHero(hw2[0], hw2[1], hz2, { look: [C2[0], C2[1]], mood: TT >= cu.flash ? 'wow' : 'calm', hop: thereBack2(seg(TT, cu.wedges + 0.3, cu.wedges + 0.9)), key: 'pi2' });
  mathCaption('the angles fill a straight line');
}
