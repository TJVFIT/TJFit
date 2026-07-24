import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TJFit — Train the body. Teach the system.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#050a16",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 78px",
          width: "100%"
        }}
      >
        <div style={{ alignItems: "center", display: "flex", fontSize: 28, fontWeight: 700, gap: 18 }}>
          <div
            style={{
              alignItems: "center",
              background: "#122758",
              border: "1px solid #3d6fe6",
              borderRadius: 18,
              color: "#a9c4ff",
              display: "flex",
              height: 56,
              justifyContent: "center",
              width: 56
            }}
          >
            T
          </div>
          TJFit
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#86a9ff", fontSize: 18, letterSpacing: 6, textTransform: "uppercase" }}>
            The intelligent fitness system
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -5, lineHeight: 0.95 }}>
            Train the body.
          </div>
          <div style={{ color: "#65708a", fontSize: 84, fontWeight: 700, letterSpacing: -5, lineHeight: 0.95 }}>
            Teach the system.
          </div>
        </div>
        <div style={{ color: "#7e8ca9", display: "flex", fontSize: 20, justifyContent: "space-between" }}>
          <span>Programs / coaching / TJAI</span>
          <span>tjfit.app</span>
        </div>
      </div>
    ),
    size
  );
}
