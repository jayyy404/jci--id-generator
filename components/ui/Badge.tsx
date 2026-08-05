import type { HTMLAttributes } from "react";

type Tone = "gold" | "green" | "neutral" | "warning" | "sky";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneStyles: Record<Tone, React.CSSProperties> = {
  gold: { background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--navy-dark)" },
  green: { background: "linear-gradient(135deg, var(--green), var(--green-light))", color: "var(--white)" },
  neutral: { background: "#e5e7eb", color: "var(--slate-600)" },
  warning: { background: "var(--amber-100)", color: "#a15c00" },
  sky: { background: "var(--sky)", color: "var(--white)" },
};

export function Badge({ tone = "neutral", style, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      style={{
        display: "inline-block",
        borderRadius: "var(--radius-full)",
        padding: "4px 12px",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...toneStyles[tone],
        ...style,
      }}
    />
  );
}
