import * as THREE from 'three';

/** The blade axis in the rig's local frame — `SwordModel` stands the GLB up. */
const BLADE_AXIS = new THREE.Vector3(0, 1, 0);
const UP = new THREE.Vector3(0, 1, 0);

/** Distances from the hand, along the blade, in the rig's local units. */
export const POMMEL = -0.25;
export const BLADE_TIP = 1.75;
/** Balance point — poses pivot here by default, which keeps the sword framed. */
export const BLADE_CENTRE = 0.75;
/** Inner edge of the swipe ribbon: close to the tip, so it stays a glint. */
export const TRAIL_INNER = 1.42;

/** Fixed camera radius. Zoom comes from pose scale, so framing stays solvable. */
export const CAMERA_DISTANCE = 6.4;
export const CAMERA_FOV = 32;

export type Ease = (t: number) => number;

const linear: Ease = (t) => t;
const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic: Ease = (t) => t * t * t;
/** The snap of a cut: nearly all of the travel in the first few frames. */
const easeOutExpo: Ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

type Pose = {
  /** Scroll offset (0..1) this pose is reached at. */
  t: number;
  /** Where the blade points. Normalised on load, so these can be eyeballed. */
  dir: [number, number, number];
  /**
   * Twist about the blade axis, in degrees. A plain scalar rather than part of
   * `dir` so a flourish can wind past 360° — slerp would take the short way
   * round and swallow the spin whole.
   */
  roll: number;
  /** Where the point named by `focus` sits in world space. */
  centre: [number, number, number];
  scale: number;
  /**
   * Which point along the blade `centre` positions, measured from the hand.
   * Defaults to the balance point, which is what keeps a swinging sword inside
   * the frame; the opening pan slides it from pommel to tip to travel the
   * length of the blade.
   */
  focus?: number;
  /** Easing used to travel *into* this pose. */
  ease?: Ease;
};

/**
 * The performance, in scroll order:
 *
 *  0.00 – 0.23  a close dolly along the blade, pommel to tip
 *  0.23 – 0.40  pull back to the whole sword, then stand it up
 *  0.40 – 0.66  three snap cuts — down-left, down-right, flat — leaving an X
 *  0.66 – 0.78  the blade goes flat and spins a full turn, drawing a disc
 *  0.78 – 0.87  coil back and drive the tip at the lens
 *  0.87 – 1.00  whip overhead and slam it down, tip first
 *
 * Cuts land on short segments with `easeOutExpo` so the tip crosses its arc in
 * a handful of frames: that speed is what the trail, the flare and the camera
 * kick all read as impact.
 */
const SWORD: Pose[] = [
  // ── The blade, end to end ───────────────────────────────────────────────
  { t: 0.0, dir: [1, 0.1, 0.05], roll: -8, centre: [0, -0.05, 0], scale: 5, focus: POMMEL },
  {
    t: 0.075,
    dir: [1, 0.1, 0.05],
    roll: 2,
    centre: [0, -0.05, 0],
    scale: 5,
    focus: 0.35,
    ease: easeInOutSine,
  },
  {
    t: 0.15,
    dir: [1, 0.1, 0.05],
    roll: 12,
    centre: [0, -0.05, 0],
    scale: 5,
    focus: 0.95,
    ease: linear,
  },
  {
    t: 0.225,
    dir: [1, 0.09, 0.05],
    roll: 24,
    centre: [0, -0.04, 0],
    scale: 5,
    focus: 1.72,
    ease: linear,
  },

  // ── Whole, then stood up ────────────────────────────────────────────────
  {
    t: 0.31,
    dir: [1, 0.09, 0.04],
    roll: 20,
    centre: [0, -0.02, 0],
    scale: 1.32,
    ease: easeInOutCubic,
  },
  {
    t: 0.4,
    dir: [0.06, 1, 0.02],
    roll: 190,
    centre: [0, 0.02, 0],
    scale: 1.0,
    ease: easeInOutSine,
  },

  // ── Three cuts ──────────────────────────────────────────────────────────
  { t: 0.445, dir: [0.42, 0.88, -0.2], roll: 200, centre: [0.3, 0.2, 0], scale: 1.0 },
  {
    t: 0.487,
    dir: [-0.58, -0.78, 0.22],
    roll: 214,
    centre: [-0.3, -0.12, 0.08],
    scale: 1.0,
    ease: easeOutExpo,
  },
  {
    t: 0.525,
    dir: [-0.5, 0.85, -0.18],
    roll: 320,
    centre: [-0.3, 0.2, 0],
    scale: 1.0,
    ease: easeInOutSine,
  },
  {
    t: 0.567,
    dir: [0.62, -0.75, 0.2],
    roll: 336,
    centre: [0.3, -0.12, 0.08],
    scale: 1.0,
    ease: easeOutExpo,
  },
  {
    t: 0.605,
    dir: [0.96, 0.2, -0.18],
    roll: 430,
    centre: [0.52, 0.06, 0],
    scale: 1.0,
    ease: easeInOutCubic,
  },
  {
    t: 0.647,
    dir: [-0.98, 0.06, 0.16],
    roll: 448,
    centre: [-0.5, 0.02, 0.08],
    scale: 1.0,
    ease: easeOutExpo,
  },

  // ── A full flat turn: four quarter keys, because a direction slerp always
  //    takes the short arc and would otherwise unwind the spin ─────────────
  {
    t: 0.675,
    dir: [1, 0.06, 0.02],
    roll: 470,
    centre: [0, 0.04, 0],
    scale: 1.05,
    ease: easeInCubic,
  },
  { t: 0.702, dir: [0.02, 0.06, -1], roll: 560, centre: [0, 0.04, 0], scale: 1.05, ease: linear },
  { t: 0.729, dir: [-1, 0.06, -0.02], roll: 650, centre: [0, 0.04, 0], scale: 1.05, ease: linear },
  { t: 0.756, dir: [-0.02, 0.06, 1], roll: 740, centre: [0, 0.04, 0], scale: 1.05, ease: linear },
  {
    t: 0.783,
    dir: [1, 0.06, 0.02],
    roll: 830,
    centre: [0, 0.04, 0],
    scale: 1.05,
    ease: easeOutCubic,
  },

  // ── Coil, then drive it at the lens ─────────────────────────────────────
  {
    t: 0.815,
    dir: [0.12, 0.26, -0.96],
    roll: 860,
    centre: [0.24, 0.04, -0.55],
    scale: 1.0,
    ease: easeInOutCubic,
  },
  {
    t: 0.857,
    dir: [0.02, 0.06, 1],
    roll: 872,
    centre: [0, -0.06, 3.0],
    scale: 1.0,
    ease: easeOutExpo,
  },

  // ── Whip overhead and slam, tip first ───────────────────────────────────
  {
    t: 0.9,
    dir: [0.18, 0.94, 0.28],
    roll: 1080,
    centre: [0.12, 0.12, 0],
    scale: 1.0,
    ease: easeOutCubic,
  },
  {
    t: 0.95,
    dir: [0.05, 1, 0.02],
    roll: 1160,
    centre: [0, 0.3, 0],
    scale: 1.05,
    ease: easeInOutSine,
  },
  {
    t: 0.986,
    dir: [0.06, -1, 0.04],
    roll: 1190,
    centre: [0, -0.12, 0],
    scale: 1.1,
    ease: easeOutExpo,
  },
  {
    t: 1.0,
    dir: [0.02, -1, 0.02],
    roll: 1192,
    centre: [0, -0.08, 0],
    scale: 1.1,
    ease: easeOutCubic,
  },
];

type Shot = {
  t: number;
  /** Degrees around the sword. 0 looks straight down -Z at it. */
  azimuth: number;
  /** Degrees above the sword; negative looks up at it. */
  elevation: number;
  /** Horizon tilt, in degrees. */
  roll: number;
  /** Height of the point the camera aims at. */
  height: number;
  ease?: Ease;
};

/**
 * The camera's own track. It only orbits — the radius is fixed, so the frame
 * stays predictable enough to solve a scale for, and every zoom in the piece
 * is the sword growing rather than the lens moving.
 */
const CAMERA: Shot[] = [
  { t: 0.0, azimuth: 0, elevation: 0, roll: 0, height: 0 },
  { t: 0.23, azimuth: -8, elevation: 3, roll: -2, height: 0, ease: linear },
  { t: 0.31, azimuth: -16, elevation: 5, roll: -3, height: 0, ease: easeInOutCubic },
  { t: 0.4, azimuth: -26, elevation: 11, roll: -4, height: 0.1, ease: easeInOutSine },
  { t: 0.487, azimuth: -12, elevation: 5, roll: 3, height: 0.05, ease: easeInOutCubic },
  { t: 0.567, azimuth: 12, elevation: 4, roll: -3, height: 0.05, ease: easeInOutCubic },
  { t: 0.647, azimuth: 24, elevation: 8, roll: 4, height: 0.05, ease: easeInOutCubic },
  { t: 0.729, azimuth: 46, elevation: 28, roll: 8, height: 0, ease: easeInOutSine },
  { t: 0.815, azimuth: 10, elevation: 8, roll: 2, height: 0, ease: easeInOutCubic },
  { t: 0.857, azimuth: 0, elevation: 1, roll: 0, height: -0.05, ease: easeOutCubic },
  { t: 0.95, azimuth: -20, elevation: 6, roll: -3, height: 0.08, ease: easeInOutCubic },
  { t: 0.986, azimuth: -10, elevation: -7, roll: -1, height: -0.05, ease: easeOutExpo },
  { t: 1.0, azimuth: -7, elevation: -6, roll: 0, height: -0.04, ease: easeOutCubic },
];

/**
 * The moments that hit, and how they read on screen. Every impact effect —
 * slash marks, the camera kick, the shockwave, the ember burst — is derived
 * from this list and the current scroll offset, so scrubbing backwards undoes
 * them exactly instead of leaving light hanging in the frame.
 */
export const IMPACTS = [
  { t: 0.487, kind: 'cut', angle: -52 },
  { t: 0.567, kind: 'cut', angle: 52 },
  { t: 0.647, kind: 'cut', angle: 4 },
  { t: 0.857, kind: 'thrust', angle: 0 },
  { t: 0.986, kind: 'slam', angle: 0 },
] as const;

export const SLAM_T = 0.986;
/** Scroll distance an impact's afterglow lasts. */
export const IMPACT_FADE = 0.05;

/** 1 at the instant of an impact, falling to 0 over `fade` of scroll. */
export function impactPulse(offset: number, t: number, fade = IMPACT_FADE) {
  const age = (offset - t) / fade;
  if (age < 0 || age > 1) return 0;
  return (1 - age) * (1 - age);
}

const track = SWORD.map((pose) => {
  const dir = new THREE.Vector3(...pose.dir).normalize();
  return {
    ...pose,
    dir,
    quaternion: new THREE.Quaternion().setFromUnitVectors(BLADE_AXIS, dir),
    centre: new THREE.Vector3(...pose.centre),
    roll: THREE.MathUtils.degToRad(pose.roll),
    focus: pose.focus ?? BLADE_CENTRE,
    ease: pose.ease ?? easeInOutCubic,
  };
});

const shots = CAMERA.map((shot) => ({
  ...shot,
  azimuth: THREE.MathUtils.degToRad(shot.azimuth),
  elevation: THREE.MathUtils.degToRad(shot.elevation),
  roll: THREE.MathUtils.degToRad(shot.roll),
  ease: shot.ease ?? easeInOutCubic,
}));

function segment<T extends { t: number }>(keys: T[], t: number) {
  let i = keys.length - 2;
  while (i > 0 && t < keys[i].t) i--;
  const a = keys[i];
  const b = keys[i + 1];
  const span = b.t - a.t;
  return { a, b, u: span > 0 ? THREE.MathUtils.clamp((t - a.t) / span, 0, 1) : 1 };
}

export type SwordPose = {
  /** Hand position — the rig's own origin. */
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  /** Unit vector the blade points along, in world space. */
  direction: THREE.Vector3;
  scale: number;
};

export function createSwordPose(): SwordPose {
  return {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    direction: new THREE.Vector3(0, 1, 0),
    scale: 1,
  };
}

const twist = new THREE.Quaternion();

/** Samples the sword track. Writes into `out` to stay allocation-free. */
export function evaluateSword(offset: number, out: SwordPose): SwordPose {
  const { a, b, u: raw } = segment(track, THREE.MathUtils.clamp(offset, 0, 1));
  const u = b.ease(raw);

  out.scale = THREE.MathUtils.lerp(a.scale, b.scale, u);

  // Direction takes the short arc — no swing needs the long way round — while
  // the roll is applied afterwards about the blade's own axis, so it can wind
  // through several turns without the slerp cancelling it out.
  out.quaternion.slerpQuaternions(a.quaternion, b.quaternion, u);
  twist.setFromAxisAngle(BLADE_AXIS, THREE.MathUtils.lerp(a.roll, b.roll, u));
  out.quaternion.multiply(twist);
  out.direction.copy(BLADE_AXIS).applyQuaternion(out.quaternion);

  // Poses name where a point *along the blade* sits, so the hand is derived —
  // that is what lets a cut pivot near the balance point and stay in frame.
  const focus = THREE.MathUtils.lerp(a.focus, b.focus, u);
  out.position
    .copy(out.direction)
    .multiplyScalar(-focus * out.scale)
    .addScaledVector(a.centre, 1 - u)
    .addScaledVector(b.centre, u);

  return out;
}

export type CameraShot = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  roll: number;
};

export function createShot(): CameraShot {
  return { position: new THREE.Vector3(), target: new THREE.Vector3(), roll: 0 };
}

/** Samples the camera track. */
export function evaluateShot(offset: number, out: CameraShot): CameraShot {
  const { a, b, u: raw } = segment(shots, THREE.MathUtils.clamp(offset, 0, 1));
  const u = b.ease(raw);

  const azimuth = THREE.MathUtils.lerp(a.azimuth, b.azimuth, u);
  const elevation = THREE.MathUtils.lerp(a.elevation, b.elevation, u);
  const height = THREE.MathUtils.lerp(a.height, b.height, u);
  out.roll = THREE.MathUtils.lerp(a.roll, b.roll, u);

  out.target.set(0, height, 0);
  out.position.set(
    CAMERA_DISTANCE * Math.cos(elevation) * Math.sin(azimuth),
    height + CAMERA_DISTANCE * Math.sin(elevation),
    CAMERA_DISTANCE * Math.cos(elevation) * Math.cos(azimuth)
  );

  return out;
}

/**
 * How far the performance reaches on screen, measured rather than guessed.
 *
 * Poses and camera moves are authored in loose units, so instead of hand-fitting
 * them to one window shape the two tracks are sampled together at load — every
 * blade end pushed through that frame's view — and the rig then scales itself by
 * how the real viewport compares. The piece fills a wide window and still fits a
 * narrow one, with no swing wandering out of shot.
 */
function measureReach() {
  const pose = createSwordPose();
  const shot = createShot();
  const end = new THREE.Vector3();
  const view = new THREE.Matrix4();
  const orientation = new THREE.Quaternion();

  let x = 0;
  let y = 0;

  // The opening dolly is meant to overflow the frame, so it is left out.
  const from = 0.3;
  for (let i = 0; i <= 400; i++) {
    const t = from + (1 - from) * (i / 400);
    evaluateSword(t, pose);
    evaluateShot(t, shot);

    view.lookAt(shot.position, shot.target, UP);
    orientation.setFromRotationMatrix(view);
    view.makeRotationFromQuaternion(orientation).setPosition(shot.position).invert();

    for (const along of [POMMEL, BLADE_TIP]) {
      end
        .copy(pose.direction)
        .multiplyScalar(along * pose.scale)
        .add(pose.position)
        .applyMatrix4(view);

      // Undo the camera roll, then weigh the point by how much being nearer the
      // lens magnifies it — which is what makes the thrust the widest instant.
      const cos = Math.cos(-shot.roll);
      const sin = Math.sin(-shot.roll);
      const rx = end.x * cos - end.y * sin;
      const ry = end.x * sin + end.y * cos;
      const magnify = CAMERA_DISTANCE / Math.max(-end.z, 0.1);

      x = Math.max(x, Math.abs(rx) * magnify);
      y = Math.max(y, Math.abs(ry) * magnify);
    }
  }

  return { x, y };
}

let reach: { x: number; y: number } | null = null;

/** Breathing room kept around the widest moment. */
const SAFE_AREA = 0.94;
/**
 * How much of the sideways reach may cross the frame edge. The widest instant
 * is the tip at the far end of one flat sweep; letting it leave for a fraction
 * of a second buys a much larger sword everywhere else, which matters most in
 * the narrow windows where this binds.
 */
const SIDEWAYS_SLACK = 0.82;

/**
 * One number the whole scene scales by: positions, sizes and effects alike.
 * Every consumer derives it from the viewport so they cannot disagree.
 */
export function fitToViewport(width: number, height: number) {
  reach ??= measureReach();
  return Math.min(
    (height * 0.5 * SAFE_AREA) / reach.y,
    (width * 0.5 * SAFE_AREA) / (reach.x * SIDEWAYS_SLACK)
  );
}

/** Captions for the HUD — `until` is the scroll offset the beat ends at. */
export const MOVES = [
  { until: 0.29, jp: '刃', label: 'The blade — hilt to tip' },
  { until: 0.41, jp: '覚醒', label: 'Awaken' },
  { until: 0.51, jp: '一の太刀', label: 'First cut' },
  { until: 0.59, jp: '二の太刀', label: 'Second cut' },
  { until: 0.665, jp: '三の太刀', label: 'Third cut' },
  { until: 0.795, jp: '螺旋', label: 'Spiral' },
  { until: 0.875, jp: '突き', label: 'Thrust' },
  { until: 1.01, jp: '断', label: 'Slam' },
] as const;

export function moveIndexAt(offset: number): number {
  const i = MOVES.findIndex((m) => offset < m.until);
  return i === -1 ? MOVES.length - 1 : i;
}
