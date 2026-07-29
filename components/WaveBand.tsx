import { Sailboat } from "./HeroBanner";

const WIDTH = 1440;
const HEIGHT = 130;
const CYCLES = 2;

function waveY(x: number, amplitude: number, baseline: number, phase: number) {
  return baseline + amplitude * Math.sin((x / WIDTH) * Math.PI * 2 * CYCLES + phase);
}

// A closed shape tracing the wavy line across the top then straight across
// the bottom, so it fills solid as a sea rather than rendering as a stroke.
function buildWaveFill(amplitude: number, baseline: number, phase: number) {
  const points: string[] = [`M 0 ${HEIGHT}`];
  for (let x = 0; x <= WIDTH; x += 16) {
    points.push(`L ${x.toFixed(0)} ${waveY(x, amplitude, baseline, phase).toFixed(1)}`);
  }
  points.push(`L ${WIDTH} ${HEIGHT}`, "Z");
  return points.join(" ");
}

const BACK_PATH = buildWaveFill(12, 55, 0);
const FRONT_PATH = buildWaveFill(9, 78, Math.PI / 2);

const boats: Array<{ leftPct: number; variant: "blue" | "gold" | "red"; size: number; bob: "a" | "b" | "c" | "d" }> = [
  { leftPct: 14, variant: "blue", size: 40, bob: "a" },
  { leftPct: 47, variant: "gold", size: 50, bob: "c" },
  { leftPct: 80, variant: "red", size: 38, bob: "b" },
];

export function WaveBand() {
  return (
    <div className="wave-band" aria-hidden="true">
      <div className="wave-band-layer wave-band-back">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="wave-band-svg">
          <path d={BACK_PATH} fill="var(--sky)" opacity="0.5" />
        </svg>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="wave-band-svg">
          <path d={BACK_PATH} fill="var(--sky)" opacity="0.5" />
        </svg>
      </div>

      <div className="wave-band-boats">
        {boats.map((boat, i) => (
          <div key={i} className="wave-band-boat" style={{ left: `${boat.leftPct}%` }}>
            <Sailboat variant={boat.variant} size={boat.size} bob={boat.bob} />
          </div>
        ))}
      </div>

      <div className="wave-band-layer wave-band-front">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="wave-band-svg">
          <path d={FRONT_PATH} fill="var(--navy)" />
        </svg>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="wave-band-svg">
          <path d={FRONT_PATH} fill="var(--navy)" />
        </svg>
      </div>
    </div>
  );
}
