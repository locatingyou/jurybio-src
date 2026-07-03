import { db } from "@/db";
import { linksTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getColor } from "@/lib/links";

const createSchema = z.object({
  platform: z.string().min(1),
  url: z.string(),
  type: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  color: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  icon: z.string().optional(),
  icon_url: z.string().url().optional(),
  url: z.string().optional(),
  enabled: z.boolean().optional(),
  position: z.number().int().optional(),
  color: z.string().optional(),
});

const reorderSchema = z.object({
  links: z.array(
    z.object({
      id: z.string(),
      position: z.number().int(),
    }),
  ),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const links = await db
      .select()
      .from(linksTable)
      .where(eq(linksTable.userId, session.userId))
      .orderBy(linksTable.position);

    return NextResponse.json({ links }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: linksTable.id })
      .from(linksTable)
      .where(eq(linksTable.userId, session.userId));

    const [link] = await db
      .insert(linksTable)
      .values({
        userId: session.userId,
        icon: parsed.data.platform,
        icon_url: "",
        url: parsed.data.url,
        color: parsed.data.color || getColor(parsed.data.platform),
        enabled: parsed.data.enabled,
        position: existing.length,
      })
      .returning();

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const body = await req.json();

    if (body.links) {
      const parsed = reorderSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      for (const { id, position } of parsed.data.links) {
        await db
          .update(linksTable)
          .set({ position, updatedAt: new Date() })
          .where(
            and(eq(linksTable.id, id), eq(linksTable.userId, session.userId)),
          );
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { id, ...data } = parsed.data;
    const [updated] = await db
      .update(linksTable)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(linksTable.id, id), eq(linksTable.userId, session.userId)))
      .returning();

    if (!updated) throw new JuryError("Link not found", 404);

    return NextResponse.json({ link: updated }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new JuryError("Link ID is required", 400);

    await db
      .delete(linksTable)
      .where(and(eq(linksTable.id, id), eq(linksTable.userId, session.userId)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
