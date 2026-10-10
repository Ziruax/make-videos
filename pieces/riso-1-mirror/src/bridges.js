
// =====================================================================
//  ERAS + BRIDGES — riso-1-mirror.
//  B1: the world closes onto the hero, whose outline becomes the earcup
//      circle (zoom into the headphone). B2: hero-to-hero — the bean rides
//      out of the wave world back into the quiet cabin. Everything else
//      cuts on the 8th grid; K3 is the slam.
// =====================================================================
const ERA_BG = [
  rgbHex(inkRGB({ teal: 0.1, pink: 0.07, yellow: 0.3 })),    // the cabin
  rgbHex(inkRGB({ teal: 0.16, pink: 0.05, yellow: 0.18 })),  // the earcup close-up
  rgbHex(inkRGB({ yellow: 0.1, teal: 0.02 })),               // the mirror diagram
  rgbHex(inkRGB({ yellow: 0.12, teal: 0.02, pink: 0.02 })),  // both play
  rgbHex(inkRGB({ yellow: 0.1, teal: 0.02, pink: 0.02 })),   // the meet
  rgbHex(inkRGB({ teal: 0.1, pink: 0.03, yellow: 0.3 })),    // the quiet cabin
];

const BRIDGES = [
  { // B1: zoom into the hero's headphone — the bean's outline becomes the cup
    tc: B1, d: 0.4,
    A: () => ({ P: ellipsePts(420, 1120, 96, 122, 0, 40), c: rgbHex(inkRGB(MIX.blue)) }),
    B: () => ({ P: ellipsePts(540, 830, 348, 348, 0, 40), c: rgbHex(inkRGB(MIX.blue)) }),
  },
  { // B2: the bean rides home — hero to hero, wave world to quiet cabin
    tc: B2, d: 0.4,
    A: () => SP(540, 1500, 160),
    B: () => SP(420, 1120, 180),
  },
];
