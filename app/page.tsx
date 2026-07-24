"use client";

import { useRef, useState } from "react";
import { SearchInput } from "@/components/SearchInput";
import { IDCard } from "@/components/IDCard";
import type { Delegate } from "@/lib/types";

export default function Home() {
  const [pending, setPending] = useState<Delegate | null>(null);
  const [confirmed, setConfirmed] = useState<Delegate | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function reset() {
    setPending(null);
    setConfirmed(null);
  }

  return (
    <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h1>46th Visayas Area Con</h1>
      <p>Look up your name to view your delegate ID.</p>

      {!pending && !confirmed && <SearchInput onSelect={setPending} />}

      {pending && !confirmed && (
        <div>
          <p>Please confirm this is you before continuing:</p>
          <div style={{ border: "1px solid #ccc", padding: 16, width: 320, textAlign: "center" }}>
            {pending.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pending.photoUrl}
                alt=""
                width={80}
                height={80}
                style={{ objectFit: "cover", borderRadius: "50%" }}
              />
            ) : null}
            <h3 style={{ margin: "12px 0 0" }}>
              {pending.firstName} {pending.lastName}
            </h3>
            {pending.preferredName ? <p style={{ margin: "4px 0 0" }}>{pending.preferredName}</p> : null}
            <p style={{ margin: "12px 0 0", fontWeight: 600 }}>{pending.chapterName}</p>
          </div>
          <p>
            <button type="button" onClick={() => setConfirmed(pending)}>
              Yes, this is me
            </button>{" "}
            <button type="button" onClick={() => setPending(null)}>
              Not me, go back
            </button>
          </p>
        </div>
      )}

      {confirmed && (
        <div>
          <IDCard ref={cardRef} delegate={confirmed} />
          <p>
            <button type="button" onClick={reset}>
              Search again
            </button>
          </p>
        </div>
      )}
    </main>
  );
}
