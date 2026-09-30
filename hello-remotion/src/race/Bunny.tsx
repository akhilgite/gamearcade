import React from "react";

export type BunnyState = "idle" | "run" | "sleep" | "shocked" | "sad";

const OUTLINE = "#4a3b35";
const FUR = "#f6f1ea";
const PINK = "#f4a6b5";

const Zzz: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 20) % 60) / 60;
      return (
        <text
          key={i}
          x={120 + t * 60}
          y={-110 - t * 120}
          fontSize={34 + t * 34}
          fontWeight={800}
          fill="#ffffff"
          stroke={OUTLINE}
          strokeWidth={2}
          opacity={1 - t}
        >
          Z
        </text>
      );
    })}
  </>
);

// Origin is the point on the ground under the bunny's body. Faces right.
export const Bunny: React.FC<{ frame: number; state: BunnyState }> = ({
  frame,
  state,
}) => {
  if (state === "sleep") {
    const breathe = 1 + Math.sin(frame * 0.08) * 0.03;
    return (
      <g>
        <ellipse cx={10} cy={4} rx={130} ry={14} fill="rgba(0,0,0,0.18)" />
        <circle cx={-88} cy={-42} r={22} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        <g transform={`scale(1 ${breathe})`}>
          <ellipse cx={0} cy={-48} rx={95} ry={48} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        </g>
        {/* Ears flopped back over the body */}
        <g transform="rotate(-75 70 -80)">
          <ellipse cx={70} cy={-135} rx={16} ry={55} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
          <ellipse cx={70} cy={-135} rx={7} ry={40} fill={PINK} />
        </g>
        <circle cx={88} cy={-46} r={46} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        {/* Closed eye */}
        <path d="M 92 -52 q 12 10 24 0" fill="none" stroke={OUTLINE} strokeWidth={5} strokeLinecap="round" />
        <circle cx={132} cy={-40} r={6} fill={PINK} stroke={OUTLINE} strokeWidth={3} />
        <circle cx={108} cy={-28} r={10} fill={PINK} opacity={0.5} />
        <Zzz frame={frame} />
      </g>
    );
  }

  const running = state === "run";
  const phase = frame * 0.45;
  const hop = running ? Math.abs(Math.sin(phase)) : 0;

  let y = -hop * 70;
  let tilt = running ? Math.cos(phase) * -10 : 0;
  let earAngle = Math.sin(frame * 0.08) * 4;
  let legAngle = running ? Math.sin(phase) * 40 : 0;
  let eyeR = 8;
  let breathe = 1 + Math.sin(frame * 0.1) * 0.015;

  if (running) {
    earAngle = -38 + Math.cos(phase) * 8;
  } else if (state === "shocked") {
    y = -30;
    earAngle = 0;
    eyeR = 12;
  } else if (state === "sad") {
    earAngle = -65;
    tilt = 8;
    breathe = 1 + Math.sin(frame * 0.6) * 0.04; // panting
  }

  return (
    <g>
      <ellipse cx={5} cy={4} rx={95 - hop * 35} ry={13 - hop * 5} fill="rgba(0,0,0,0.18)" />
      {running && (
        <g stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.75}>
          <line x1={-230} y1={-120} x2={-130} y2={-120} />
          <line x1={-260} y1={-80} x2={-140} y2={-80} />
          <line x1={-220} y1={-40} x2={-135} y2={-40} />
        </g>
      )}
      <g transform={`translate(0 ${y}) rotate(${tilt} 0 -75)`}>
        <circle cx={-80} cy={-72} r={22} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        {/* Back leg */}
        <g transform={`rotate(${legAngle} -35 -45)`}>
          <ellipse cx={-38} cy={-22} rx={46} ry={21} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        </g>
        <g transform={`scale(1 ${breathe})`}>
          <ellipse cx={0} cy={-78} rx={86} ry={60} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        </g>
        {/* Front leg */}
        <g transform={`rotate(${-legAngle} 50 -50)`}>
          <ellipse cx={52} cy={-20} rx={14} ry={28} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        </g>
        {/* Ears */}
        <g transform={`rotate(${earAngle - 8} 60 -180)`}>
          <ellipse cx={60} cy={-235} rx={16} ry={56} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
          <ellipse cx={60} cy={-235} rx={7} ry={40} fill={PINK} />
        </g>
        <g transform={`rotate(${earAngle + 8} 82 -182)`}>
          <ellipse cx={82} cy={-237} rx={16} ry={56} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
          <ellipse cx={82} cy={-237} rx={7} ry={40} fill={PINK} />
        </g>
        {/* Head */}
        <circle cx={72} cy={-142} r={50} fill={FUR} stroke={OUTLINE} strokeWidth={5} />
        <circle cx={92} cy={-150} r={eyeR} fill={OUTLINE} />
        <circle cx={95} cy={-153} r={eyeR * 0.35} fill="#ffffff" />
        <circle cx={120} cy={-136} r={6} fill={PINK} stroke={OUTLINE} strokeWidth={3} />
        <circle cx={96} cy={-122} r={10} fill={PINK} opacity={0.5} />
        {state === "sad" ? (
          <>
            <path d="M 100 -108 q 9 -9 18 0" fill="none" stroke={OUTLINE} strokeWidth={4} strokeLinecap="round" />
            <path d="M 50 -185 q -10 16 0 22 q 10 -6 0 -22" fill="#8fd3ff" stroke={OUTLINE} strokeWidth={3} />
          </>
        ) : state === "shocked" ? (
          <ellipse cx={110} cy={-112} rx={7} ry={10} fill={OUTLINE} />
        ) : (
          <path d="M 100 -116 q 9 9 18 0" fill="none" stroke={OUTLINE} strokeWidth={4} strokeLinecap="round" />
        )}
      </g>
      {state === "shocked" && (
        <text x={60} y={-340} fontSize={110} fontWeight={900} fill="#ff4d4d" stroke="#ffffff" strokeWidth={4}>
          !
        </text>
      )}
    </g>
  );
};
