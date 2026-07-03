import { db } from "@/db";
import { configsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function generateRandomFileName(originalFilename: string): string {
  const randomId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const ext = getFileExtension(originalFilename);
  return `${randomId}.${ext}`;
}

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

//thx anthrax
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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new JuryError("No file provided", 400);
    if (!ALLOWED_TYPES.includes(file.type))
      throw new JuryError("Invalid file type", 400);
    if (file.size > MAX_SIZE)
      throw new JuryError("File too large (max 10MB)", 400);
    const headerBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!validateMagicBytes(headerBytes, file.type))
      throw new JuryError("File content does not match declared type", 400);
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
    const key = `avatars/${session.userId}/${generateRandomFileName(file.name)}`;
    const buffer = await file.arrayBuffer();
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: file.type,
        ContentLength: file.size,
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

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

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

    await db
      .update(configsTable)
      .set({ avatar_url: null, updated_at: new Date() })
      .where(eq(configsTable.userId, session.userId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
