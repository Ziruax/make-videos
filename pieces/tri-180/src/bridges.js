// =====================================================================
//  ERAS + BRIDGE — tri-180. The triangle becomes the line it was hiding:
//  the TRIANGLE outline morphs into the flat yellow bar (the result).
// =====================================================================
const ERA_BG = [MC.bg, MC.bg];
const BRIDGES = [
  {
    tc: T_BR, d: D_BR, m: M_BR,
    A: () => ({ P: TRI, c: MC.yellow }),                                    // the triangle
    B: () => ({ P: rrectPts(C2[0] - R2 - 20, C2[1] - 22, (R2 + 20) * 2, 44, 10), c: MC.yellow }),  // the line bar
  },
];
