import { type MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GameHub",
    short_name: "GameHub",
    description:
      "20 web games including point & click adventures, arcade classics, and creative spell-crafting tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a1a",
    theme_color: "#7b5ea7",
    icons: [
      {
        src: "/icon.svg",
        sizes: "64x64",
        type: "image/svg+xml",
      },
    ],
  };
}