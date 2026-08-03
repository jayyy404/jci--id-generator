import { NextRequest, NextResponse } from "next/server";
import type { Delegate } from "@/lib/types";
import { getOrFetch } from "@/lib/ttlCache";

export const dynamic = "force-dynamic";

// Matches the Apps Script-side PUBLIC_DELEGATES_CACHE_TTL_SECONDS (60s) —
// a repeated/retyped identical query within that window is guaranteed to
// return the same data upstream anyway, so this skips the extra network
// hop to Google entirely for that case.
const SEARCH_CACHE_TTL_MS = 60_000;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.error("APPS_SCRIPT_URL is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const data = await getOrFetch(`search:${q}`, SEARCH_CACHE_TTL_MS, async () => {
      const upstream = `${appsScriptUrl}?q=${encodeURIComponent(q)}`;
      // fetch() follows the Apps Script /exec -> googleusercontent.com 302 redirect by default.
      const res = await fetch(upstream, { method: "GET" });

      if (!res.ok) {
        console.error("Apps Script upstream returned", res.status);
        throw new Error("upstream-error");
      }

      const body: unknown = await res.json();
      if (!Array.isArray(body)) {
        console.error("Apps Script returned a non-array payload", body);
        throw new Error("upstream-error");
      }

      return body as Delegate[];
    });

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof Error && err.message === "upstream-error") {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
    console.error("Apps Script search failed", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
