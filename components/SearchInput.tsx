"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/lib/useDebounce";
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
  const debouncedQuery = useDebounce(query, 300);

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

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || !Array.isArray(body)) {
          setError("Something went wrong while searching. Please try again.");
          setResults([]);
          return;
        }
        setResults(body as Delegate[]);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Something went wrong while searching. Please try again.");
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
      <label htmlFor="delegate-search">Type your name</label>
      <br />
      <input
        id="delegate-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Juan Dela Cruz"
        autoComplete="off"
      />

      {loading && <p>Searching…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {showEmptyState && <p>No matching delegate found.</p>}

      {hasDuplicates && (
        <p style={{ color: "#a15c00" }}>
          More than one delegate below shares the same name and chapter — check the
          preferred name and photo carefully before picking yours.
        </p>
      )}

      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {results.map((delegate) => {
            const isDuplicate = (duplicateCounts.get(duplicateKey(delegate)) ?? 0) > 1;
            return (
              <li key={delegate.delegateId} style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => onSelect(delegate)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: 8,
                    textAlign: "left",
                    border: isDuplicate ? "1px solid #a15c00" : "1px solid #ccc",
                  }}
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
