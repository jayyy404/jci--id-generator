"use client";

import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "48px 16px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p style={{ color: "var(--slate-600)" }}>
        The admin page hit an unexpected error. Try again — if it keeps happening, reload the
        page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
