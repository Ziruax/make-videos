
// =====================================================================
//  ERAS + BRIDGES — ch-1-enter. Two hero-to-hero bridges: the dot falls
//  INTO the machine (B1) and climbs back OUT (B2); every other station
//  change is a hard cut on the 8th grid (F5 beat-cut). The dot keeps its
//  terracotta + asterisk in both worlds (it glows in the dark).
// =====================================================================
const ERA_BG = [C.paper, C.paper, C.paper, C.paper, C.navy, C.navyD, C.navy, C.paper, C.paper, C.paper];

const BRIDGES = [
  { // B1: down into the machine — the paper world closes onto the dot,
    // it drops through the inked hole, and the kernel's navy opens around it
    tc: B1, d: 0.4,
    A: () => SP(540, 976, 183),
    B: () => SP(540, 1040, 183),
  },
  { // B2: back out — the dark closes onto the dot (now carrying the bytes),
    // it climbs through the hole, and the desk's paper world opens
    tc: B2, d: 0.4,
    A: () => SP(540, 880, 183),
    B: () => SP(540, 300, 183),
  },
];
