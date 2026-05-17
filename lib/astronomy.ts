import {
  Body,
  Ecliptic,
  GeoVector,
  MakeTime,
} from "astronomy-engine";
import { getConstellation, getNextConstellation, getProgress } from "./iau";
import { PLANETS, type PlanetDef } from "./planets";

export type PlanetPosition = PlanetDef & {
  constellation: ReturnType<typeof getConstellation>;
  nextConst: ReturnType<typeof getNextConstellation>;
  degree: string;
  pct: number;
  retro: boolean;
  error?: string;
};

const BODY_MAP: Record<string, Body> = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

function getLongitude(key: string, date: Date): number {
  const body = BODY_MAP[key];
  if (!body) throw new Error(`Unknown body: ${key}`);
  const t = MakeTime(date);
  const vec = GeoVector(body, t, true);
  const ecl = Ecliptic(vec);
  let lon = ecl.elon % 360;
  if (lon < 0) lon += 360;
  return lon;
}

function isRetrograde(key: string, date: Date): boolean {
  if (key === "Sun" || key === "Moon") return false;
  try {
    const past = new Date(date.getTime() - 86400000);
    const lon1 = getLongitude(key, past);
    const lon2 = getLongitude(key, date);
    let delta = lon2 - lon1;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta < 0;
  } catch {
    return false;
  }
}

export function calcPositions(date: Date): PlanetPosition[] {
  return PLANETS.map((p) => {
    try {
      const body = BODY_MAP[p.key];
      if (!body) throw new Error(`Unknown body: ${p.key}`);
      const t = MakeTime(date);
      const vec = GeoVector(body, t, true);
      const ecl = Ecliptic(vec);
      let lon = ecl.elon % 360;
      if (lon < 0) lon += 360;
      const c = getConstellation(lon);
      const next = getNextConstellation(c);
      const localDeg =
        c.name === "Pisces"
          ? lon >= 348.7
            ? lon - 348.7
            : lon + (360 - 348.7)
          : lon - c.start;
      const retro = isRetrograde(p.key, date);
      return {
        ...p,
        constellation: c,
        nextConst: next,
        degree: localDeg.toFixed(1),
        pct: getProgress(lon, c),
        retro,
      };
    } catch (e) {
      return {
        ...p,
        constellation: getConstellation(0),
        nextConst: getNextConstellation(getConstellation(0)),
        degree: "0",
        pct: 0,
        retro: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });
}
