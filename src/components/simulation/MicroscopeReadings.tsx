import { useMemo } from 'react';
import { getLeftReading, getRightReading, getDiameter, MEDIA, type MediumKey, LEAST_COUNT } from '@/lib/physics';

interface Props {
  medium: MediumKey;
  ringNumber: number;
}

function ScaleDisplay({ reading, label }: { reading: { msr: number; vsr: number; total: number }; label: string }) {
  const startCm = reading.msr - 0.15;
  const rangeCm = 0.4;
  const W = 360;
  const pxPerCm = W / rangeCm;
  const readingX = (reading.total - startCm) * pxPerCm;

  return (
    <div className="mb-5">
      <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</h4>
      <svg viewBox={`0 0 ${W} 65`} className="w-full">
        <rect x={0} y={14} width={W} height={22} rx={3} className="fill-secondary" />
        <rect x={0} y={14} width={W} height={22} rx={3} className="stroke-border" fill="none" strokeWidth={1} />

        {Array.from({ length: Math.ceil(rangeCm * 10) + 1 }, (_, i) => {
          const cm = parseFloat((startCm + i * 0.1).toFixed(1));
          const x = (cm - startCm) * pxPerCm;
          if (x < -5 || x > W + 5) return null;
          const isMajor = Math.round(cm * 100) % 50 === 0;
          return (
            <g key={i}>
              <line x1={x} y1={14} x2={x} y2={isMajor ? 30 : 24} className="stroke-foreground" strokeWidth={isMajor ? 1.2 : 0.7} />
              {isMajor && (
                <text x={x} y={11} textAnchor="middle" fontSize={8} className="fill-muted-foreground" fontFamily="JetBrains Mono, monospace">
                  {cm.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}

        <line x1={readingX} y1={10} x2={readingX} y2={42} className="stroke-destructive" strokeWidth={2} />
        <polygon points={`${readingX - 4},42 ${readingX + 4},42 ${readingX},38`} className="fill-destructive" />
        <text x={readingX} y={56} textAnchor="middle" fontSize={10} className="fill-destructive" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          {reading.total.toFixed(3)} cm
        </text>
      </svg>

      <div className="grid grid-cols-3 gap-2 mt-1.5">
        <div className="scale-readout">
          <div className="text-[10px] text-muted-foreground mb-0.5">MSR</div>
          <div className="font-semibold">{reading.msr.toFixed(1)} cm</div>
        </div>
        <div className="scale-readout">
          <div className="text-[10px] text-muted-foreground mb-0.5">VSR (div)</div>
          <div className="font-semibold">{reading.vsr}</div>
        </div>
        <div className="scale-readout">
          <div className="text-[10px] text-muted-foreground mb-0.5">Total</div>
          <div className="font-semibold">{reading.total.toFixed(3)} cm</div>
        </div>
      </div>
    </div>
  );
}

export function MicroscopeReadings({ medium, ringNumber }: Props) {
  const mu = MEDIA[medium].mu;

  const { left, right, diameter } = useMemo(() => {
    const l = getLeftReading(ringNumber, mu);
    const r = getRightReading(ringNumber, mu);
    return { left: l, right: r, diameter: getDiameter(l, r) };
  }, [ringNumber, mu]);

  return (
    <div>
      <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>Medium: <strong className="text-primary">{MEDIA[medium].name}</strong></span>
          <span>Ring: <strong className="text-primary font-mono">n = {ringNumber}</strong></span>
          <span>LC: <strong className="font-mono">{LEAST_COUNT} cm</strong></span>
        </div>
      </div>

      <ScaleDisplay reading={left} label="← Left Side" />
      <ScaleDisplay reading={right} label="→ Right Side" />

      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center space-y-1">
        <div className="text-xs text-muted-foreground">Diameter = Right − Left</div>
        <div className="font-mono font-bold text-base">
          D<sub>{ringNumber}</sub> = {right.total.toFixed(3)} − {left.total.toFixed(3)} = <span className="text-accent">{diameter.toFixed(4)} cm</span>
        </div>
        <div className="font-mono text-sm text-muted-foreground">
          D<sub>{ringNumber}</sub>² = {(diameter * diameter).toFixed(6)} cm²
        </div>
      </div>
    </div>
  );
}
