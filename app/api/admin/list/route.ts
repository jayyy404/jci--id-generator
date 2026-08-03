import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionCookieValue } from "@/lib/adminSession";
import { getOrFetch } from "@/lib/ttlCache";

export const dynamic = "force-dynamic";

// Matches the Apps Script-side ADMIN_DELEGATES_CACHE_TTL_SECONDS (10s) so
// this layer just absorbs same-instance concurrent/rapid polls between
// admin tabs — the authoritative cache lives on the Apps Script side.
const ADMIN_LIST_CACHE_TTL_MS = 10_000;

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
    const data = await getOrFetch("admin-list", ADMIN_LIST_CACHE_TTL_MS, async () => {
      const upstream = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adminList", adminSecret }),
      });

      if (!upstream.ok) {
        console.error("Apps Script adminList upstream returned", upstream.status);
        throw new Error("upstream-error");
      }

      return upstream.json();
    });

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof Error && err.message === "upstream-error") {
      return NextResponse.json({ ok: false, error: "Upstream error" }, { status: 502 });
    }
    console.error("Apps Script adminList failed", err);
    return NextResponse.json({ ok: false, error: "Failed to load delegates" }, { status: 500 });
  }
}
