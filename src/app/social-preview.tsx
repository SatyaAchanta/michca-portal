/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageAlt = "MichCA - Michigan Cricket Association";
export const socialImageContentType = "image/png";

async function getLogoDataUrl() {
  const logoPath = path.join(process.cwd(), "public", "michca.png");
  const logoBuffer = await readFile(logoPath);

  return `data:image/png;base64,${logoBuffer.toString("base64")}`;
}

export async function createSocialPreviewImage() {
  const logoUrl = await getLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #f6fbff 0%, #eef7ff 46%, #fff6ea 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at top right, rgba(14,165,233,0.18), transparent 32%), radial-gradient(circle at bottom left, rgba(245,158,11,0.18), transparent 34%)",
          }}
        />
        <div
          style={{
            margin: 36,
            padding: "34px 42px",
            borderRadius: 36,
            border: "2px solid rgba(15, 23, 42, 0.08)",
            background: "rgba(255, 255, 255, 0.88)",
            boxShadow: "0 18px 60px rgba(15, 23, 42, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            width: "calc(100% - 72px)",
            height: "calc(100% - 72px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 18,
              maxWidth: 640,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#0369a1",
              }}
            >
              Official Website
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 72,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                MichCA
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Michigan Cricket Association
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.4,
                color: "#475569",
                maxWidth: 620,
              }}
            >
              League schedules, teams, grounds, waivers, umpiring, and official
              MichCA updates across Michigan.
            </div>
          </div>

          <div
            style={{
              width: 340,
              height: 340,
              borderRadius: 32,
              background: "linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)",
              border: "2px solid rgba(14, 116, 144, 0.12)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 28,
            }}
          >
            <img
              alt="MichCA logo"
              src={logoUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...socialImageSize,
    },
  );
}
