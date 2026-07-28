"use client";

import { useEffect, useMemo, useState } from "react";
import { jsonToCsv } from "@/lib/csv";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { HeroBanner } from "@/components/HeroBanner";
import { IntroOverlay } from "@/components/IntroOverlay";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AdminDelegate } from "@/lib/types";

type AuthState = "checking" | "loggedOut" | "loggedIn";

function isKitConfirmed(value: AdminDelegate["KitConfirmed"]): boolean {
  if (value === true) return true;
  return String(value || "").trim().toLowerCase() === "true";
}

function formatTimestamp(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [delegates, setDelegates] = useState<AdminDelegate[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const POLL_INTERVAL_MS = 15000;

  // silent: true for background polling — skips clearing the delegate list
  // or bouncing the UI, so a transient blip doesn't flash an empty table;
  // the error still surfaces via loadError.
  async function loadDelegates(silent?: boolean) {
    if (!silent) setLoadError(null);
    try {
      // Read-only — safe to auto-retry once on a dropped connection.
      const res = await fetchWithRetry("/api/admin/list");
      if (res.status === 401) {
        setAuth("loggedOut");
        return;
      }

      let body;
      try {
        body = await res.json();
      } catch {
        setLoadError("Server error — please refresh and try again.");
        setAuth("loggedIn");
        return;
      }

      if (!body.ok) {
        setLoadError(body.error || "Server error — please refresh and try again.");
        setAuth("loggedIn");
        return;
      }
      setDelegates(body.delegates as AdminDelegate[]);
      setLoadError(null);
      setAuth("loggedIn");
    } catch {
      setLoadError("Network error — check your connection and try again.");
      setAuth("loggedIn");
    }
  }

  useEffect(() => {
    loadDelegates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Two devices in practice — one for participants confirming, one for
  // Secretariat watching status — so the admin table needs to reflect new
  // confirmations without someone manually reloading the page.
  useEffect(() => {
    if (auth !== "loggedIn") return;
    const interval = setInterval(() => loadDelegates(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  async function handleLogin() {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      let body;
      try {
        body = await res.json();
      } catch {
        setLoginError("Server error — please try again.");
        return;
      }

      if (!body.ok) {
        setLoginError(body.error || "Incorrect password");
        return;
      }
      setPassword("");
      await loadDelegates();
    } catch {
      setLoginError("Network error — check your connection and try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setDelegates([]);
    setAuth("loggedOut");
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return delegates;
    return delegates.filter((d) => {
      const haystack = `${d.FirstName} ${d.LastName} ${d.ChapterName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [delegates, filter]);

  function handleExportCsv() {
    const csv = jsonToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "areacon-delegates.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (auth === "checking") {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--slate-600)" }}>Loading…</div>
    );
  }

  if (auth === "loggedOut") {
    return (
      <HeroBanner>
        <h1 style={{ fontSize: 22, marginBottom: 10 }}>Secretariat Admin</h1>
        <p style={{ color: "var(--slate-600)", margin: "0 0 14px", lineHeight: 1.4 }}>
          Log in to view participant registrations and confirm conference kit receipts.
        </p>
        <label htmlFor="admin-password" style={{ display: "block", fontWeight: 600, margin: "0 0 8px" }}>
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            className="input-pill"
            style={{ paddingRight: 48 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              color: "var(--slate-600)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.5 0-9.5-4.5-10.5-8 .58-2.02 1.8-4.14 3.53-5.79M9.9 4.24A10.94 10.94 0 0 1 12 4c5.5 0 9.5 4.5 10.5 8-.36 1.25-1 2.5-1.9 3.66M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <Button fullWidth onClick={handleLogin} disabled={loggingIn || !password}>
            {loggingIn ? "Logging in…" : "Log in"}
          </Button>
        </div>
        {loginError && <p style={{ color: "var(--red)", marginTop: 12 }}>{loginError}</p>}
      </HeroBanner>
    );
  }

  return (
    <HeroBanner wide>
      <IntroOverlay />
      <div
        className="glass-panel"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "16px 20px",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0 }}>Secretariat Admin</h1>
        <Button variant="danger" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>

      {loadError && <p style={{ color: "var(--red)", marginTop: 12 }}>{loadError}</p>}

      <div
        className="glass-panel"
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          padding: "16px 20px",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          className="input-pill"
          placeholder="Search name or chapter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <Button variant="success" size="sm" onClick={handleExportCsv} disabled={filtered.length === 0}>
          {filter.trim()
            ? `Export CSV (${filtered.length} of ${delegates.length} — filtered)`
            : `Export CSV (${filtered.length})`}
        </Button>
      </div>

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "rgba(30, 58, 95, 0.92)" }}>
              <th style={headCellStyle}>Name</th>
              <th style={headCellStyle}>Chapter</th>
              <th style={headCellStyle}>Status</th>
              <th style={headCellStyle}>Payment</th>
              <th style={headCellStyle}>Receipt</th>
              <th style={headCellStyle}>Kit Confirmation</th>
              <th style={headCellStyle}>Confirmed At</th>
              <th style={headCellStyle}>Signature</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={d.DelegateId} className={i % 2 === 0 ? "glass-row-even" : "glass-row-odd"}>
                <td style={cellStyle}>
                  {d.FirstName} {d.LastName}
                </td>
                <td style={cellStyle}>{d.ChapterName}</td>
                <td style={cellStyle}>{d.Status}</td>
                <td style={cellStyle}>
                  {d.PaymentStatus === "Paid" ? (
                    <Badge tone="green">Paid</Badge>
                  ) : (
                    <Badge tone="warning">Unpaid</Badge>
                  )}
                </td>
                <td style={cellStyle}>
                  {d.ReceiptURLs && d.ReceiptURLs.length > 0 ? (
                    <span style={{ display: "flex", gap: 8 }}>
                      {d.ReceiptURLs.map((url, receiptIndex) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--sky)" }}
                        >
                          View{d.ReceiptURLs.length > 1 ? ` ${receiptIndex + 1}` : ""}
                        </a>
                      ))}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={cellStyle}>
                  {isKitConfirmed(d.KitConfirmed) ? (
                    <Badge tone="green">Confirmed</Badge>
                  ) : (
                    <Badge tone="neutral">Pending</Badge>
                  )}
                </td>
                <td style={cellStyle}>{formatTimestamp(d.KitConfirmedAt)}</td>
                <td style={cellStyle}>
                  {d.SignatureURL ? (
                    <a href={d.SignatureURL} target="_blank" rel="noreferrer" style={{ color: "var(--sky)" }}>
                      View
                    </a>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HeroBanner>
  );
}

const headCellStyle: React.CSSProperties = {
  padding: "14px 24px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--white)",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "14px 24px",
  textAlign: "left",
  fontSize: 14,
  borderBottom: "1px solid var(--border)",
};
