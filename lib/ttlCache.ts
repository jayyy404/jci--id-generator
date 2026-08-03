// Per-instance (not shared across Vercel serverless instances), in-memory
// get-or-fetch cache. Two jobs: (1) skip refetching within `ttlMs` of the
// last successful fetch, (2) de-dupe concurrent callers for the same key
// onto a single in-flight fetch, so a burst of near-simultaneous requests
// (multiple admin tabs, multiple identical searches) never fires more than
// one upstream call at a time. Best-effort only — the authoritative,
// cross-instance protection is the CacheService cache on the Apps Script
// side; this just avoids paying for a redundant network hop when it does.
type Entry<T> = { value: T; expiresAt: number };

const cache = new Map<string, Entry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

export async function getOrFetch<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fetcher()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}
