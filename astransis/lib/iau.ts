export type Constellation = {
  name: string;
  short: string;
  /** Monospace glyph (keyboard-safe, no emoji) */
  sym: string;
  start: number;
  end: number;
};

export const IAU: Constellation[] = [
  { name: "Aries", short: "Aries", sym: "♈️", start: 29.0, end: 53.5 },
  { name: "Taurus", short: "Taurus", sym: "♉️", start: 53.5, end: 90.2 },
  { name: "Gemini", short: "Gemini", sym: "♊️", start: 90.2, end: 118.1 },
  { name: "Cancer", short: "Cancer", sym: "♋️", start: 118.1, end: 138.2 },
  { name: "Leo", short: "Leo", sym: "♌️", start: 138.2, end: 173.9 },
  { name: "Virgo", short: "Virgo", sym: "♍️", start: 173.9, end: 218.0 },
  { name: "Libra", short: "Libra", sym: "♎️", start: 218.0, end: 241.0 },
  { name: "Scorpius", short: "Scorpius", sym: "♏️", start: 241.0, end: 247.7 },
  { name: "Ophiuchus", short: "Ophiuch.", sym: "⛎", start: 247.7, end: 266.3 },
  { name: "Sagittarius", short: "Sagitt.", sym: "♐️", start: 266.3, end: 299.7 },
  { name: "Capricornus", short: "Capric.", sym: "♑️", start: 299.7, end: 327.6 },
  { name: "Aquarius", short: "Aquarius", sym: "♒️", start: 327.6, end: 348.7 },
  { name: "Pisces", short: "Pisces", sym: "♓️", start: 348.7, end: 389.0 },
];

export function getConstellation(lon: number): Constellation {
  if (lon >= 348.7 || lon < 29.0) return IAU[12];
  return IAU.find((b) => lon >= b.start && lon < b.end) ?? IAU[12];
}

export function getNextConstellation(c: Constellation): Constellation {
  const i = IAU.findIndex((b) => b.name === c.name);
  return IAU[(i + 1) % IAU.length];
}

export function getProgress(lon: number, c: Constellation): number {
  let deg: number;
  let span: number;
  if (c.name === "Pisces") {
    deg = lon >= 348.7 ? lon - 348.7 : lon + (360 - 348.7);
    span = 29.0 + (360 - 348.7);
  } else {
    deg = lon - c.start;
    span = c.end - c.start;
  }
  return Math.min(100, Math.max(0, (deg / span) * 100));
}
