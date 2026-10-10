
// =====================================================================
//  ERAS + BRIDGES — px-1-square. Resolution tells time: each era at its
//  true resolution (54x96 -> 90x160 -> 180x320 -> 360x640). THE SQUARE
//  thread rides three morphs: ball -> life -> coin -> app icon, drawn
//  with pixToWorld so each shape lands on the drawn object.
// =====================================================================
const ERA_RES = [[54, 96], [90, 160], [180, 320], [360, 640]];
const ERA_BG = ['#14101e', HANDHELD[0], '#232a4e', '#14101e'];
const ERA_POST = [
  { scan: 1, vignette: 1, rim: [PAL16.grey, PAL16.ink] },   // the 1972 CRT: scanlines + the curved tube
  { lcd: 1, rim: [HANDHELD[2], HANDHELD[0]] },              // the 1989 handheld: the LCD grid
  { scan: 0.6, rim: [PAL16.sky, PAL16.ink] },               // the 16-bit TV
  { rim: [PAL16.white, PAL16.ink] },                        // today: clean
];

// square outlines in WORLD coords (the blob morphs them; grids step)
const sq = (x, y, r, c) => ({ P: [[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]], c });
const circ = (x, y, r, c) => ({ P: ellipsePts(x, y, r, r, 0, 24), c });

const BRIDGES = [
  { // T1: the ball becomes a green life (the CRT -> the handheld)
    tc: T1, d: 0.4,
    A: () => sq(540, 800, 21, PAL16.white),
    B: () => sq(540, 804, 18, HANDHELD[3]),
  },
  { // T2: the life becomes the coin (the handheld -> the 16-bit era)
    tc: T2, d: 0.4,
    A: () => sq(540, 804, 18, HANDHELD[3]),
    B: () => circ(660, 720, 26, PAL16.yellow),
  },
  { // T3: the coin becomes the app icon (the 16-bit era -> today)
    tc: T3, d: 0.4,
    A: () => circ(660, 720, 26, PAL16.yellow),
    B: () => sq(548, 376, 24, PAL16.purple),
  },
];
