import React from "react";
import { Composition } from "remotion";
import { TJFitReel } from "./TJFitReel";

/**
 * Reel: 1080x1920 (9:16), 30fps, 11s (330 frames).
 * Render: `npm run render` → out/tjfit-reel.mp4
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TJFitReel"
      component={TJFitReel}
      durationInFrames={330}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
