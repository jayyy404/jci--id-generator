import type { ReactNode } from "react";

const feathers = [
  { d: "M60 60 L60 10 L55 60 Z", fill: "var(--red)" },
  { d: "M60 60 L75 15 L65 60 Z", fill: "var(--navy)" },
  { d: "M60 60 L88 25 L70 60 Z", fill: "var(--red)" },
  { d: "M60 60 L98 40 L75 60 Z", fill: "var(--gold)" },
  { d: "M60 60 L105 55 L78 60 Z", fill: "var(--red)" },
  { d: "M60 60 L45 15 L55 60 Z", fill: "var(--navy)" },
  { d: "M60 60 L32 25 L50 60 Z", fill: "var(--red)" },
  { d: "M60 60 L22 40 L45 60 Z", fill: "var(--gold)" },
  { d: "M60 60 L15 55 L42 60 Z", fill: "var(--red)" },
];

function TribalBurst({ mirror, className }: { mirror?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <g>
        {feathers.map((f, i) => (
          <path key={i} d={f.d} fill={f.fill} />
        ))}
      </g>
    </svg>
  );
}

function Sailboat({
  variant,
  size = 44,
  bob,
}: {
  variant: "blue" | "gold" | "red";
  size?: number;
  bob: "a" | "b" | "c" | "d";
}) {
  const colors = {
    blue: { main: "#3a67b1", secondary: "#0097d7", hull: "#1e3a6e", hull2: "#3a67b1" },
    gold: { main: "#f59e0b", secondary: "#fcd34d", hull: "#92400e", hull2: "#b45309" },
    red: { main: "#dc2626", secondary: "#ef4444", hull: "#7f1d1d", hull2: "#991b1b" },
  }[variant];

  return (
    <svg
      viewBox="0 0 80 100"
      style={{ width: size, height: "auto" }}
      className={`hero-boat-bob-${bob}`}
      aria-hidden="true"
    >
      <polygon points="40,5 40,60 70,60" fill={colors.main} />
      <polygon points="40,15 40,55 15,55" fill={colors.secondary} opacity="0.9" />
      <rect x="38" y="5" width="4" height="70" fill="#5c4033" />
      <ellipse cx="40" cy="78" rx="25" ry="8" fill={colors.hull} />
      <ellipse cx="40" cy="76" rx="22" ry="6" fill={colors.hull2} />
      <polygon points="42,5 42,12 52,8.5" fill="#fcd34d" />
    </svg>
  );
}

const confetti = [
  { top: "8%", left: "10%", size: 10, color: "var(--sky)" },
  { top: "18%", left: "90%", size: 8, color: "var(--red)" },
  { top: "40%", left: "4%", size: 12, color: "var(--gold)" },
  { top: "60%", left: "96%", size: 9, color: "var(--sky)" },
  { top: "85%", left: "20%", size: 8, color: "var(--red)" },
  { top: "12%", left: "50%", size: 7, color: "var(--gold)" },
  { top: "30%", left: "78%", size: 8, color: "var(--sky)" },
  { top: "72%", left: "35%", size: 10, color: "var(--gold)" },
  { top: "50%", left: "88%", size: 6, color: "var(--red)" },
];

export function HeroBanner({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="portal-hero">
      <div className="portal-hero-decor" aria-hidden="true">
        {confetti.map((dot, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: dot.color,
              opacity: 0.35,
            }}
          />
        ))}

        <TribalBurst className="hero-burst hero-burst-left" />
        <TribalBurst mirror className="hero-burst hero-burst-right" />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mascot.png" alt="" className="hero-mascot" />

        <div className="hero-boats hero-boats-left">
          <Sailboat variant="blue" size={64} bob="a" />
          <Sailboat variant="gold" size={80} bob="b" />
        </div>
        <div className="hero-boats hero-boats-right">
          <Sailboat variant="red" size={74} bob="c" />
          <Sailboat variant="blue" size={56} bob="d" />
        </div>
      </div>

      <div className="portal-hero-foreground">
        <div className={wide ? "portal-hero-content portal-hero-content-wide" : "portal-hero-content"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/areacon-logo.png"
            alt="46th Visayas Area Con — Hala Bira: The Rhythm of Change"
            className="portal-hero-logo"
          />
          {wide ? children : <div className="portal-hero-message">{children}</div>}
        </div>
      </div>
    </div>
  );
}
