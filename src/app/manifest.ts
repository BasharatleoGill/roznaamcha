import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// NEXT_PUBLIC_BASE_PATH is injected by GitHub Actions as "/roznaamcha".
// It is empty string in local dev (no basePath configured).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RozNaamcha — Daily Finance Tracker",
    short_name: "RozNaamcha",
    description:
      "A premium calendar-based finance tracker for income, expenses, budgets, and reports.",
    start_url: `${basePath}/dashboard/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#f6f7f4",
    theme_color: "#176b5d",
    orientation: "portrait-primary",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: `${basePath}/icons/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-maskable.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
