"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
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
        Sorry about that — an unexpected error occurred. Please try again, or find a Secretariat
        staff member if this keeps happening.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
