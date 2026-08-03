"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { Badge } from "@/components/ui/Badge";
import type { Delegate } from "@/lib/types";

interface SearchInputProps {
  onSelect: (delegate: Delegate) => void;
}

function duplicateKey(delegate: Delegate): string {
  return [delegate.firstName, delegate.lastName, delegate.chapterName]
    .map((part) => part.trim().toLowerCase())
    .join("|");
}

const MAX_RESULTS = 20;
// Matches /api/delegates' own 60s cache — an open tab (e.g. a kiosk left
// running for hours) picks up new/updated registrations within ~1 minute
// instead of only ever seeing the roster as of when the page first loaded.
const ROSTER_POLL_MS = 60_000;

export function SearchInput({ onSelect }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [roster, setRoster] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the whole delegate directory once and filter it locally as the
  // user types — no network round trip per keystroke (see /api/delegates).
  // Then keep polling in the background so a long-lived tab stays fresh.
  useEffect(() => {
    let cancelled = false;
    let hasLoaded = false;

    async function loadRoster() {
      try {
        const res = await fetchWithRetry("/api/delegates");
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || !Array.isArray(body)) {
          // Only surface an error if we have nothing to show yet — a failed
          // background refresh shouldn't blank out an already-working search.
          if (!hasLoaded) setError("Couldn't load the delegate directory — please refresh.");
          return;
        }
        hasLoaded = true;
        setError(null);
        setRoster(body as Delegate[]);
      } catch {
        if (cancelled) return;
        if (!hasLoaded) setError("Network error — check your connection and refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRoster();
    const interval = setInterval(loadRoster, ROSTER_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (trimmedQuery.length < 2) return [];
    const matches: Delegate[] = [];
    for (const delegate of roster) {
      const full = `${delegate.firstName} ${delegate.lastName}`.toLowerCase();
      if (full.includes(trimmedQuery)) {
        matches.push(delegate);
        if (matches.length >= MAX_RESULTS) break;
      }
    }
    return matches;
  }, [roster, trimmedQuery]);

  // Same first + last name within the same chapter is a real scenario (common
  // Filipino names repeat), and picking the wrong one would print someone
  // else's ID. Flag it so the user slows down and checks before selecting.
  const duplicateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const delegate of results) {
      const key = duplicateKey(delegate);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [results]);

  const hasDuplicates = Array.from(duplicateCounts.values()).some((count) => count > 1);

  const showEmptyState =
    !loading && !error && trimmedQuery.length >= 2 && results.length === 0;

  return (
    <div>
      <input
        id="delegate-search"
        type="text"
        className="input-pill"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Juan Dela Cruz"
        autoComplete="off"
      />

      {loading && trimmedQuery.length > 0 && (
        <p style={{ color: "var(--slate-600)", marginTop: 8 }}>Loading delegate directory…</p>
      )}
      {error && <p style={{ color: "var(--red)", marginTop: 8 }}>{error}</p>}
      {showEmptyState && (
        <p style={{ color: "var(--slate-600)", marginTop: 8 }}>No matching delegate found.</p>
      )}

      {hasDuplicates && (
        <div style={{ marginTop: 12 }}>
          <Badge tone="warning">
            More than one delegate below shares the same name and chapter — check the preferred
            name and photo carefully before picking yours.
          </Badge>
        </div>
      )}

      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {results.map((delegate) => {
            const isDuplicate = (duplicateCounts.get(duplicateKey(delegate)) ?? 0) > 1;
            return (
              <li key={delegate.delegateId}>
                <button
                  type="button"
                  onClick={() => onSelect(delegate)}
                  className={`result-row${isDuplicate ? " is-duplicate" : ""}`}
                >
                  {delegate.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={delegate.photoUrl}
                      alt=""
                      width={32}
                      height={32}
                      style={{ objectFit: "cover", borderRadius: "50%", flexShrink: 0 }}
                    />
                  ) : null}
                  <span>
                    {delegate.firstName} {delegate.lastName}
                    {delegate.preferredName ? ` (${delegate.preferredName})` : ""} —{" "}
                    {delegate.chapterName}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
