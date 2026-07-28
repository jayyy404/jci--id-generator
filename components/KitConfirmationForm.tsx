"use client";

import { useRef, useState } from "react";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Delegate } from "@/lib/types";

interface KitConfirmationFormProps {
  delegate: Delegate;
  onSuccess: () => void;
  onAlreadyConfirmed: () => void;
  onBack: () => void;
}

export function KitConfirmationForm({
  delegate,
  onSuccess,
  onAlreadyConfirmed,
  onBack,
}: KitConfirmationFormProps) {
  const [kitReceived, setKitReceived] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const padRef = useRef<SignaturePadHandle>(null);

  const canSubmit = kitReceived && hasSignature && !submitting;

  // Apps Script's Drive upload can outrun the HTTP response — the write can
  // finish successfully server-side after our fetch to /api/confirm has
  // already timed out or failed to parse. Before showing the participant a
  // false "failed" message, re-search for their own record (same lookup the
  // search step already uses) and check whether it's actually confirmed.
  async function checkIfActuallyConfirmed(): Promise<boolean> {
    const query = `${delegate.firstName} ${delegate.lastName}`.trim();
    if (query.length < 2) return false;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return false;
      const results = await res.json();
      if (!Array.isArray(results)) return false;
      const match = results.find((d: Delegate) => d.delegateId === delegate.delegateId);
      return Boolean(match?.kitConfirmed);
    } catch {
      return false;
    }
  }

  async function handleSubmit() {
    const signatureBase64 = padRef.current?.getDataUrl();
    if (!kitReceived || !signatureBase64) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delegateId: delegate.delegateId, signatureBase64, kitReceived: true }),
      });

      let body: { ok?: boolean; alreadyConfirmed?: boolean; error?: string } | null = null;
      try {
        body = await res.json();
      } catch {
        // Unparseable response — fall through to reconciliation below
        // instead of assuming failure.
      }

      if (body?.ok) {
        onSuccess();
        return;
      }

      if (body?.alreadyConfirmed) {
        onAlreadyConfirmed();
        return;
      }

      if (await checkIfActuallyConfirmed()) {
        onSuccess();
        return;
      }

      setError(body?.error || "Server error — please try again.");
    } catch {
      // fetch() itself threw — offline, DNS failure, connection dropped
      // mid-request. Reconcile before reporting failure: the request may
      // have reached Apps Script and completed even though the response
      // never made it back to us.
      if (await checkIfActuallyConfirmed()) {
        onSuccess();
        return;
      }
      setError("Network error — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Conference Kit Confirmation</h2>

      <h3>Participant Signature</h3>
      <p style={{ color: "var(--slate-600)" }}>
        Please sign below to confirm your registration and acknowledge receipt of your conference
        kit.
      </p>
      <SignaturePad ref={padRef} maxWidth={480} onChange={setHasSignature} />

      <Card accent style={{ marginTop: 24 }}>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={kitReceived}
            onChange={(e) => setKitReceived(e.target.checked)}
            style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, accentColor: "var(--gold)" }}
          />
          <span style={{ color: "var(--slate-800)" }}>
            By confirming below, I acknowledge that I have received my official conference kit
            and that the registration information displayed is accurate. I have received my
            official conference kit.
          </span>
        </label>
      </Card>

      {error && <p style={{ color: "var(--red)", marginTop: 12 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Button disabled={!canSubmit} onClick={handleSubmit} fullWidth={false}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          Back
        </Button>
      </div>
    </div>
  );
}
