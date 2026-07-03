import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const cookie_name = "_jury_session";
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/auth"];

let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(300, "1 m"),
  });
} catch (error) {
  console.error("Ratelimit initialization failed:", error);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (ratelimit) {
    try {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.redirect(new URL("/ratelimit", req.url));
      }
    } catch (error) {
      console.error("Rate limit check failed:", error);
    }
  }

  const isAuth = authRoutes.some((r) => pathname.startsWith(r));
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const raw = req.cookies.get(cookie_name)?.value;
  const token = raw?.startsWith(".DO_NOT_SHARE|")
    ? raw.slice(".DO_NOT_SHARE|".length)
    : null;

  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (isProtected && !valid) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
  if (isAuth && valid) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
