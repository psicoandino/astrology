export type PlanetCategory = "transpersonal" | "social" | "personal";

export type PlanetDef = {
  key: string;
  name: string;
  sym: string;
  cat: PlanetCategory;
};

export const PLANETS: PlanetDef[] = [
  { key: "Pluto", name: "Pluto", sym: "♇", cat: "transpersonal" },
  { key: "Neptune", name: "Neptune", sym: "♆", cat: "transpersonal" },
  { key: "Uranus", name: "Uranus", sym: "♅", cat: "transpersonal" },
  { key: "Saturn", name: "Saturn", sym: "♄", cat: "social" },
  { key: "Jupiter", name: "Jupiter", sym: "♃", cat: "social" },
  { key: "Mars", name: "Mars", sym: "♂", cat: "personal" },
  { key: "Venus", name: "Venus", sym: "♀", cat: "personal" },
  { key: "Mercury", name: "Mercury", sym: "☿", cat: "personal" },
  { key: "Sun", name: "Sun", sym: "☉", cat: "personal" },
  { key: "Moon", name: "Moon", sym: "☽", cat: "personal" },
];

export const FAST_BODIES = new Set(["Moon", "Mercury", "Venus"]);

export const CAT_META: Record<
  PlanetCategory,
  { label: string; color: string }
> = {
  transpersonal: { label: "TRANSPERSONAL", color: "#7F77DD" },
  social: { label: "SOCIAL", color: "#BA7517" },
  personal: { label: "PERSONAL", color: "#1D9E75" },
};
