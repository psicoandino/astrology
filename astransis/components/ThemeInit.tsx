"use client";

import { applyTheme, getStoredTheme } from "@/lib/ui";
import { useEffect } from "react";

/** Runs once on client to sync theme before paint flicker. */
export default function ThemeInit() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);
  return null;
}
