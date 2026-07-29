"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/lib/useDebounce";
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

export function SearchInput({ onSelect }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 150ms, not 300 — the Apps Script side now caches the roster
  // (see getPublicDelegatesCached in doGet.gs), so repeated calls as
  // someone types are cheap and a snappier debounce feels much closer to
  // real-time without hammering the backend on every single keystroke.
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWithRetry(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || !Array.isArray(body)) {
          setError("Search failed — please try again.");
          setResults([]);
          return;
        }
        setResults(body as Delegate[]);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Network error — check your connection and try again.");
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

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
    !loading && !error && debouncedQuery.trim().length >= 2 && results.length === 0;

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

      {loading && <p style={{ color: "var(--slate-600)", marginTop: 8 }}>Searching…</p>}
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
