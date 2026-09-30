import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const HelloVideo = () => {
  const frame = useCurrentFrame(); // 0, 1, 2, ... 89

  // Over frames 0–30, go from invisible to fully visible
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Over the same frames, move up by 40px
  const translateY = interpolate(frame, [0, 30], [40, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b1020",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: 120,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        Hello, World!
      </h1>
    </AbsoluteFill>
  );
};
