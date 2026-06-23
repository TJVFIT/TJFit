import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ── Brand tokens — mirror the live site (src/components/3d/palette + globals.css) ──
const VIOLET = "#A855F7";
const LAVENDER = "#EDE9FE";
const CREAM = "#F6F3ED";
const BG = "#080809";
const FONT = "'Sora','DM Sans',system-ui,-apple-system,sans-serif";
const EASE = Easing.bezier(0.16, 1, 0.3, 1); // the site's --tj-ease-premium

/** Violet radial bloom that scales + fades — the same "power-on" feel as the intro. */
const Bloom: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const scale = interpolate(s, [0, 1], [0.4, 1.4]);
  const opacity = interpolate(frame - delay, [0, 12, 70], [0, 0.9, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: 1300,
          height: 1300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(124,58,237,0.18) 34%, transparent 68%)",
          transform: `scale(${scale})`,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

/** Rise + fade in with the site's premium easing (mirrors MotionReveal). */
const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return (
    <div style={{ transform: `translateY(${interpolate(p, [0, 1], [64, 0])}px)`, opacity: p, ...style }}>
      {children}
    </div>
  );
};

/** Violet→lavender gradient text — the exact hero tagline treatment. */
const GradientText: React.FC<{ children: React.ReactNode; size: number }> = ({ children, size }) => (
  <span
    style={{
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.06,
      letterSpacing: "-0.03em",
      backgroundImage: `linear-gradient(102deg, #D8CAFF 0%, ${VIOLET} 46%, ${LAVENDER} 100%)`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 0 24px rgba(168,85,247,0.28))",
    }}
  >
    {children}
  </span>
);

const CountUp: React.FC<{ to: number; suffix?: string; delay?: number; label: string }> = ({
  to,
  suffix = "",
  delay = 0,
  label,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(
    interpolate(frame - delay, [0, 30], [0, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 100, color: CREAM }}>
        {v}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.2em",
          color: VIOLET,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const TJFitReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* ambient depth grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.5,
        }}
      />

      {/* Scene 1 — 0–2.4s: the hook */}
      <Sequence durationInFrames={72}>
        <Bloom />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90 }}>
          <Rise delay={6} style={{ textAlign: "center" }}>
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 96,
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
                color: CREAM,
              }}
            >
              This isn't another
              <br />
              fitness app.
            </span>
          </Rise>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 — 2.4–6s: the math */}
      <Sequence from={72} durationInFrames={108}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, gap: 70 }}>
          <Rise style={{ textAlign: "center" }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: "#B8B6C2" }}>
              TJAI computes your plan
            </span>
          </Rise>
          <div style={{ display: "flex", gap: 70 }}>
            <CountUp to={25} delay={10} label="signals" />
            <CountUp to={12} suffix="wk" delay={22} label="program" />
            <CountUp to={10} delay={34} label="languages" />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 — 6–8.7s: the value */}
      <Sequence from={180} durationInFrames={81}>
        <Bloom />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90 }}>
          <Rise delay={6} style={{ textAlign: "center" }}>
            <GradientText size={78}>
              Programs from $10.
              <br />
              AI plans from $8.
            </GradientText>
          </Rise>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 — 8.7–11s: the lockup */}
      <Sequence from={261} durationInFrames={69}>
        <Bloom />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, gap: 30 }}>
          <Rise delay={4} style={{ textAlign: "center" }}>
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 130,
                letterSpacing: "-0.04em",
                color: CREAM,
              }}
            >
              TJFIT
            </span>
          </Rise>
          <Rise delay={18} style={{ textAlign: "center" }}>
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 42,
                letterSpacing: "0.18em",
                color: VIOLET,
              }}
            >
              TJFIT.ORG
            </span>
          </Rise>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
