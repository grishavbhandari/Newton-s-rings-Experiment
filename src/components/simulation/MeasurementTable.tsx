import { useMemo } from 'react';
import { getRingMeasurements, MEDIA, type MediumKey } from '@/lib/physics';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Props {
  medium: MediumKey;
  selectedRing: number;
  maxRings?: number;
}

export function MeasurementTable({ medium, selectedRing, maxRings = 15 }: Props) {
  const data = useMemo(() => getRingMeasurements(MEDIA[medium].mu, maxRings), [medium, maxRings]);

  return (
    <div className="overflow-x-auto">
      <div className="text-xs text-muted-foreground mb-2 font-mono">
        Medium: {MEDIA[medium].name} (μ = {MEDIA[medium].mu})
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-12">n</TableHead>
            <TableHead className="text-center">L-MSR</TableHead>
            <TableHead className="text-center">L-VSR</TableHead>
            <TableHead className="text-center">L-Total</TableHead>
            <TableHead className="text-center">R-MSR</TableHead>
            <TableHead className="text-center">R-VSR</TableHead>
            <TableHead className="text-center">R-Total</TableHead>
            <TableHead className="text-center">D (cm)</TableHead>
            <TableHead className="text-center">D² (cm²)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.n}
              className={row.n === selectedRing ? 'highlight-row font-semibold' : ''}
            >
              <TableCell className="text-center font-mono font-bold">{row.n}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.left.msr.toFixed(1)}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.left.vsr}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.left.total.toFixed(3)}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.right.msr.toFixed(1)}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.right.vsr}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.right.total.toFixed(3)}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.diameter.toFixed(4)}</TableCell>
              <TableCell className="text-center font-mono text-xs">{row.dSquared.toFixed(6)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
