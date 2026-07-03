import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/api/data/profiles/getProfile";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

async function getAvatarBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch avatar: ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error("Failed to load avatar, using fallback", err);
    // Standard transparent 1x1 png base64 fallback
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    let { url } = await params;
    
    // Sanitize URL/username to prevent injection and invalid lookups
    url = url.replace(/[^a-zA-Z0-9_-]/g, "");
    
    const profile = await getProfile({ url });

    if (!profile) {
      return new Response("Profile not found", { status: 404 });
    }

    const username = url;
    
    // Default fallback pfp from standard discord asset or static domain asset
    let avatarUrl = profile.config.avatar_url;
    if (!avatarUrl) {
      avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
    }

    // Resolve relative URL if any
    if (avatarUrl.startsWith("/")) {
      const origin = request.nextUrl.origin;
      avatarUrl = `${origin}${avatarUrl}`;
    } else {
      try {
        const parsedUrl = new URL(avatarUrl);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
        }
      } catch {
        avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
      }
    }

    const avatarBase64 = await getAvatarBase64(avatarUrl);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b", // Sleek zinc-950 dark background
            backgroundImage: "radial-gradient(circle at center, #1c1917 0%, #09090b 100%)",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Outer container for profile picture */}
            <div
              style={{
                display: "flex",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                padding: "10px",
                marginBottom: "28px",
                boxShadow: "0 0 40px rgba(255, 255, 255, 0.15)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarBase64}
                alt={username}
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #ffffff",
                }}
              />
            </div>

            {/* Link Text */}
            <div
              style={{
                display: "flex",
                fontSize: "52px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontFamily: "sans-serif",
              }}
            >
              <span style={{ color: "#71717a" }}>jury.lat/</span>
              <span style={{ color: "#ffffff" }}>{username}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Image generation failed", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
