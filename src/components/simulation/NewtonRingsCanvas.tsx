import { useEffect, useRef, useCallback } from 'react';
import { ringRadius, R_CURVATURE, LAMBDA, MEDIA, type MediumKey } from '@/lib/physics';

interface Props {
  medium: MediumKey;
  selectedRing: number;
  isDark: boolean;
}

export function NewtonRingsCanvas({ medium, selectedRing, isDark }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const mu = MEDIA[medium].mu;

    const maxR = ringRadius(22, mu);
    const scale = (Math.min(W, H) / 2 - 12) / maxR;

    const imageData = ctx.createImageData(W, H);
    const d = imageData.data;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const rPx = Math.sqrt(dx * dx + dy * dy);
        const rCm = rPx / scale;

        const phase = Math.PI * mu * rCm * rCm / (R_CURVATURE * LAMBDA);
        const intensity = Math.pow(Math.sin(phase), 2);

        const dist = rPx / (Math.min(W, H) / 2);
        const vignette = Math.max(0, 1 - Math.pow(dist, 2.5));

        const idx = (y * W + x) * 4;

        if (isDark) {
          d[idx]     = Math.round(intensity * 245 * vignette);
          d[idx + 1] = Math.round(intensity * 195 * vignette);
          d[idx + 2] = Math.round(intensity * 35 * vignette);
        } else {
          const bg = 250;
          const ring = bg - intensity * 210;
          const v = ring * vignette + bg * (1 - vignette);
          d[idx]     = Math.round(v);
          d[idx + 1] = Math.round(v * 0.96);
          d[idx + 2] = Math.round(v * 0.89);
        }
        d[idx + 3] = 255;

        if (dist > 0.95) {
          d[idx + 3] = Math.round(Math.max(0, (1 - dist) / 0.05) * 255);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Ring number labels
    ctx.textAlign = 'left';
    for (let n = 1; n <= 20; n++) {
      const rPx = ringRadius(n, mu) * scale;
      if (rPx < W / 2 - 25 && (n <= 6 || n % 2 === 0)) {
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
        ctx.font = '9px sans-serif';
        ctx.fillText(`${n}`, cx + rPx + 2, cy - 3);
      }
    }

    // Crosswire
    if (selectedRing >= 1 && selectedRing <= 20) {
      const ringR = ringRadius(selectedRing, mu) * scale;
      const col = isDark ? '#ef4444' : '#dc2626';

      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);

      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - ringR, cy - 50); ctx.lineTo(cx - ringR, cy + 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + ringR, cy - 50); ctx.lineTo(cx + ringR, cy + 50); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = col;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`n = ${selectedRing}`, cx + ringR, cy - 55);
      ctx.fillText(`n = ${selectedRing}`, cx - ringR, cy - 55);
    }
  }, [medium, selectedRing, isDark]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={420}
      height={420}
      className="w-full max-w-[420px] mx-auto rounded-xl border border-border"
    />
  );
}
