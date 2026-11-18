import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  hasAdminSession,
  isAdminAuthConfigured,
  isSameOriginRequest,
  passwordMatches,
} from "@/lib/adminAuth";

const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: Request) {
  return NextResponse.json(
    { authenticated: isAdminAuthConfigured() && hasAdminSession(request) },
    { headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "Permintaan ditolak." }, { status: 403, headers: noStoreHeaders });
  }
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ success: false, message: "Autentikasi admin belum dikonfigurasi: ADMIN_PASSWORD belum diatur di server." }, { status: 503, headers: noStoreHeaders });
  }

  try {
    const body = await request.json();
    if (!passwordMatches(body?.password)) {
      return NextResponse.json({ success: false, message: "Password admin tidak valid." }, { status: 401, headers: noStoreHeaders });
    }

    const response = NextResponse.json({ success: true }, { headers: noStoreHeaders });
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Permintaan login tidak valid." }, { status: 400, headers: noStoreHeaders });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "Permintaan ditolak." }, { status: 403, headers: noStoreHeaders });
  }

  const response = NextResponse.json({ success: true }, { headers: noStoreHeaders });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
