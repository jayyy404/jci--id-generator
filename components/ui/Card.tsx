import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
}

export function Card({ accent, style, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{
        background: "var(--white)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
        padding: 24,
        borderLeft: accent ? "4px solid var(--gold)" : undefined,
        ...style,
      }}
    />
  );
}
