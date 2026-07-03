import { db } from "@/db";
import { backgroundsTable } from "@/db/schemas/configs/backgrounds";
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

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

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
  "video/webm": [[0x1a, 0x45, 0xdf, 0xa3]],
};

function validateMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  if (mimeType === "video/mp4") {
    const ftyp = [0x66, 0x74, 0x79, 0x70];
    return ftyp.every((byte, i) => buffer[4 + i] === byte);
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

  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Background";

    if (!file) throw new JuryError("No file provided", 400);
    if (!ALLOWED_TYPES.includes(file.type))
      throw new JuryError("Invalid file type", 400);

    const fileTypeEnum = file.type.startsWith("video/") ? "video" : "image";

    if (fileTypeEnum === "video" && file.size > 50 * 1024 * 1024)
      throw new JuryError("Video file too large (max 50MB)", 400);
    if (fileTypeEnum === "image" && file.size > 50 * 1024 * 1024)
      throw new JuryError("Image file too large (max 50MB)", 400);

    const headerBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!validateMagicBytes(headerBytes, file.type))
      throw new JuryError("File content does not match declared type", 400);

    const existingBackgrounds = await db
      .select()
      .from(backgroundsTable)
      .where(eq(backgroundsTable.userId, session.userId));
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));
    if (!user) throw new JuryError("User not found", 404);
    // premum = nigga got 3 uploads no premium nigga got 1 upload 3:
    if (existingBackgrounds.length >= (user.premium ? 3 : 1)) {
      throw new JuryError(
        user.premium
          ? "Upload limit reached (max 3 for premium)"
          : "Upload limit reached (max 1 for free). Upgrade to premium for more.",
        403,
      );
    }
    const position =
      existingBackgrounds.length > 0
        ? Math.max(...existingBackgrounds.map((b) => b.position)) + 1
        : 0;

    const key = `backgrounds/${session.userId}/${generateRandomFileName(file.name)}`;
    let buffer: any = Buffer.from(await file.arrayBuffer());
    let contentType = file.type;

    if (fileTypeEnum === "image" && file.size > 2 * 1024 * 1024) {
      try {
        const sharp = (await import("sharp")).default;
        buffer = await sharp(buffer)
          .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        contentType = "image/webp";
      } catch (err) {
        console.error("Failed to compress background image", err);
      }
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
      }),
    );

    const url = `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`;

    const [newBackground] = await db
      .insert(backgroundsTable)
      .values({
        userId: session.userId,
        title,
        position,
        background_url: url,
        file_type: fileTypeEnum,
      })
      .returning();

    return NextResponse.json(
      {
        id: newBackground.id,
        title: newBackground.title,
        url: newBackground.background_url,
        file_type: newBackground.file_type,
        position: newBackground.position,
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
    const backgroundId = searchParams.get("id");
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);
    if (!backgroundId) {
      throw new JuryError("Background ID is required", /*<- dumbass */ 404);
    }
    const [background] = await db
      .select()
      .from(backgroundsTable)
      .where(eq(backgroundsTable.id, backgroundId));
    if (!background) throw new JuryError("Background not found", 404);
    if (background.userId !== session.userId)
      throw new JuryError("You do not have permission to delete this.", 400);
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: background.background_url.replace(
          `${process.env.CLOUDFLARE_PUBLIC_URL}/`,
          "",
        ),
      }),
    );
    await db
      .delete(backgroundsTable)
      .where(eq(backgroundsTable.id, backgroundId));
    // RESPECT +100... real niggga (god im so unfunny)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
