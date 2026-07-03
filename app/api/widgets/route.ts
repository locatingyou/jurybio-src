import { db } from "@/db";
import { widgetsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  platform: z.enum(["weather", "discord", "spotify", "lastfm", "tiktok"]),
  type: z.string().min(1),
  identifier: z.string().min(1),
  weather_show_feels_like: z.boolean().optional(),
  weather_temperature_unit: z.enum(["celsius", "fahrenheit"]).optional(),
  weather_show_location: z.boolean().optional(),
  weather_show_condition: z.boolean().optional(),
  discord_show_badges: z.boolean().optional(),
  discord_show_guild_tag: z.boolean().optional(),
  discord_show_avatar_decoration: z.boolean().optional(),
  discord_show_activity: z.boolean().optional(),
  discord_show_status: z.boolean().optional(),
  spotify_show_artist: z.boolean().optional(),
  spotify_show_progress: z.boolean().optional(),
  lastfm_mode: z.enum(["now_playing", "profile"]).optional(),
  lastfm_show_artist: z.boolean().optional(),
  lastfm_show_album: z.boolean().optional(),
  lastfm_show_scrobbles: z.boolean().optional(),
  lastfm_show_artists: z.boolean().optional(),
  tiktok_show_followers: z.boolean().optional(),
  tiktok_show_following: z.boolean().optional(),
  tiktok_show_likes: z.boolean().optional(),
  tiktok_show_videos: z.boolean().optional(),
  tiktok_show_verified: z.boolean().optional(),
  show_button: z.boolean().optional(),
});

const patchSchema = createSchema.partial().extend({
  id: z.string().min(1),
  enabled: z.boolean().optional(),
  position: z.number().int().optional(),
});

const reorderSchema = z.object({
  widgets: z.array(
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

    const widgets = await db
      .select()
      .from(widgetsTable)
      .where(eq(widgetsTable.userId, session.userId))
      .orderBy(widgetsTable.position);

    return NextResponse.json({ widgets }, { status: 200 });
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
      .select({ id: widgetsTable.id })
      .from(widgetsTable)
      .where(eq(widgetsTable.userId, session.userId));

    if (existing.length >= 4) {
      return NextResponse.json(
        { error: "Maximum of 4 widgets allowed" },
        { status: 400 },
      );
    }

    const [widget] = await db
      .insert(widgetsTable)
      .values({
        userId: session.userId,
        ...parsed.data,
        position: existing.length,
      })
      .returning();

    return NextResponse.json({ widget }, { status: 201 });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const body = await req.json();

    if (body.widgets) {
      const parsed = reorderSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }
      for (const { id, position } of parsed.data.widgets) {
        await db
          .update(widgetsTable)
          .set({ position, updatedAt: new Date() })
          .where(
            and(
              eq(widgetsTable.id, id),
              eq(widgetsTable.userId, session.userId),
            ),
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
      .update(widgetsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(widgetsTable.id, id), eq(widgetsTable.userId, session.userId)),
      )
      .returning();

    if (!updated) throw new JuryError("Widget not found", 404);

    return NextResponse.json({ widget: updated }, { status: 200 });
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
    if (!id) throw new JuryError("Widget ID is required", 400);

    await db
      .delete(widgetsTable)
      .where(
        and(eq(widgetsTable.id, id), eq(widgetsTable.userId, session.userId)),
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
