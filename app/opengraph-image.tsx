import { ImageResponse } from "next/og";

/**
 * Site-wide Open Graph image.
 *
 * Why: without this file Next declares no `og:image`, so a pasted link shows a
 * bare URL with no thumbnail in WhatsApp, Signal, Telegram, Discord, Slack,
 * LinkedIn or X. Next wires this file convention to `og:image` and
 * `twitter:image` on every page automatically.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "gamehub - GameHub - Next.js portfolio + game platform";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#160a12",
          backgroundImage: "radial-gradient(circle at 18% 16%, #3d1a34 0%, #160a12 60%)",
          padding: "72px",
          color: "#f7f7fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#ff9ad5" }}>
          GAMEHUB
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
            GameHub - Next.js portfolio + game platform
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#b9b9c7" }}>Analyse, outils et projets ouverts.</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#ff9ad5" }}>gamehub.ca</div>
      </div>
    ),
    size,
  );
}
