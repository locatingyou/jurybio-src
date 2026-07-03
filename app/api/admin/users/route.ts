import { db } from "@/db";
import {
  aliasesTable,
  auditLogsTable,
  transactionsTable,
  usersTable,
} from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// yes i couldve named this like users or sum but ion feel like it :skull:
// params should be ?limit=
// ^^^ removed 3:
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);
    // admin check
    const [user] = await db
      .select({
        admin: usersTable.admin,
        superadmin: usersTable.superadmin,
        owner: usersTable.owner,
      })
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));
    if (!user || (!user.admin && !user.superadmin && !user.owner)) {
      throw new JuryError("Forbidden", 403);
    }

    // const { searchParams } = new URL(req.url);
    // const limit = searchParams.get('limit');
    // get all users
    const users = await db
      .select({
        id: usersTable.id,
        uid: usersTable.uid,
        username: usersTable.username,
        email: usersTable.email,
        premium: usersTable.premium,
        premium_since: usersTable.premium_since,
        admin: usersTable.admin,
        superadmin: usersTable.superadmin,
        blacklisted: usersTable.blacklisted,
        blacklisted_reason: usersTable.blacklisted_reason,
        blacklisted_at: usersTable.blacklisted_at,
        blacklisted_by: usersTable.blacklisted_by,
      })
      .from(usersTable);
    return NextResponse.json({
      count: users.length,
      users,
    });
  } catch (error) {
    return handleServerErrors(error);
  }
}

const userEditSchema = z
  .object({
    id: z.string(),
    url: z.string().optional(),
    uid: z.number().int().optional(),
    swap_with_uid: z.number().int().optional(),
    blacklist: z.boolean().optional(),
    blacklist_reason: z.string().min(1).optional(),
    premium: z.boolean().optional(),
    remove_connected_discord: z.boolean().optional(),
    alias_tokens: z.number().int().optional(),
  })
  .refine((data) => !data.blacklist || !!data.blacklist_reason, {
    message: "blacklist_reason is required when blacklisting a user",
    path: ["blacklist_reason"],
  });

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);
    const [user] = await db
      .select({
        admin: usersTable.admin,
        superadmin: usersTable.superadmin,
        owner: usersTable.owner,
      })
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));
    if (!user || (!user.admin && !user.superadmin && !user.owner)) {
      throw new JuryError("Forbidden", 403);
    }
    const body = await req.json();
    const parsed = userEditSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const {
      id,
      uid,
      url,
      swap_with_uid,
      blacklist,
      blacklist_reason,
      premium,
    } = parsed.data;
    const [targetUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    if (!targetUser) throw new JuryError("User not found", 404);
    const updates: Partial<typeof usersTable.$inferInsert> = {};
    // if we're adding alias tokens
    if (body.alias_tokens > 0) {
      await db.insert(aliasesTable).values({
        userId: targetUser.id,
      });
      // add a fake transaction i guess
      await db.insert(transactionsTable).values({
        // this could be staff id but im not sure
        // fuck it sure
        userId: session.userId,
        amount: 0,
        isGift: true,
        toUserId: targetUser.id,
      });
      await db.insert(auditLogsTable).values({
        action: "alias_tokens_gift",
        performedBy: session.userId,
        targetUserId: targetUser.id,
      });
    }
    if (uid !== undefined && swap_with_uid !== undefined) {
      const [otherUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.uid, swap_with_uid));

      if (!otherUser) throw new JuryError("swap_with_uid does not exist", 400);

      await db.transaction(async (tx) => {
        await tx
          .update(usersTable)
          .set({ uid: swap_with_uid })
          .where(eq(usersTable.id, targetUser.id));
        await tx
          .update(usersTable)
          .set({ uid: targetUser.uid })
          .where(eq(usersTable.id, otherUser.id));
      });
      await db.insert(auditLogsTable).values({
        action: "uid_swap",
        performedBy: session.userId,
        targetUserId: targetUser.id,
      });
    }
    if (premium !== undefined) {
      updates.premium = premium;
      updates.premium_since = premium ? new Date() : null;
      await db.insert(auditLogsTable).values({
        action: premium ? "premium_grant" : "premium_revoke",
        performedBy: session.userId,
        targetUserId: targetUser.id,
      });
    }
    if (url !== undefined && url !== targetUser.url) {
      const [existingUrl] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.url, url));
      if (existingUrl) throw new JuryError("URL already taken", 409);

      const [existingAlias] = await db
        .select({ id: aliasesTable.id })
        .from(aliasesTable)
        .where(eq(aliasesTable.alias, url));
      if (existingAlias) throw new JuryError("URL already taken", 409);

      updates.url = url;
      await db.insert(auditLogsTable).values({
        action: "url_change",
        performedBy: session.userId,
        targetUserId: targetUser.id,
      });
    }
    if (Object.keys(updates).length > 0) {
      await db
        .update(usersTable)
        .set(updates)
        .where(eq(usersTable.id, targetUser.id));
    }
    if (blacklist !== undefined) {
      updates.blacklisted = blacklist;
      if (blacklist) {
        if (!blacklist_reason) {
          throw new JuryError("blacklist_reason is required", 400);
        }
        updates.blacklisted_by = session.userId;
        updates.blacklisted_at = new Date();
        updates.blacklisted_reason = blacklist_reason;
      } else {
        updates.blacklisted_by = null;
        updates.blacklisted_at = null;
        updates.blacklisted_reason = null;
      }
      await db.insert(auditLogsTable).values({
        action: blacklist ? "blacklist" : "unblacklist",
        performedBy: session.userId,
        targetUserId: targetUser.id,
      });
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(usersTable)
        .set(updates)
        .where(eq(usersTable.id, targetUser.id));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleServerErrors(error);
  }
}
