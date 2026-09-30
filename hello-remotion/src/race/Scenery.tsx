import React from "react";

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TRACK_TOP = 760;
export const TRACK_BOTTOM = 950;
export const START_X = 520;
export const FINISH_X = 5000;
export const NAP_TREE_X = 3070;

const TREE_XS = [60, 760, 1350, 1900, 2450, 3700, 4250, 4650, 5500, 5900];

// A hill silhouette that tiles seamlessly every WIDTH pixels.
const hillPath = (base: number, amp: number, waves: number, shift: number) => {
  const pts: string[] = [];
  for (let x = 0; x <= WIDTH; x += 40) {
    const y =
      base -
      amp * (0.5 + 0.5 * Math.sin((2 * Math.PI * waves * x) / WIDTH + shift));
    pts.push(`L ${x} ${y.toFixed(1)}`);
  }
  return `M 0 ${HEIGHT} ${pts.join(" ")} L ${WIDTH} ${HEIGHT} Z`;
};

const Tiled: React.FC<{
  camX: number;
  parallax: number;
  children: React.ReactNode;
}> = ({ camX, parallax, children }) => {
  const offset = -((((camX * parallax) % WIDTH) + WIDTH) % WIDTH);
  return (
    <>
      <g transform={`translate(${offset} 0)`}>{children}</g>
      <g transform={`translate(${offset + WIDTH} 0)`}>{children}</g>
    </>
  );
};

const Cloud: React.FC<{ x: number; y: number; scale: number }> = ({
  x,
  y,
  scale,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff" opacity={0.95}>
    <ellipse cx={0} cy={0} rx={90} ry={38} />
    <ellipse cx={-55} cy={12} rx={60} ry={28} />
    <ellipse cx={60} cy={14} rx={70} ry={30} />
    <ellipse cx={15} cy={-28} rx={55} ry={34} />
  </g>
);

const Tree: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-18} y={-150} width={36} height={155} rx={8} fill="#8a5a3c" stroke="#4a3b35" strokeWidth={5} />
    <g fill="#3f9b4f" stroke="#2c6e39" strokeWidth={5}>
      <circle cx={-60} cy={-180} r={70} />
      <circle cx={60} cy={-180} r={70} />
      <circle cx={0} cy={-250} r={85} />
    </g>
  </g>
);

export const Background: React.FC<{ camX: number; frame: number }> = ({
  camX,
  frame,
}) => {
  const cloudSpan = WIDTH + 600;
  const clouds = [
    { x: 200, y: 150, s: 1.2 },
    { x: 900, y: 240, s: 0.9 },
    { x: 1500, y: 120, s: 1.4 },
    { x: 2200, y: 210, s: 1.0 },
  ];

  return (
    <>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ec6ff" />
          <stop offset="100%" stopColor="#d8f3ff" />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#sky)" />
      <circle cx={1620} cy={170} r={130} fill="#fff3b0" opacity={0.5} />
      <circle cx={1620} cy={170} r={90} fill="#ffd84d" />

      {clouds.map((c, i) => {
        const raw = c.x - camX * 0.06 - frame * 0.4;
        const x = (((raw % cloudSpan) + cloudSpan) % cloudSpan) - 300;
        return <Cloud key={i} x={x} y={c.y} scale={c.s} />;
      })}

      <Tiled camX={camX} parallax={0.15}>
        <path d={hillPath(760, 230, 2, 0.6)} fill="#a9dba0" />
      </Tiled>
      <Tiled camX={camX} parallax={0.35}>
        <path d={hillPath(760, 130, 3, 2.1)} fill="#8fd07e" />
      </Tiled>

      {/* Ground and track */}
      <rect y={700} width={WIDTH} height={HEIGHT - 700} fill="#7ec850" />
      <rect y={TRACK_TOP} width={WIDTH} height={TRACK_BOTTOM - TRACK_TOP} fill="#dbb684" />
      <rect y={TRACK_TOP - 6} width={WIDTH} height={8} fill="#b98f5e" />
      <rect y={TRACK_BOTTOM - 2} width={WIDTH} height={8} fill="#b98f5e" />
      <line
        x1={0}
        x2={WIDTH}
        y1={855}
        y2={855}
        stroke="#ffffff"
        strokeWidth={6}
        strokeDasharray="60 50"
        strokeDashoffset={camX}
        opacity={0.7}
      />

      {/* Everything below is placed in world coordinates */}
      <g transform={`translate(${WIDTH / 2 - camX} 0)`}>
        {TREE_XS.map((x) => (
          <g key={x} transform={`translate(${x} 745)`}>
            <Tree />
          </g>
        ))}
        <g transform={`translate(${NAP_TREE_X} 775)`}>
          <Tree scale={1.7} />
        </g>

        {/* Start line */}
        <rect x={START_X - 6} y={TRACK_TOP} width={12} height={TRACK_BOTTOM - TRACK_TOP} fill="#ffffff" />
        <rect x={START_X - 6} y={560} width={12} height={200} fill="#8a5a3c" />
        <rect x={START_X - 110} y={520} width={220} height={80} rx={12} fill="#ffffff" stroke="#4a3b35" strokeWidth={6} />
        <text x={START_X} y={578} textAnchor="middle" fontSize={52} fontWeight={900} fill="#4a3b35">
          START
        </text>

        {/* Finish line */}
        {Array.from({ length: 16 }).map((_, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const h = (TRACK_BOTTOM - TRACK_TOP) / 8;
          return (
            <rect
              key={i}
              x={FINISH_X - 24 + col * 24}
              y={TRACK_TOP + row * h}
              width={24}
              height={h}
              fill={(col + row) % 2 === 0 ? "#222222" : "#ffffff"}
            />
          );
        })}
        <rect x={FINISH_X - 6} y={470} width={12} height={290} fill="#8a5a3c" />
        <rect x={FINISH_X - 130} y={440} width={260} height={90} rx={12} fill="#ff5a5a" stroke="#4a3b35" strokeWidth={6} />
        <text x={FINISH_X} y={504} textAnchor="middle" fontSize={56} fontWeight={900} fill="#ffffff">
          FINISH
        </text>
      </g>
    </>
  );
};

// Grass tufts in front of the track, moving slightly faster than the world for depth.
export const Foreground: React.FC<{ camX: number }> = ({ camX }) => (
  <Tiled camX={camX} parallax={1.25}>
    {[80, 330, 610, 870, 1150, 1420, 1700].map((x, i) => (
      <g key={x} transform={`translate(${x} ${1010 + (i % 3) * 22})`} fill="#5fae3f">
        <path d="M -30 0 L -18 -46 L -6 0 Z" />
        <path d="M -10 0 L 4 -64 L 16 0 Z" />
        <path d="M 10 0 L 26 -42 L 36 0 Z" />
      </g>
    ))}
  </Tiled>
);
