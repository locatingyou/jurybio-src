import { deleteSession } from "@/lib/auth";
import { handleServerErrors } from "@/lib/error";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
