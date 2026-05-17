/** UI symbols (keyboard / typographic — no emoji) */
export const UI = {
  refresh: "↻",
  live: "◎",
  date: "◷",
  download: "↓",
  loading: "…",
  earth: "⊕",
  retro: "℞",
  arrow: "→",
  themeLight: "○",
  themeDark: "●",
  ok: "+",
  fail: "×",
} as const;

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("true-spaces-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("true-spaces-theme", theme);
}

export function captureBackground(theme: Theme) {
  return theme === "dark" ? "#1a1a1c" : "#ffffff";
}
