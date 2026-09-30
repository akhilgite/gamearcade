import React from "react";

export type TortoiseState = "idle" | "walk" | "celebrate";

const OUTLINE = "#33412f";
const SKIN = "#9ad27f";
const SKIN_DARK = "#7fb868";
const SHELL = "#4f9d5d";
const SHELL_DARK = "#3c7f4a";

const Leg: React.FC<{ x: number; angle: number; fill: string }> = ({
  x,
  angle,
  fill,
}) => (
  <g transform={`rotate(${angle} ${x} -50)`}>
    <rect x={x - 18} y={-55} width={36} height={56} rx={14} fill={fill} stroke={OUTLINE} strokeWidth={5} />
  </g>
);

// Origin is the point on the ground under the tortoise's shell. Faces right.
export const Tortoise: React.FC<{ frame: number; state: TortoiseState }> = ({
  frame,
  state,
}) => {
  const walking = state === "walk";
  const phase = frame * 0.3;
  const swing = walking ? Math.sin(phase) * 22 : 0;
  const jump = state === "celebrate" ? Math.abs(Math.sin(frame * 0.25)) : 0;
  const y = walking ? -Math.abs(Math.sin(phase)) * 4 : -jump * 45;
  const headBob = walking ? Math.sin(phase * 2) * 5 : Math.sin(frame * 0.08) * 2;

  return (
    <g>
      <ellipse cx={10} cy={4} rx={150 - jump * 40} ry={14 - jump * 5} fill="rgba(0,0,0,0.18)" />
      <g transform={`translate(0 ${y})`}>
        {/* Far-side legs */}
        <Leg x={-60} angle={-swing} fill={SKIN_DARK} />
        <Leg x={70} angle={swing} fill={SKIN_DARK} />
        <path d="M -112 -62 l -34 14 l 34 8 z" fill={SKIN} stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        {/* Neck and head */}
        <g transform={`translate(${headBob} 0)`}>
          <path d="M 95 -60 L 140 -100 L 170 -80 L 115 -45 Z" fill={SKIN} stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={165} cy={-108} rx={42} ry={33} fill={SKIN} stroke={OUTLINE} strokeWidth={5} />
          <circle cx={178} cy={-116} r={7} fill={OUTLINE} />
          <circle cx={180} cy={-118} r={2.5} fill="#ffffff" />
          <circle cx={170} cy={-96} r={8} fill="#f4a6b5" opacity={0.6} />
          <path
            d={state === "celebrate" ? "M 180 -98 q 12 16 24 -2 z" : "M 182 -98 q 10 8 20 0"}
            fill={state === "celebrate" ? "#7a2e2e" : "none"}
            stroke={OUTLINE}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        {/* Shell */}
        <path d="M -120 -50 Q -115 -175 0 -178 Q 115 -175 120 -50 Z" fill={SHELL} stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <g fill="none" stroke={SHELL_DARK} strokeWidth={6} strokeLinecap="round">
          <path d="M -30 -170 L -45 -120 L 0 -95 L 45 -120 L 30 -170" />
          <path d="M -45 -120 L -95 -110" />
          <path d="M 45 -120 L 95 -110" />
          <path d="M 0 -95 L 0 -62" />
        </g>
        <rect x={-126} y={-62} width={252} height={24} rx={12} fill="#e3cd84" stroke={OUTLINE} strokeWidth={5} />
        {/* Near-side legs */}
        <Leg x={-75} angle={swing} fill={SKIN} />
        <Leg x={55} angle={-swing} fill={SKIN} />
      </g>
    </g>
  );
};
