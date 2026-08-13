import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_PUBLIC_PATHS = ["/admin/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminPublicPath = ADMIN_PUBLIC_PATHS.includes(pathname);

  if (isAdminRoute && !isAdminPublicPath && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
