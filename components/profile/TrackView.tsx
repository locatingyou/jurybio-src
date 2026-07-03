"use client";
import { Turnstile } from "@/components/cloudflare";
import { trackView } from "@/lib/api/data/analytics/trackView";

const DIFFICULTY = 2;

// crypto.randomUUID() only exists in secure contexts (HTTPS/localhost).
// This challenge value doesn't need cryptographic randomness — it's just
// a per-request seed for a small proof-of-work puzzle the server
// re-verifies independently — so a plain Math.random()-based id is fine
// and works everywhere.
function generateChallenge(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

async function solvePoW(challenge: string): Promise<number> {
  if (!crypto.subtle) {
    // crypto.subtle (Web Crypto) requires a secure context — HTTPS or
    // localhost. If this throws, the page is being served over plain
    // HTTP on a non-localhost origin. The server's PoW check requires a
    // real SHA-256 digest, so there's no client-side fallback for this
    // specific piece — it has to be fixed at the deployment/TLS level.
    throw new Error(
      "crypto.subtle unavailable — page must be served over HTTPS (or localhost) for view tracking to work",
    );
  }

  let nonce = 0;
  while (true) {
    const hash = Array.from(
      new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(`${challenge}:${nonce}`),
        ),
      ),
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    console.log(
      "%c[jury] %cmining %cnonce=%s %chash=%s",
      "color:fffff;font-weight:bold",
      "color:#71717a",
      "color:#fffff",
      nonce,
      "color:#fffff",
      hash,
    );
    if (hash.startsWith("0".repeat(DIFFICULTY))) return nonce;
    nonce++;
  }
}

export function TrackView({
  userId,
  device,
}: {
  userId: string;
  device: "mobile" | "desktop";
}) {
  const handleTurnstileSuccess = async (token: string) => {
    try {
      const challenge = generateChallenge();
      const nonce = await solvePoW(challenge);
      await trackView({
        userId,
        cloudflare: Array.from(
          { length: Math.ceil(token.length / 30) },
          (_, i) => token.slice(i * 30, i * 30 + 30),
        ),
        pow: [challenge, nonce],
        device,
      });
    } catch (err) {
      console.error("View tracking failed:", err);
    }
  };
  return (
    <Turnstile
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      options={{ size: "invisible" }}
      onSuccess={handleTurnstileSuccess}
    />
  );
}
