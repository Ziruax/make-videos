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

// ---- era 1: the triangle, its arcs, the labels --------------------------
function sceneTriangle() {
  const cu = CUES;
  fillAll(MC.bg);
  mathTag('the interior angles');
  // sides, lagged (γ's legs first: O→A then B→O, hypotenuse last)
  const triP = runS(cu.tri, 1.1);
  [[O_, A_, 0], [B_, O_, 0.25], [A_, B_, 0.5]].forEach(([p, q, lag], i) => {
    segLine(p[0], p[1], q[0], q[1], MC.white, 5, clamp(triP * 1.7 - lag, 0, 1));
  });
  // angle arcs sweep in on "angles", lagged 0.5 across the three corners
  const arcP = runS(cu.arcs, 0.75);
  [[O_, A_O, QG, 'γ'], [B_, A_B, QA, 'α'], [A_, A_A, QB, 'β']].forEach(([v, [a0, a1], c], i) => {
    angleArc(v[0], v[1], ARC_R, a0, a1, c, clamp(arcP * 1.5 - i * 0.25, 0, 1), 4);
  });
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
  // hero watches, low right
  piHero(830, 1700, 0.85, { look: [(O_[0] + A_[0]) / 2, (O_[1] + B_[1]) / 2], mood: 'calm', key: 'pi1' });
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
  // hero: wow at the flash
  piHero(830, 1700, 0.85, { look: [C2[0], C2[1]], mood: TT >= cu.flash ? 'wow' : 'calm', hop: thereBack2(seg(TT, cu.wedges + 0.3, cu.wedges + 0.9)), key: 'pi2' });
  mathCaption('the angles fill a straight line');
}
