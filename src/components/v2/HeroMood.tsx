/** Original looping line-art scenes. All share a floor at y=190: the foot of L. */
export const HERO_MOODS = ['Sleeping', 'Working', 'Football', 'Gaming'] as const;

function Head({
  x = 0,
  y = 0,
  sleeping = false,
  headphones = false,
}: {
  x?: number;
  y?: number;
  sleeping?: boolean;
  headphones?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-17-8q-4-22 16-24 22 0 21 23l5 12-7 3q-1 15-17 14l-5 9-12-5 4-14q-8-5-5-18Z"
        fill="white"
      />
      <path
        d="M-18 0q-9-9-4-21l-5-5 10-2q1-11 10-8 7-8 14-2 10-4 14 5l6 3-5 13q-11 0-18-9-2 13-12 14l-2 14Z"
        fill="black"
      />
      <path d={sleeping ? 'M2-3q5 4 9 0' : 'M3-5h1m9 0h1'} fill="none" />
      <path d="M8 10q5 3 9-1M-12 0q-5-6-7-1" fill="none" />
      {headphones && (
        <>
          <path d="M-23-5v-10q2-20 20-20 20 0 23 20" fill="none" strokeWidth="5" />
          <rect x="-26" y="-10" width="10" height="20" rx="4" fill="white" />
        </>
      )}
    </g>
  );
}

function Sleeping() {
  return (
    <>
      <g transform="translate(240 0) scale(-1 1)">
        <path d="M15 179q2-10 18-9l29 4 1 15H17Z" fill="white" />
        <g className="mood-breathe">
          <path
            d="M53 176q18-30 53-21l33 12 31-39q8-8 16-2l24 43-13 9-25-29-20 33q-6 8-20 7H64Z"
            fill="white"
          />
          <path
            d="m147 176 27-4 32 9 23 0q8 2 7 9h-40l-44-7M192 172l14-7 10 14-8 7Z"
            fill="black"
          />
          <path d="M61 168q-12-2-22 12l37 4M92 162l-10 18 36 3" fill="none" />
          <g transform="translate(45 154) rotate(-72)">
            <Head sleeping />
          </g>
        </g>
      </g>
      <g fill="black" stroke="none" fontFamily="monospace" fontWeight="700">
        <text className="mood-z mood-z-one" x="182" y="114" fontSize="15">
          z
        </text>
        <text className="mood-z mood-z-two" x="164" y="88" fontSize="20">
          z
        </text>
        <text className="mood-z mood-z-three" x="139" y="63" fontSize="25">
          z
        </text>
      </g>
    </>
  );
}

function Working() {
  return (
    <g transform="translate(240 0) scale(-1 1)">
      <path d="M43 139h52v9H43Zm7 9-4 42m40-42 6 42" fill="white" />
      <path d="m75 130 32 5q9 2 10 15l2 31 13 3v6h-31l-8-36-22-1q-17-5-14-20" fill="white" />
      <path d="m103 181 16-1 13 4v6h-30Z" fill="black" />
      <g className="mood-work-body">
        <path d="M67 77q-19 10-17 39l7 22 40 1-3-48-15-14Z" fill="white" />
        <Head x={76} y={59} />
        <path d="m68 97 7 22 37 1 3-8-27-8-4-15" fill="white" />
        <path className="mood-type" d="m107 114 13-2 11 6-20 3" fill="white" />
        <path d="M62 109v19m6-43 10 5" fill="none" />
      </g>
      <path d="m110 132-5 58h7l5-58Zm81 0 6 58h7l-6-58Z" fill="white" />
      <path d="M104 125h101v7H104Z" fill="white" />
      <path d="m133 120-10-37h57l10 37Z" fill="white" />
      <path d="M131 90h43l7 23h-43Z" fill="black" />
      <path
        className="mood-code"
        d="m146 98-5 3 6 3m17-7 5 3-4 3m-10-6-2 8"
        stroke="white"
        fill="none"
        strokeWidth="1.8"
      />
      <path d="M126 120h67v5h-67Z" fill="black" />
      <path d="M196 110h14v13h-14Zm14 3q10-2 7 5l-7 2" fill="white" />
      <path className="mood-steam" d="M202 103q-5-6 0-11" fill="none" />
    </g>
  );
}

function Football() {
  return (
    <g transform="translate(240 0) scale(-1 1)">
      {/* A planted support leg, then a connected hip → knee → boot chain.
          Both rotations return to zero exactly when the ball meets the toe. */}
      <path d="M99 126h15l-7 26-3 29H93l3-31Z" fill="white" />
      <path d="m95 160 11 1-2 20H93Z" fill="white" />
      <path d="m92 180 12-1 10 6v5H85v-6Z" fill="black" />
      <path d="m92 185 4-3m3 3 4-3" stroke="white" strokeWidth="1.5" />
      <g className="mood-juggle-thigh">
        <g className="mood-juggle-shin">
          <path d="M128 144q-7 2-3 10l24 15 8-9-22-14q-4-3-7-2Z" fill="white" />
          <path d="m139 153 15 8-6 8-15-9Z" fill="white" />
          <path d="m149 161 9-3 10 4 10-1q7 1 7 7l-9 4h-24l-7-6Z" fill="black" />
          <path d="m157 165 4-3m3 4 4-3m-14 6h23" fill="none" stroke="white" strokeWidth="1.5" />
        </g>
        <path d="M116 125q7-6 12 2l9 19q4 9-3 11-6 2-10-6l-11-18Z" fill="white" />
      </g>
      <path
        d="m97 114-3 23 17 2 4-10 7 10 17-4-8-23Z"
        fill="black"
        stroke="white"
        strokeWidth="1.5"
      />
      <g className="mood-football-body">
        <g className="mood-football-arm-back">
          <path d="M87 76q-12 8-21 27l-5 8q-2 5 3 7 4 1 6-4l7-9 18-17Z" fill="white" />
        </g>
        <g className="mood-football-arm-front">
          <path d="m135 79 14 15 7 17q1 6-4 7-4 0-5-5l-8-13-14-11Z" fill="white" />
        </g>
        <path
          d="m97 64-17 12 7 16 8-4-2 32q20 7 42 0l-4-33 9 4 7-13-20-13-14 5Z"
          fill="black"
          stroke="white"
          strokeWidth="1.5"
        />
        <path d="m102 66 11 12 10-12" fill="none" stroke="white" strokeWidth="2" />
        <Head x={112} y={46} />
        {/* Keep the 10 legible after mirroring the player. */}
        <g transform="translate(224 0) scale(-1 1)" fill="none" stroke="white" strokeWidth="3.2">
          <path d="m101 87 5-4v20m-4 0h8" />
          <rect x="115" y="83" width="10" height="20" rx="5" />
        </g>
      </g>
      <g className="mood-ball">
        <circle cx="169" cy="144" r="15" fill="white" />
        <path d="m169 137 7 5-2 8h-9l-3-8Z" fill="black" />
        <path d="m169 129 0 8m14 4-7 1m-2 8 5 6m-14-6-5 6m-6-15 8 1" fill="none" />
      </g>
      <ellipse
        className="mood-ball-shadow"
        cx="169"
        cy="188"
        rx="17"
        ry="2"
        fill="black"
        stroke="none"
        opacity=".25"
      />
    </g>
  );
}

function Gaming() {
  return (
    <g transform="translate(240 0) scale(-1 1)">
      <path d="M36 84q0-14 14-14h16l-1 70H43Z" fill="black" />
      <path d="M44 139h53v9H44Zm27 9v32m-24 8 24-8 25 8m-25-8v10" fill="none" strokeWidth="5" />
      <path d="m65 131 34 5q10 1 12 14l5 28 12 6-1 6h-28l-10-36-24-5" fill="white" />
      <path d="m99 180 17-2 13 6-2 6H98Z" fill="black" />
      <g className="mood-game-body">
        <path d="M59 77q-14 18-10 42l5 19 41 1-6-49-16-14Z" fill="white" />
        <Head x={73} y={61} headphones />
        <path d="m61 98 10 21 31 2 5-9-24-7-7-15" fill="white" />
        <path className="mood-mouse" d="m99 113 13-1 8 7-20 3" fill="white" />
      </g>
      <path d="m109 133-4 57h7l4-57Zm94 0 7 57h7l-7-57Z" fill="white" />
      <path d="M102 126h116v7H102Z" fill="white" />
      <path d="M133 60h76v53h-76Z" fill="white" />
      <path d="M139 66h64v40h-64Z" fill="black" />
      <path d="M164 113h6v8h15v4h-32v-4h11Z" fill="white" />
      <g stroke="white" strokeWidth="2" fill="none">
        <path d="M144 98h54m-27-24v8m-4-4h8" />
        <path className="mood-game-target" d="m181 85 5 6-5 6-5-6Z" />
        <path className="mood-game-ship" d="m152 82-5 9h10Z" fill="white" />
      </g>
      <path d="M121 121h30v4h-30Z" fill="black" />
    </g>
  );
}

const SCENES = [Sleeping, Working, Football, Gaming];
// Trim each scene's unused right margin (including its mirrored geometry).
// A fixed viewport and xMax alignment retain the same character scale/floor.
const SCENE_RIGHT_EDGES = [227, 199, 186, 206];

export function HeroMood({ mood, playing }: { mood: number; playing: boolean }) {
  const Scene = SCENES[mood];
  return (
    <span
      className="hero-mood"
      aria-hidden="true"
      data-playing={playing}
      data-mood={HERO_MOODS[mood]}
    >
      <svg
        key={mood}
        viewBox={`0 0 ${SCENE_RIGHT_EDGES[mood]} 194`}
        width="240"
        height="194"
        preserveAspectRatio="xMaxYMax meet"
        fill="none"
        stroke="black"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hero-mood-scene"
      >
        <Scene />
      </svg>
    </span>
  );
}
