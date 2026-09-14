import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "is-a-coder.in — Free Developer Subdomains & Identity",
    short_name: "is-a-coder.in",
    description:
      "Claim your free, permanent username.is-a-coder.in subdomain. Fast DNS with instant dashboard, custom CNAME/A records, and free SSL.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
