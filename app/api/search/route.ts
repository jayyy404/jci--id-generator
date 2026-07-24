import { NextRequest, NextResponse } from "next/server";
import type { Delegate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.error("APPS_SCRIPT_URL is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const upstream = `${appsScriptUrl}?q=${encodeURIComponent(q)}`;
    // fetch() follows the Apps Script /exec -> googleusercontent.com 302 redirect by default.
    const res = await fetch(upstream, { method: "GET" });

    if (!res.ok) {
      console.error("Apps Script upstream returned", res.status);
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const data: unknown = await res.json();

    if (!Array.isArray(data)) {
      console.error("Apps Script returned a non-array payload", data);
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    return NextResponse.json(data as Delegate[], {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Apps Script search failed", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
