import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "is-a-coder.in — Free Developer Subdomains & Identity";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e1b4b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "white",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(129, 140, 248, 0.3)",
            borderRadius: "9999px",
            padding: "8px 24px",
            marginBottom: "24px",
            fontSize: "18px",
            fontWeight: 600,
            color: "#a5b4fc",
          }}
        >
          🚀 100% Free Developer Identity Platform
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "16px",
            background: "linear-gradient(to right, #ffffff, #c7d2fe, #818cf8)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          username.is-a-coder.in
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Claim your free permanent subdomain. Connect CNAME to GitHub Pages &amp; Vercel in seconds with instant SSL.
        </div>

        {/* Feature Tags */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#38bdf8",
            }}
          >
            ⚡ Fast DNS
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#4ade80",
            }}
          >
            🔒 Free TLS 1.3 SSL
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#c084fc",
            }}
          >
            🛠️ Self-Service Dashboard
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
