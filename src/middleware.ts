import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  if (request.method !== "POST") return NextResponse.next();

  const ip = (
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-real-ip") ??
    "unknown"
  ).trim();

  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  // Prune expired entries to avoid unbounded memory growth
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) {
      if (now > v.resetAt) attempts.delete(k);
    }
  }

  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (record.count >= MAX_ATTEMPTS) {
    return new NextResponse("Too many requests. Please try again in a minute.", {
      status: 429,
      headers: { "Retry-After": "60", "Content-Type": "text/plain" },
    });
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/reset-password"],
};
