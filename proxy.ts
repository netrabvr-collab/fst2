import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Runs BEFORE requests reach pages / route handlers (RBAC gate).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return isApi
      ? NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (session.user as unknown as { role: string }).role;
  const adminOnly = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (adminOnly && role !== "ADMIN") {
    return isApi
      ? NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 })
      : NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/transactions/:path*", "/api/admin/:path*"],
};
