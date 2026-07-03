import { db } from "@/db";
import { configsTable, connectionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const PRESENCE_DISCORD_API = "http://discord.jury.lat";
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string,
  },
});

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function validateMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  const matches = signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte),
  );
  if (!matches) return false;
  if (mimeType === "image/webp") {
    const webp = [0x57, 0x45, 0x42, 0x50];
    return webp.every((byte, i) => buffer[8 + i] === byte);
  }
  return true;
}

function generateRandomFileName(mimeType: string): string {
  const randomId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const ext = MIME_TO_EXT[mimeType] || "png";
  return `${randomId}.${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const [connection] = await db
      .select({ discordId: connectionsTable.accountId })
      .from(connectionsTable)
      .where(
        and(
          eq(connectionsTable.userId, session.userId),
          eq(connectionsTable.providerType, "discord"),
        ),
      );

    if (!connection || !connection.discordId) {
      throw new JuryError("Discord account is not connected", 400);
    }

    const res = await fetch(`${PRESENCE_DISCORD_API}/${connection.discordId}`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new JuryError("Discord user not found on the server", res.status);
    }

    const discordData = await res.json();
    const avatarUrl = discordData?.user?.avatar;

    if (!avatarUrl) {
      throw new JuryError("Discord user has no avatar", 400);
    }

    const avatarResponse = await fetch(avatarUrl);
    if (!avatarResponse.ok) {
      throw new JuryError("Failed to download Discord avatar", 500);
    }

    const contentType =
      avatarResponse.headers.get("content-type") || "image/png";
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new JuryError("Invalid Discord avatar format", 400);
    }

    const avatarBuffer = new Uint8Array(await avatarResponse.arrayBuffer());
    const headerBytes = avatarBuffer.slice(0, 12);

    if (!validateMagicBytes(headerBytes, contentType)) {
      throw new JuryError("Discord avatar validation failed", 400);
    }

    const [existing] = await db
      .select({ avatar_url: configsTable.avatar_url })
      .from(configsTable)
      .where(eq(configsTable.userId, session.userId));

    if (existing?.avatar_url) {
      const oldKey = new URL(existing.avatar_url).pathname.slice(1);
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
          Key: oldKey,
        }),
      );
    }

    const fileName = generateRandomFileName(contentType);
    const key = `avatars/${session.userId}/${fileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(avatarBuffer),
        ContentType: contentType,
        ContentLength: avatarBuffer.length,
      }),
    );

    const url = `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`;
    await db
      .update(configsTable)
      .set({ avatar_url: url, updated_at: new Date() })
      .where(eq(configsTable.userId, session.userId));

    return new Response(url, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    return handleServerErrors(error);
  }
}
