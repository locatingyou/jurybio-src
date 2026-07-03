import { db } from "@/db";
import { audiosTable } from "@/db/schemas/configs/audios";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { usersTable } from "@/db/schemas";

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];
const ALLOWED_COVER_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_COVER_SIZE = 10 * 1024 * 1024; // 10MB

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
  "audio/webm": [[0x1a, 0x45, 0xdf, 0xa3]],
  "audio/wav": [[0x52, 0x49, 0x46, 0x46]],
  "audio/ogg": [[0x4f, 0x67, 0x67, 0x53]],
};

function validateMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  if (mimeType === "audio/mpeg") {
    const hasId3 =
      buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;
    const hasFrameSync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
    return hasId3 || hasFrameSync;
  }

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

  if (mimeType === "audio/wav") {
    const wave = [0x57, 0x41, 0x56, 0x45];
    return wave.every((byte, i) => buffer[8 + i] === byte);
  }

  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const coverFile = formData.get("cover") as File | null;
    const title = formData.get("title") as string;
    const lyrics = formData.get("lyrics") as string;
    const artist = formData.get("artist") as string;

    if (!file) throw new JuryError("No file provided", 400);
    if (!ALLOWED_AUDIO_TYPES.includes(file.type))
      throw new JuryError("Invalid file type", 400);
    if (file.size > MAX_AUDIO_SIZE)
      throw new JuryError("File too large (max 50MB)", 400);

    const headerBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!validateMagicBytes(headerBytes, file.type))
      throw new JuryError("File content does not match declared type", 400);

    if (coverFile) {
      if (!ALLOWED_COVER_TYPES.includes(coverFile.type))
        throw new JuryError("Invalid cover art file type", 400);
      if (coverFile.size > MAX_COVER_SIZE)
        throw new JuryError("Cover art too large (max 10MB)", 400);

      const coverHeaderBytes = new Uint8Array(
        await coverFile.slice(0, 12).arrayBuffer(),
      );
      if (!validateMagicBytes(coverHeaderBytes, coverFile.type))
        throw new JuryError(
          "Cover art content does not match declared type",
          400,
        );
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));
    if (!user) throw new JuryError("User not found", 404);

    const existingAudios = await db
      .select()
      .from(audiosTable)
      .where(eq(audiosTable.userId, session.userId));
    if (existingAudios.length >= (user.premium ? 3 : 1)) {
      throw new JuryError(
        user.premium
          ? "Upload limit reached (max 3 for premium)"
          : "Upload limit reached (max 1 for free). Upgrade to premium for more.",
        403,
      );
    }
    const position =
      existingAudios.length > 0
        ? Math.max(...existingAudios.map((a) => a.position)) + 1
        : 0;
    const key = `audios/${session.userId}/${generateRandomFileName(file.name)}`;
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

    let coverUrl: string | null = null;
    if (coverFile) {
      const coverKey = `audios/${session.userId}/covers/${generateRandomFileName(coverFile.name)}`;
      const coverBuffer = await coverFile.arrayBuffer();

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
          Key: coverKey,
          Body: Buffer.from(coverBuffer),
          ContentType: coverFile.type,
          ContentLength: coverFile.size,
        }),
      );

      coverUrl = `${process.env.CLOUDFLARE_PUBLIC_URL}/${coverKey}`;
    }

    const [newAudio] = await db
      .insert(audiosTable)
      .values({
        userId: session.userId,
        title,
        position,
        artist,
        lyrics,
        url,
        cover_url: coverUrl,
      })
      .returning();

    return NextResponse.json(
      {
        id: newAudio.id,
        title: newAudio.title,
        artist: newAudio.artist,
        url: newAudio.url,
        cover_url: newAudio.cover_url,
        position: newAudio.position,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const audioId = searchParams.get("id");
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);
    if (!audioId) throw new JuryError("Audio ID is required", 400);

    const [audio] = await db
      .select()
      .from(audiosTable)
      .where(eq(audiosTable.id, audioId));
    if (!audio) throw new JuryError("Audio not found", 404);
    if (audio.userId !== session.userId)
      throw new JuryError("You do not have permission to delete this.", 403);

    const objectsToDelete = [
      audio.url.replace(`${process.env.CLOUDFLARE_PUBLIC_URL}/`, ""),
    ];
    if (audio.cover_url) {
      objectsToDelete.push(
        audio.cover_url.replace(`${process.env.CLOUDFLARE_PUBLIC_URL}/`, ""),
      );
    }

    await Promise.all(
      objectsToDelete.map((Key) =>
        s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
            Key,
          }),
        ),
      ),
    );

    await db.delete(audiosTable).where(eq(audiosTable.id, audioId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
