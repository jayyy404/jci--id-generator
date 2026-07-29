"use client";

import { useEffect, useState } from "react";

const WIDTH = 1440;
const HEIGHT = 320;
const AMPLITUDE = 85;
const BASELINE = 170;
const CYCLES = 1.8;

function waveY(x: number) {
  return BASELINE + AMPLITUDE * Math.sin((x / WIDTH) * Math.PI * 2 * CYCLES - Math.PI / 2);
}

function buildStringPath() {
  const points: string[] = [];
  for (let x = -50; x <= WIDTH + 50; x += 12) {
    const y = waveY(x).toFixed(1);
    points.push(`${points.length === 0 ? "M" : "L"} ${x} ${y}`);
  }
  return points.join(" ");
}

const FLAG_COLORS = ["var(--red)", "var(--gold)", "var(--sky)"];
const FLAG_COUNT = 24;
const flags = Array.from({ length: FLAG_COUNT }, (_, i) => {
  const x = (i / (FLAG_COUNT - 1)) * WIDTH;
  return { x, y: waveY(x), color: FLAG_COLORS[i % FLAG_COLORS.length], delay: i * 0.08 };
});

const VISIBLE_DURATION_MS = 4600;
const REPLAY_INTERVAL_MS = 30000;

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  // Bumped to remount a fresh <svg> each replay — the CSS animations use
  // `forwards` fill-mode (deliberately, so they hold their end state instead
  // of snapping back), which means restarting them requires a brand new DOM
  // node, not just re-toggling visibility on the same one. React reuses the
  // same element across renders unless its `key` changes, so this key is
  // what actually forces that remount.
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(false);
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    function play() {
      setPlayCount((count) => count + 1);
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), VISIBLE_DURATION_MS);
    }

    play();
    const interval = setInterval(play, REPLAY_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <svg
      key={playCount}
      className="intro-line"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="intro-line-path" d={buildStringPath()} fill="none" stroke="var(--navy)" strokeWidth="4" />
      {flags.map((flag, i) => (
        <g key={i} transform={`translate(${flag.x}, ${flag.y})`}>
          <polygon
            className="intro-flag-piece"
            points="-16,0 16,0 0,30"
            fill={flag.color}
            style={{ animationDelay: `${flag.delay}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
