import { db } from "@/db";
import { fontsTable } from "@/db/schemas/configs/fonts";
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
  "font/ttf",
  "font/woff",
  "font/woff2",
  "font/otf",
  "application/x-font-ttf",
  "application/x-font-opentype",
  "application/font-woff",
  "application/font-woff2",
];

const ALLOWED_EXTENSIONS = [
  "ttf",
  "woff",
  "woff2",
  "otf",
];

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

export async function POST(req: NextRequest) {
  try {
    console.log("Font upload API called");
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Custom Font";

    if (!file) throw new JuryError("No file provided", 400);

    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new JuryError("Invalid file type. Only .ttf, .otf, .woff, and .woff2 are allowed.", 400);
    }

    if (file.size > 10 * 1024 * 1024)
      throw new JuryError("Font file too large (max 10MB)", 400);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));
    if (!user) throw new JuryError("User not found", 404);
    
    if (!user.premium) {
      throw new JuryError("Custom fonts are a premium feature.", 403);
    }

    const existingFonts = await db
      .select()
      .from(fontsTable)
      .where(eq(fontsTable.userId, session.userId));

    // Limit fonts per user
    if (existingFonts.length >= 5) {
      throw new JuryError("Upload limit reached (max 5 custom fonts)", 403);
    }

    const position =
      existingFonts.length > 0
        ? Math.max(...existingFonts.map((b) => b.position)) + 1
        : 0;

    const key = `fonts/${session.userId}/${generateRandomFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let contentType = file.type;
    if (!contentType || contentType === "application/octet-stream") {
      if (ext === "ttf") contentType = "font/ttf";
      if (ext === "otf") contentType = "font/otf";
      if (ext === "woff") contentType = "font/woff";
      if (ext === "woff2") contentType = "font/woff2";
    }

    console.log("Uploading font to S3:", key);
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
      }),
    );
    console.log("S3 upload successful:", key);

    const url = `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`;

    const [newFont] = await db
      .insert(fontsTable)
      .values({
        userId: session.userId,
        title,
        position,
        font_url: url,
      })
      .returning();

    return NextResponse.json(
      {
        id: newFont.id,
        title: newFont.title,
        url: newFont.font_url,
        position: newFont.position,
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
    const fontId = searchParams.get("id");
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);
    if (!fontId) {
      throw new JuryError("Font ID is required", 404);
    }
    const [font] = await db
      .select()
      .from(fontsTable)
      .where(eq(fontsTable.id, fontId));
    if (!font) throw new JuryError("Font not found", 404);
    if (font.userId !== session.userId)
      throw new JuryError("You do not have permission to delete this.", 400);
      
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: font.font_url.replace(
          `${process.env.CLOUDFLARE_PUBLIC_URL}/`,
          "",
        ),
      }),
    );
    await db
      .delete(fontsTable)
      .where(eq(fontsTable.id, fontId));
      
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
