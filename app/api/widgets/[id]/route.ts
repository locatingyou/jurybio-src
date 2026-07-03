import { db } from "@/db";
import { widgetsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();

    const [widget] = await db
      .update(widgetsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(widgetsTable.id, id), eq(widgetsTable.userId, session.userId)))
      .returning();

    if (!widget) throw new JuryError("Widget not found", 404);

    return NextResponse.json({ widget }, { status: 200 });
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

    await db
      .delete(widgetsTable)
      .where(and(eq(widgetsTable.id, id), eq(widgetsTable.userId, session.userId)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
