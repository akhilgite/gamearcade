import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Bunny, BunnyState } from "./Bunny";
import { Background, Foreground, HEIGHT, WIDTH } from "./Scenery";
import { Tortoise, TortoiseState } from "./Tortoise";

export const RACE_DURATION = 780; // 26 seconds at 30 fps

const FONT = '"Arial Rounded MT Bold", "Helvetica Neue", Helvetica, Arial, sans-serif';
const BUNNY_LANE_Y = 830;
const TORTOISE_LANE_Y = 935;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Story timeline (frames):
//   0–150  title and countdown at the start line
// 150–270  bunny sprints ahead
// 270–580  bunny naps under the tree; tortoise plods past around 440
// 580–600  bunny wakes up
// 600–665  bunny's desperate sprint; tortoise crosses the line at 660
// 665–780  celebration
const bunnyX = (f: number) =>
  interpolate(f, [150, 270, 600, 665], [330, 2950, 2950, 4880], clamp);
const tortoiseX = (f: number) =>
  interpolate(f, [150, 660, 690], [60, 5000, 5200], clamp);
const cameraX = (f: number) =>
  interpolate(
    f,
    [0, 150, 270, 340, 380, 560, 590, 600, 665, 780],
    [760, 760, 3100, 3100, 2488, 4231, 3100, 3100, 4900, 4950],
    clamp,
  );

const bunnyState = (f: number): BunnyState => {
  if (f < 150) return "idle";
  if (f < 270) return "run";
  if (f < 300) return "idle";
  if (f < 580) return "sleep";
  if (f < 600) return "shocked";
  if (f < 665) return "run";
  return "sad";
};

const tortoiseState = (f: number): TortoiseState => {
  if (f < 150) return "idle";
  if (f < 690) return "walk";
  return "celebrate";
};

const Caption: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({
  from,
  to,
  children,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const opacity = interpolate(frame, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
  const lift = interpolate(frame, [from, from + 10], [20, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          color: "#3b2f2f",
          fontSize: 56,
          padding: "22px 48px",
          borderRadius: 999,
          boxShadow: "0 8px 0 rgba(0,0,0,0.15)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Pop: React.FC<{ from: number; to: number; color: string; children: React.ReactNode }> = ({
  from,
  to,
  color,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const scale = spring({ frame: frame - from, fps, config: { damping: 9, mass: 0.5 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 380 }}>
      <div
        style={{
          fontSize: 220,
          color,
          transform: `scale(${scale})`,
          WebkitTextStroke: "10px #ffffff",
          paintOrder: "stroke fill",
          textShadow: "0 12px 0 rgba(0,0,0,0.2)",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame > 88) return null;
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [72, 88], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90, opacity }}>
      <div
        style={{
          transform: `scale(${scale})`,
          background: "rgba(255,255,255,0.94)",
          borderRadius: 40,
          padding: "36px 80px",
          textAlign: "center",
          boxShadow: "0 12px 0 rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontSize: 110, color: "#3b2f2f" }}>The Hare &amp; the Tortoise</div>
        <div style={{ fontSize: 46, color: "#6b8e4e", marginTop: 8 }}>The great race</div>
      </div>
    </AbsoluteFill>
  );
};

const CONFETTI_COLORS = ["#ff5a5a", "#ffd84d", "#4db8ff", "#7be07b", "#c38bff", "#ff9f43"];

const Confetti: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0) return null;
  return (
    <g>
      {Array.from({ length: 110 }).map((_, i) => {
        const x = random(`x${i}`) * WIDTH + Math.sin(t * 0.1 + i) * 30;
        const speed = 7 + random(`s${i}`) * 9;
        const y = -60 - random(`d${i}`) * 700 + t * speed;
        if (y < -40 || y > HEIGHT + 40) return null;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={18}
            height={28}
            rx={4}
            fill={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            transform={`rotate(${t * (6 + random(`r${i}`) * 10) + i * 40} ${x + 9} ${y + 14})`}
          />
        );
      })}
    </g>
  );
};

const Trophy: React.FC<{ x: number; y: number; from: number }> = ({ x, y, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from) return null;
  const scale = spring({ frame: frame - from, fps, config: { damping: 8 } });
  const float = Math.sin(frame * 0.12) * 8;
  return (
    <g transform={`translate(${x} ${y + float}) scale(${scale})`} stroke="#8a6a12" strokeWidth={5} strokeLinejoin="round">
      <path d="M -52 -95 q -42 0 -34 38 q 8 26 40 26" fill="none" strokeWidth={10} stroke="#e0a81c" />
      <path d="M 52 -95 q 42 0 34 38 q -8 26 -40 26" fill="none" strokeWidth={10} stroke="#e0a81c" />
      <path d="M -55 -110 H 55 V -60 Q 55 -5 0 -5 Q -55 -5 -55 -60 Z" fill="#ffd84d" />
      <rect x={-10} y={-5} width={20} height={28} fill="#ffd84d" />
      <rect x={-42} y={22} width={84} height={20} rx={6} fill="#ffd84d" />
      <text x={0} y={-45} textAnchor="middle" fontSize={44} fontWeight={900} fill="#8a6a12" stroke="none">
        1
      </text>
    </g>
  );
};

export const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camX = cameraX(frame);
  const toScreen = (worldX: number) => worldX - camX + WIDTH / 2;
  const bx = toScreen(bunnyX(frame));
  const tx = toScreen(tortoiseX(frame));

  const moralScale = spring({ frame: frame - 705, fps, config: { damping: 11 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, backgroundColor: "#6ec6ff" }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        style={{ fontFamily: FONT }}
      >
        <Background camX={camX} frame={frame} />
        <g transform={`translate(${bx} ${BUNNY_LANE_Y})`}>
          <Bunny frame={frame} state={bunnyState(frame)} />
        </g>
        <g transform={`translate(${tx} ${TORTOISE_LANE_Y})`}>
          <Tortoise frame={frame} state={tortoiseState(frame)} />
        </g>
        <Trophy x={tx + 10} y={TORTOISE_LANE_Y - 300} from={690} />
        <Foreground camX={camX} />
        <Confetti from={665} />
      </svg>

      <Title />
      <Pop from={92} to={112} color="#ff9f43">Ready…</Pop>
      <Pop from={112} to={132} color="#ffd84d">Set…</Pop>
      <Pop from={132} to={168} color="#4cc86a">GO!</Pop>

      <Caption from={185} to={262}>The hare shoots ahead!</Caption>
      <Caption from={275} to={345}>“I’m miles ahead… time for a quick nap.”</Caption>
      <Caption from={395} to={550}>The tortoise just keeps going, step by step.</Caption>
      <Caption from={582} to={655}>Uh-oh!</Caption>

      {frame >= 705 && (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
          <div
            style={{
              transform: `scale(${moralScale})`,
              background: "rgba(255,255,255,0.94)",
              borderRadius: 40,
              padding: "30px 70px",
              fontSize: 84,
              color: "#3b2f2f",
              boxShadow: "0 12px 0 rgba(0,0,0,0.15)",
            }}
          >
            Slow and steady wins the race
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
