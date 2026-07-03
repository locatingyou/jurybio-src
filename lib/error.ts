import { NextResponse } from "next/server";

export class JuryError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = "";
  }
}

export function handleServerErrors(err: unknown): NextResponse {
  if (err instanceof JuryError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  const message = err instanceof Error ? err.message : "Something went wrong";
  console.error("[Server Error]", {
    message,
    stack: err instanceof Error ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ error: message }, { status: 500 });
}
