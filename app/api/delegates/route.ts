import { NextResponse } from "next/server";
import type { Delegate } from "@/lib/types";
import { getOrFetch } from "@/lib/ttlCache";

export const dynamic = "force-dynamic";

// Matches the Apps Script-side PUBLIC_DELEGATES_CACHE_TTL_SECONDS (60s) —
// the roster doesn't change faster than that upstream anyway, so this skips
// re-fetching within the window. One cache key for the whole roster (not
// per-query, unlike the old /api/search) since the frontend now fetches this
// once and filters locally.
const ROSTER_CACHE_TTL_MS = 60_000;

export async function GET() {
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.error("APPS_SCRIPT_URL is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const data = await getOrFetch("delegates:all", ROSTER_CACHE_TTL_MS, async () => {
      const upstream = `${appsScriptUrl}?all=1`;
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
    console.error("Apps Script roster fetch failed", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
