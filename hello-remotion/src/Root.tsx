import { Composition } from "remotion";
import { HelloVideo } from "./HelloVideo";
import { Race, RACE_DURATION } from "./race/Race";

export const RemotionRoot = () => (
  <>
    <Composition
      id="HelloVideo"
      component={HelloVideo}
      durationInFrames={90} // 90 frames at 30 fps = 3 seconds
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="RaceVideo"
      component={Race}
      durationInFrames={RACE_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
