import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ConfirmRequestBody {
  delegateId?: unknown;
  signatureBase64?: unknown;
  kitReceived?: unknown;
}

export async function POST(request: NextRequest) {
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.error("APPS_SCRIPT_URL is not set");
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  let body: ConfirmRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const delegateId = typeof body.delegateId === "string" ? body.delegateId.trim() : "";
  const signatureBase64 = typeof body.signatureBase64 === "string" ? body.signatureBase64 : "";
  const kitReceived = body.kitReceived === true;

  if (!delegateId || !signatureBase64 || !kitReceived) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Server-to-server call — the text/plain CORS workaround documented in
    // apps-script/doGet.gs only matters for a browser calling Apps Script
    // directly, which triggers preflight. There's no browser/preflight
    // involved here, so a normal application/json POST is fine.
    const upstream = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirmKit", delegateId, signatureBase64, kitReceived }),
    });

    if (!upstream.ok) {
      console.error("Apps Script confirmKit upstream returned", upstream.status);
      return NextResponse.json({ ok: false, error: "Upstream error" }, { status: 502 });
    }

    const data = await upstream.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Apps Script confirmKit failed", err);
    return NextResponse.json({ ok: false, error: "Confirmation failed" }, { status: 500 });
  }
}
