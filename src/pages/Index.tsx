import { useState, useEffect, useMemo } from 'react';
import { NewtonRingsCanvas } from '@/components/simulation/NewtonRingsCanvas';
import { MicroscopeReadings } from '@/components/simulation/MicroscopeReadings';
import { MeasurementTable } from '@/components/simulation/MeasurementTable';
import { MEDIA, type MediumKey, ringDiameter, getRingMeasurements } from '@/lib/physics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, FlaskConical, Crosshair, BarChart3, Calculator } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const MEDIUM_KEYS = Object.keys(MEDIA) as MediumKey[];
const LIQUID_KEYS = MEDIUM_KEYS.filter((k) => k !== 'air');

const Index = () => {
  const [medium, setMedium] = useState<MediumKey>('water');
  const [selectedRing, setSelectedRing] = useState(5);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleRingChange = (val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1 && n <= 20) setSelectedRing(n);
  };

  // Graph data
  const graphData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const n = i + 1;
      const dAir = ringDiameter(n, MEDIA.air.mu);
      const dLiq = ringDiameter(n, MEDIA[medium].mu);
      return {
        n,
        'D² Air': parseFloat((dAir * dAir).toFixed(6)),
        [`D² ${MEDIA[medium].name}`]: parseFloat((dLiq * dLiq).toFixed(6)),
      };
    });
  }, [medium]);

  // Refractive index from multiple rings
  const riCalc = useMemo(() => {
    const airData = getRingMeasurements(MEDIA.air.mu, 20);
    const liqData = getRingMeasurements(MEDIA[medium].mu, 20);
    const rows = airData.map((a, i) => {
      const l = liqData[i];
      const mu = a.dSquared / l.dSquared;
      return { n: a.n, dSqAir: a.dSquared, dSqLiq: l.dSquared, mu };
    });
    const meanMu = rows.reduce((s, r) => s + r.mu, 0) / rows.length;
    return { rows, meanMu, knownMu: MEDIA[medium].mu };
  }, [medium]);

  const liquidKey = medium === 'air' ? 'water' : medium;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Newton's Rings</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Virtual Lab — Refractive Index Determination</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Medium:</label>
              <Select value={medium} onValueChange={(v) => setMedium(v as MediumKey)}>
                <SelectTrigger className="w-[160px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIUM_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {MEDIA[k].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Ring n:</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={selectedRing}
                onChange={(e) => handleRingChange(e.target.value)}
                className="w-16 h-8 text-sm font-mono text-center"
              />
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Simulation Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="section-title flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-primary" />
                Interference Pattern — {MEDIA[medium].name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                λ = 5893 Å (Na D-line) · R = 100 cm · Crosswire on ring n = {selectedRing}
              </p>
            </CardHeader>
            <CardContent>
              <NewtonRingsCanvas medium={medium} selectedRing={selectedRing} isDark={isDark} />
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Jump to ring:</span>
                <div className="flex gap-1 flex-wrap justify-center">
                  {[1, 3, 5, 8, 10, 12, 15, 18, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setSelectedRing(n)}
                      className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                        n === selectedRing
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted-foreground/10'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="section-title flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-accent" />
                Travelling Microscope Readings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MicroscopeReadings medium={medium} ringNumber={selectedRing} />
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="section-title">Measurement Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="air" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="air">Air</TabsTrigger>
                {LIQUID_KEYS.map((k) => (
                  <TabsTrigger key={k} value={k}>{MEDIA[k].name}</TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="air">
                <MeasurementTable medium="air" selectedRing={selectedRing} />
              </TabsContent>
              {LIQUID_KEYS.map((k) => (
                <TabsContent key={k} value={k}>
                  <MeasurementTable medium={k} selectedRing={selectedRing} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Graph + Calculations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="section-title flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                D² vs Ring Number (n)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="n" label={{ value: 'Ring Number (n)', position: 'bottom', offset: -2, fontSize: 11 }} tick={{ fontSize: 10 }} />
                  <YAxis label={{ value: 'D² (cm²)', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="D² Air" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 2 }} />
                  {medium !== 'air' && (
                    <Line
                      type="monotone"
                      dataKey={`D² ${MEDIA[medium].name}`}
                      stroke="hsl(185, 55%, 38%)"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                D² is directly proportional to n — the slope gives 4Rλ/μ
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="section-title flex items-center gap-2">
                <Calculator className="h-5 w-5 text-accent" />
                Refractive Index Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theory */}
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-2">
                <p className="font-semibold">Formulae:</p>
                <div className="font-mono text-xs space-y-1 pl-2">
                  <p>D²<sub>n</sub> (air) = 4nRλ</p>
                  <p>D²<sub>n</sub> (liquid) = 4nRλ / μ</p>
                  <p className="text-primary font-bold">∴ μ = D²<sub>n</sub>(air) / D²<sub>n</sub>(liquid)</p>
                </div>
              </div>

              {medium !== 'air' ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-1 px-2 text-center">n</th>
                          <th className="py-1 px-2 text-center">D²(air)</th>
                          <th className="py-1 px-2 text-center">D²({MEDIA[medium].name})</th>
                          <th className="py-1 px-2 text-center">μ = ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riCalc.rows.filter((_, i) => i < 10).map((r) => (
                          <tr key={r.n} className={r.n === selectedRing ? 'highlight-row' : 'border-b border-border/50'}>
                            <td className="py-1 px-2 text-center font-bold">{r.n}</td>
                            <td className="py-1 px-2 text-center">{r.dSqAir.toFixed(6)}</td>
                            <td className="py-1 px-2 text-center">{r.dSqLiq.toFixed(6)}</td>
                            <td className="py-1 px-2 text-center text-primary font-bold">{r.mu.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center space-y-1">
                    <div className="text-xs text-muted-foreground">Mean Refractive Index</div>
                    <div className="text-2xl font-mono font-bold text-primary">
                      μ = {riCalc.meanMu.toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Known value: μ = {riCalc.knownMu} | Error: {(Math.abs(riCalc.meanMu - riCalc.knownMu) / riCalc.knownMu * 100).toFixed(2)}%
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Select a liquid medium from the header to compare with Air and calculate the refractive index.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Theory Footer */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                📖 Theory & Principle
              </summary>
              <div className="mt-3 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  <strong>Newton's rings</strong> are circular interference fringes formed between a plano-convex lens
                  placed on a flat glass plate, illuminated by monochromatic sodium light (λ = 5893 Å).
                </p>
                <p>
                  In reflected light, the center is <strong>dark</strong> (due to the additional π phase shift at the
                  glass-air interface). The dark rings occur where the path difference equals an integral multiple of λ.
                </p>
                <p>
                  The diameter of the n<sup>th</sup> dark ring is D<sub>n</sub> = 2√(nRλ/μ), where R is the radius of
                  curvature of the lens and μ is the refractive index of the medium between the lens and plate.
                </p>
                <p>
                  By measuring ring diameters with air and then with a liquid, we get:
                  <strong className="text-primary"> μ = D²<sub>n</sub>(air) / D²<sub>n</sub>(liquid)</strong>.
                </p>
              </div>
            </details>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
