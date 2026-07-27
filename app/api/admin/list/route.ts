import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionCookieValue } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isValidSessionCookieValue(request.cookies.get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 401 });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const adminSecret = process.env.APPS_SCRIPT_ADMIN_SECRET;
  if (!appsScriptUrl || !adminSecret) {
    console.error("APPS_SCRIPT_URL or APPS_SCRIPT_ADMIN_SECRET is not set");
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const upstream = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "adminList", adminSecret }),
    });

    if (!upstream.ok) {
      console.error("Apps Script adminList upstream returned", upstream.status);
      return NextResponse.json({ ok: false, error: "Upstream error" }, { status: 502 });
    }

    const data = await upstream.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Apps Script adminList failed", err);
    return NextResponse.json({ ok: false, error: "Failed to load delegates" }, { status: 500 });
  }
}
