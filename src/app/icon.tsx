import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default async function Icon() {
  const markSize = Math.round(size.width * 0.44);
  const radius = Math.round(size.width * 0.25);
  const markRadius = Math.round(markSize / 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3F5F47",
          borderRadius: radius,
        }}
      >
        <div
          style={{
            width: markSize,
            height: markSize,
            borderRadius: markRadius,
            background: "#E3C7A6",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
