# Technical Review — Registration Confirmation System

Snapshot of the codebase as of the point it was confirmed "working as intended"
end-to-end (search → review → sign → confirm → lock; admin login → list →
export). This isn't a list of things that are broken right now — it's what I'd
want fixed or at least consciously decided on before this runs unattended at
the actual event, ranked by how much it matters.

Severity key: **High** = could cause real harm/incorrect data if it happens.
**Medium** = a real gap, low-to-moderate likelihood or impact. **Low** =
worth knowing about, not urgent.

---

## Security

### 1. Admin session token never actually expires (High)
`lib/adminSession.ts` signs a **fixed** value (`"admin"`) with `ADMIN_PASSWORD`
as the HMAC key. That means there is exactly one valid cookie value for as
long as the password doesn't change, and — more importantly — nothing in
`isValidSessionCookieValue` checks *when* it was issued. The 8-hour `maxAge`
in `app/api/admin/login/route.ts` is a **browser-side** hint only. If that
exact cookie string is ever copied out (shared screen, saved browser profile,
a `curl -H "Cookie: ..."` someone pastes into a chat) it stays valid forever,
not just for 8 hours.
**Fix direction:** embed an issued-at timestamp in the signed payload and
reject cookies older than N hours server-side, not just client-side.

### 2. No rate limiting anywhere (Medium)
`/api/admin/login` (password brute-force), `/api/confirm` (spam confirms
against known delegateIds), and `/api/search` (roster scraping via many short
queries) all accept unlimited requests. Vercel has some platform-level abuse
protection, but nothing in this app itself throttles or locks out repeated
attempts.
**Fix direction:** even a basic in-memory/edge-config rate limit on
`/api/admin/login` (e.g. 5 attempts/15min per IP) would close the most
realistic risk (password guessing) cheaply.

### 3. The raw Apps Script `doGet` URL doesn't enforce the 2-character minimum (Low)
`app/api/search/route.ts` blocks queries under 2 characters, but that's a
Next.js-layer check. The Apps Script `doGet` itself only blocks a fully empty
`q`. Anyone who discovers the raw `/exec` URL (not shown anywhere in the UI,
but it's not a secret either) could query single characters directly and get
broader matches than the app's own UI allows. Low impact since the field
whitelist still applies — no PII leaks — but worth closing for consistency.

### 4. CSV injection in admin export (Low–Medium)
`lib/csv.ts`'s `escapeCsvCell` only escapes quotes/commas/newlines. If any
field (delegate name, hotel accommodation notes, etc. — all free-text,
attendee-submitted) starts with `=`, `+`, `-`, or `@`, Excel/Sheets can
interpret it as a formula when the exported CSV is opened. This is a
well-known CSV-export gotcha, not specific to this app, but nothing here
guards against it.
**Fix direction:** prefix such values with a `'` (or a space) before export.

### 5. `adminSecret` and `confirmKit`'s comparisons aren't constant-time (Low)
`handleAdminList` compares `payload.adminSecret !== expected` with a plain
`!==`, not the `timingSafeEqual` used for the Next.js session cookie. Timing
attacks over a real network with Apps Script's own latency jitter are
impractical to exploit, but it's an inconsistency worth knowing about since
the cookie check was deliberately hardened and this wasn't.

### 6. No payload size limit on `signatureBase64` (Low–Medium)
`app/api/confirm/route.ts` only checks it's a non-empty string — nothing
bounds its size before forwarding to Apps Script. A malicious caller could
send a very large string repeatedly, wasting Apps Script's daily quota
(execution time, Drive writes) — a cheap denial-of-service vector against the
whole deployment, not just this one feature.

### 7. Pre-existing, outside what we built, but worth flagging: plaintext portal passwords
`PortalAccounts` passwords are generated, stored, and compared as plain text
(`authenticateAccount` in `doGet.gs`, code that predates this project's
changes). Not something introduced here, but since a full security pass was
requested, it's the single largest gap in the overall system if anyone ever
gets read access to that sheet.

### Accepted trade-offs (not findings, just documented so they're conscious)
- `confirmKit` and `doGet` are intentionally unauthenticated — a `delegateId`
  (UUID) is the only "credential," same trust model across both. Already
  discussed and accepted as reasonable for a short-lived on-site event tool.
- Admin auth is a single shared password, not per-user accounts — also
  already discussed and accepted for this use case.

---

## Logic / Correctness

### 8. Race condition on double-submit (Medium)
`handleConfirmKit` reads `KitConfirmed`, and — if false — calls
`saveSignature` (a network round-trip to Drive) *before* writing
`KitConfirmed = true`. Apps Script Web App requests run concurrently, not
serialized. If the same delegate's confirm request somehow fires twice in
quick succession (double-tap before the button visually disables, the same
link open in two tabs), both requests could pass the "not yet confirmed"
check before either writes back — resulting in two signature files and a
"last write wins" on `SignatureURL`. Narrow window, but Apps Script has a
built-in fix for exactly this: `LockService.getScriptLock()` around the
check-then-write in `handleConfirmKit`.

### 9. No cutoff date on kit confirmation (worth a product decision, not a bug)
`handleSaveDelegate`/`handleDeleteDelegate` both reject changes after
`CUTOFF` (Aug 28, 2026). `handleConfirmKit` has no such check — kit receipt
could technically be "confirmed" indefinitely after the event, with no
window at all. Might be intentional (confirmations happen live at the event,
no reason to block them), but worth explicitly deciding rather than it being
an oversight.

### 10. `toDirectImageUrl`'s regex is fragile to Drive URL format changes (Low)
It pattern-matches `/d/<id>/` out of `file.getUrl()`. If Google ever changes
that URL shape, this fails *silently* — falls back to returning the
un-rewritten viewer URL, so a photo just quietly stops rendering with no
error surfaced anywhere. Low likelihood, but silent failure mode is worth
knowing about.

### 11. Full-table linear scans on every request (Low now, Medium at scale)
**Status: Fixed for the search path (the one that actually mattered here) —
`doGet` in `apps-script/doGet.gs` now reads/transforms the roster once and
caches it via `CacheService` for 60s (`getPublicDelegatesCached`), so every
keystroke of a type-ahead search after the first hits cache instead of
re-scanning the sheet. `handleConfirmKit` invalidates that cache immediately
on a successful confirm, so re-searching your own name right after confirming
never sees stale data. This is also what made typing a name feel slow —
combined with dropping the client-side debounce from 300ms to 150ms
(`components/SearchInput.tsx`), search now updates near-instantly as you
type.**

`findDelegateRowById`, `findAccountRow`, and `handleAdminList` still scan the
sheet directly (deliberately left as-is): they're write-path/low-frequency
lookups (once per submit, or once per admin page load), not per-keystroke,
so they weren't contributing to the reported slowness, and admin explicitly
wants live/uncached data. Revisit only if the roster grows large enough that
these specific calls start being slow on their own.

**Requires redeploying `apps-script/doGet.gs`** (Deploy → Manage deployments
→ New version) for the caching to take effect — the code change alone
doesn't do anything until that's live.

---

## Error Handling

### 12. No React error boundary (Medium, given this runs live at an event)
**Status: Fixed.** Added `app/error.tsx` and `app/admin/error.tsx` — both
render a "Something went wrong" message with a "Try again" button (calls
Next's `reset()`) instead of the default blank-page crash.

### 13. Generic error messages don't distinguish failure types
**Status: Fixed.** `SearchInput`, `KitConfirmationForm`, and the admin
page's login/list-load now distinguish three cases instead of one generic
message: a `fetch()`-level throw ("Network error — check your connection and
try again."), a response that came back but wasn't valid JSON ("Server error
— please try again."), and an actual business-logic error from the API
(shows that specific message, e.g. "Incorrect password" or "This
registration has already been confirmed.").

### 14. No retry on transient network failures
**Status: Fixed for read-only requests.** Added `lib/fetchWithRetry.ts` —
retries once (after a 500ms delay) only when `fetch()` itself throws
(offline/DNS/dropped connection), never on HTTP error responses. Wired into
`SearchInput`'s search calls and the admin page's delegate-list load, both
read-only so a retry can never cause a duplicate side effect. Deliberately
**not** wired into `/api/confirm` or `/api/admin/login` (POSTs) — even though
`confirmKit`'s server-side lock makes a retried confirm technically safe,
auto-retrying a mutating request is riskier UX than it's worth here; those
stay manual-retry (user clicks Submit/Log in again).

---

## Flow

### 15. CSV export silently exports the *filtered* list, not always everything (Medium — easy, worth fixing)
**Status: Fixed.** The button still exports the filtered list (sometimes
that's genuinely what you want, e.g. "just JCI Cebu"), but it's no longer
silent about it — label now reads `Export CSV (12 of 45 — filtered)` when a
search is active, or `Export CSV (45)` when it isn't, so it's never ambiguous
what you're about to download.

### 16. No visible path to `/admin` from the public page (by design, flagging as a reminder)
Already discussed — intentionally not linked from the participant-facing
page so it's not casually discoverable. Staff need to know to type `/admin`
manually. Fine as-is; mentioning only so it doesn't get "rediscovered" as a
bug later.

### 17. Stray duplicate signature files from testing (housekeeping, not code)
Several `6370afd9-...-signature.png` files are sitting in the signature
Drive folder from debugging earlier — not a code issue, just needs a manual
cleanup pass before real data starts flowing in.

---

## Suggested priority if tackling this before the event

**Done:** findings 11 (search caching — needs Apps Script redeploy to take
effect), 12 (error boundaries), 13 (differentiated error messages), 14
(retry on read-only requests), 15 (CSV export labeling).

**Still open, in priority order:**

1. Admin session expiry (finding 1) — real risk if the deployed URL/cookie
   ever gets shared or a device is left logged in.
2. Decide + implement the `confirmKit` cutoff question (finding 9) — a
   product decision more than a bug, but easy to bake in now.
3. Rate limiting on `/api/admin/login` (finding 2) — cheap insurance.
4. `LockService` around `handleConfirmKit`'s check-then-write (finding 8) —
   narrow window, but a one-line fix once you're in there anyway.

Everything else (findings 3, 4, 5, 6, 7, 10) is worth knowing about but
reasonable to leave as-is for a short-lived event tool, or revisit if this
becomes a recurring/longer-lived system rather than a one-off for this
conference.
