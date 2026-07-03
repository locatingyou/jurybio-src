import { db } from "@/db";
import { sessionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors } from "@/lib/error";
import { and, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const cookie_name = "_jury_session";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { revokeSessionId, revokeAllOtherSessions } = body;

    if (revokeAllOtherSessions) {
      const result = await db
        .delete(sessionsTable)
        .where(
          and(
            eq(sessionsTable.userId, session.userId),
            ne(sessionsTable.id, session.sessionId),
          ),
        )
        .returning({ id: sessionsTable.id });

      return NextResponse.json({ success: true, revokedCount: result.length });
    }

    if (revokeSessionId) {
      const result = await db
        .delete(sessionsTable)
        .where(
          and(
            eq(sessionsTable.userId, session.userId),
            eq(sessionsTable.id, revokeSessionId),
          ),
        )
        .returning({ id: sessionsTable.id });

      if (result.length === 0) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 },
        );
      }

      const revokedCurrent = revokeSessionId === session.sessionId;
      if (revokedCurrent) {
        (await cookies()).delete(cookie_name);
      }

      return NextResponse.json({ success: true, revokedCurrent });
    }

    return NextResponse.json(
      { error: "revokeSessionId or revokeAllOtherSessions is required" },
      { status: 400 },
    );
  } catch (error) {
    return handleServerErrors(error);
  }
}
