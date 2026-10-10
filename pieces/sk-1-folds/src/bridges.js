
// =====================================================================
//  ERAS + BRIDGES — sk-1-folds. One page. THE LAUNCH is a shape morph:
// the page closes onto the finished dart, the dart becomes the flying
// plane (a colour scribble inside a graphite outline — literally true),
// and the flight page opens around it. The payoff hit lands at the
// morph's centre, in the pause before "Throw it gently".
// =====================================================================
const ERA_BG = ['#f2ead8', '#f2ead8'];

// the dart, top view, at the page centre (the shape it has at the launch)
const DART_A = () => ({ P: [[SMX, 420], [300, 1030], [254, 1150], [826, 1150], [790, 1030]], c: '#fffdf6' });
// the plane, side view, at the launch position (the hero's hand height)
const PLANE_PTS = (x, y, a) => {
  const c = Math.cos(a), s = Math.sin(a), R = (u, v) => [x + u * c - v * s, y + u * s + v * c];
  return [R(-10, -78), R(64, 6), R(18, 6), R(40, 52), R(-56, 6)];
};
const PLANE_B = () => ({ P: PLANE_PTS(300, 1230, -0.2), c: '#fffdf6' });

const BRIDGES = [
  { // THE LAUNCH: the folded dart becomes the flying plane
    tc: K1, d: 0.4,
    A: DART_A, B: PLANE_B,
  },
];
