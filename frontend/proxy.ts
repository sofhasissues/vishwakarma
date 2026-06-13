import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PRIVATE_ROUTES = [
    "/tracker",
    "/interview", 
    "/resume-builder",
    "/history",
    "/settings",
    "/quiz",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPrivate = PRIVATE_ROUTES.some(route => pathname.startsWith(route));

  if (isPrivate && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon).*)",
  ],
};
