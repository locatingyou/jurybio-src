import { db } from "@/db";
import { badgesTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  icon_color: z.string().optional(),
  name: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const [badge] = await db
      .update(badgesTable)
      .set(parsed.data)
      .where(
        and(eq(badgesTable.id, id), eq(badgesTable.userId, session.userId)),
      )
      .returning();

    if (!badge) throw new JuryError("Badge not found", 404);

    return NextResponse.json({ badge }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const { id } = await params;

    const [badge] = await db
      .select({ id: badgesTable.id })
      .from(badgesTable)
      .where(
        and(eq(badgesTable.id, id), eq(badgesTable.userId, session.userId)),
      )
      .limit(1);

    if (!badge) throw new JuryError("Badge not found", 404);

    await db
      .delete(badgesTable)
      .where(
        and(eq(badgesTable.id, id), eq(badgesTable.userId, session.userId)),
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
