import { ImageResponse } from "next/og";
import { profile, siteUrl } from "@/lib/data";

/**
 * Social share card. Prerendered at build time, so it also serves as the
 * twitter:image — the card is declared `summary_large_image`, which needs a
 * real 1200x630 image to render as anything other than a bare text link.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#060a12",
          backgroundImage:
            "linear-gradient(135deg, #060a12 0%, #0a1120 52%, #04070d 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 6,
            color: "#5f7191",
          }}
        >
          {siteUrl.replace("https://", "").toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: "#e8eef8",
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 42,
              color: "#22d3ee",
            }}
          >
            {`${profile.role} · ${profile.specialty}`}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 30,
              color: "#9aabc4",
            }}
          >
            {profile.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 132,
              height: 6,
              borderRadius: 999,
              backgroundImage: "linear-gradient(90deg, #22d3ee 0%, #4f7dff 100%)",
            }}
          />
          <div style={{ display: "flex", marginLeft: 24, fontSize: 26, color: "#5f7191" }}>
            {profile.location}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
