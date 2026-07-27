// Retries only on network-level failures (fetch() throwing — offline, DNS,
// connection dropped mid-request), never on HTTP error responses (4xx/5xx
// are a real answer from the server, not a transient blip, and are handled
// by the caller). Scoped to GET/read calls where a retry can never cause a
// duplicate side effect — POSTs (confirm, login) stay manual-retry-only.
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 1,
  delayMs = 500,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fetchWithRetry(input, init, retries - 1, delayMs);
  }
}
