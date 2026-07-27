export function Header() {
  return (
    <header
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "8px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/jci-philippines.png"
            alt="JCI Philippines"
            style={{ height: 85, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 40, background: "var(--border)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/jci-regatta.png"
            alt="JCI Regatta"
            style={{ height: 85, width: "auto", objectFit: "contain" }}
          />
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 25,
            color: "var(--navy)",
            textAlign: "right",
          }}
        >
          46th Visayas Area Con
        </span>
      </div>
    </header>
  );
}
