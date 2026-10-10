
// =====================================================================
//  ERAS + BRIDGES — cp-1-dancing-goats. The coffee thread, object by object:
//  cherry -> bean -> pot -> urn ... cup -> bouquet ... cherry -> cup -> cherry.
//  Short bridges (d: 0.4) — five of them in 37s, per craft.md's budget.
//  The one hard cut (26.25) is the slam; every bridge object is >= 200px
//  and in frame at its boundary.
// =====================================================================
const ERA_BG = ['#cfe2ee', '#d9a441', '#7a6650', '#26315f', '#5aa05a', '#f6cf55', '#cfe2ee'];

const potBody = (x, y, s) => [[x - 85 * s, y], [x + 85 * s, y], [x + 70 * s, y + 200 * s], [x - 70 * s, y + 200 * s]];
const cupBody = (x, y, s) => [[x - 95 * s, y], [x + 95 * s, y], [x + 74 * s, y + 150 * s], [x - 74 * s, y + 150 * s]];
const bundle = (x, y, s) => [[x - 70 * s, y + 190 * s], [x + 70 * s, y + 190 * s], [x + 78 * s, y + 20 * s], [x + 52 * s, y - 70 * s], [x - 10 * s, y - 100 * s], [x - 60 * s, y - 60 * s], [x - 78 * s, y + 20 * s]];

const BRIDGES = [
  { // T1: the cherry becomes the bean (Ethiopia -> Yemen)
    tc: T1, d: 0.4,
    A: () => ({ P: ellipsePts(540, 790, 108, 103, 0, 30), c: CHERRY }),
    B: () => ({ P: rot(ellipsePts(540, 1000, 74, 108, 0, 26), 540, 1000, 0.35), c: BEANC }),
  },
  { // T2: the pot grows into the house urn (Yemen -> London)
    tc: T2, d: 0.4,
    A: () => ({ P: potBody(560, 850, 1.05), c: PAL.mustard }),
    B: () => ({ P: potBody(560, 850, 1.15), c: PAL.charcoal }),
  },
  { // T3: the cup becomes the bouquet (London -> the night)
    tc: T3, d: 0.4,
    A: () => ({ P: cupBody(505, 1150, 1.0), c: PAL.paper }),
    B: () => ({ P: bundle(540, 900, 1.0), c: PAL.pink }),
  },
  { // T5: the cherry becomes the cup (the plantation -> today)
    tc: T5, d: 0.4,
    A: () => ({ P: ellipsePts(540, 800, 118, 112, 0, 30), c: CHERRY }),
    B: () => ({ P: cupBody(540, 830, 1.15), c: PAL.paper }),
  },
  { // T6: the cup becomes the cherry (today -> the hillside: the loop)
    tc: T6, d: 0.4,
    A: () => ({ P: cupBody(540, 830, 1.15), c: PAL.paper }),
    B: () => ({ P: ellipsePts(540, 790, 108, 103, 0, 30), c: CHERRY }),
  },
];
