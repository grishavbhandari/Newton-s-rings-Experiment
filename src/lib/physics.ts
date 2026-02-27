export const MEDIA = {
  air: { name: 'Air', mu: 1.0, description: 'No medium' },
  water: { name: 'Water', mu: 1.333, description: 'μ = 1.333' },
  glycerin: { name: 'Glycerin', mu: 1.473, description: 'μ = 1.473' },
  turpentineOil: { name: 'Turpentine Oil', mu: 1.470, description: 'μ = 1.470' },
  cedarOil: { name: 'Cedar Oil', mu: 1.516, description: 'μ = 1.516' },
} as const;

export type MediumKey = keyof typeof MEDIA;

export const R_CURVATURE = 100; // cm
export const LAMBDA = 5.893e-5; // cm (sodium D-line)
export const CENTER_POS = 3.500; // cm on microscope scale
export const LEAST_COUNT = 0.001; // cm

export function ringRadius(n: number, mu: number): number {
  return Math.sqrt(n * R_CURVATURE * LAMBDA / mu);
}

export function ringDiameter(n: number, mu: number): number {
  return 2 * ringRadius(n, mu);
}

export interface MicroscopeReading {
  msr: number;
  vsr: number;
  total: number;
}

export function getMicroscopeReading(position: number): MicroscopeReading {
  const msr = Math.floor(position * 10) / 10;
  const vsr = Math.round((position - msr) * 1000);
  const total = parseFloat((msr + vsr * LEAST_COUNT).toFixed(4));
  return { msr, vsr, total };
}

export function getLeftReading(n: number, mu: number): MicroscopeReading {
  return getMicroscopeReading(CENTER_POS - ringRadius(n, mu));
}

export function getRightReading(n: number, mu: number): MicroscopeReading {
  return getMicroscopeReading(CENTER_POS + ringRadius(n, mu));
}

export function getDiameter(left: MicroscopeReading, right: MicroscopeReading): number {
  return parseFloat((right.total - left.total).toFixed(4));
}

export interface RingMeasurement {
  n: number;
  left: MicroscopeReading;
  right: MicroscopeReading;
  diameter: number;
  dSquared: number;
}

export function getRingMeasurements(mu: number, maxRings = 20): RingMeasurement[] {
  return Array.from({ length: maxRings }, (_, i) => {
    const n = i + 1;
    const left = getLeftReading(n, mu);
    const right = getRightReading(n, mu);
    const diameter = getDiameter(left, right);
    return { n, left, right, diameter, dSquared: parseFloat((diameter * diameter).toFixed(7)) };
  });
}
