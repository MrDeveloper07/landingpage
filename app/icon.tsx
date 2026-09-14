import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width="32"
          height="32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hair back */}
          <path
            d="M16 26C16 14 23 8 32 8C41 8 48 14 48 26C48 34 45 42 45 42H19C19 42 16 34 16 26Z"
            fill="#B45309"
          />

          {/* Head & Face */}
          <ellipse cx="32" cy="24" rx="11" ry="12" fill="#FBBF24" />

          {/* Hair front strands */}
          <path
            d="M21 20C21 13 26 10 32 10C35 10 39 12 41 15C39 20 34 23 28 23C24 23 22 21 21 20Z"
            fill="#92400E"
          />
          <path
            d="M43 20C43 14 39 11 34 10C39 12 42 16 43 20Z"
            fill="#78350F"
          />

          {/* Shoulders / Body */}
          <path
            d="M18 44C18 39 24 37 32 37C40 37 46 39 46 44V48H18V44Z"
            fill="#64748B"
          />

          {/* Laptop Base */}
          <rect
            x="10"
            y="36"
            width="44"
            height="24"
            rx="4"
            fill="#475569"
            stroke="#334155"
            strokeWidth="1.5"
          />
          {/* Laptop Screen Bezel */}
          <rect
            x="12"
            y="38"
            width="40"
            height="20"
            rx="3"
            fill="#1E293B"
          />

          {/* Glowing Code symbol </> */}
          <path
            d="M24 44L20 48L24 52"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34 43L30 53"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M40 44L44 48L40 52"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
