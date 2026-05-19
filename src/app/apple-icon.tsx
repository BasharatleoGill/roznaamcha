import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#176b5d",
          color: "#f8fffb",
          fontSize: 118,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
