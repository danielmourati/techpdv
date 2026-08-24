import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getStoredSettings, saveStoredSettings } from "@/data/mock-settings";
import { DEFAULT_THEME, getPalette, type ThemeId } from "@/data/theme-palettes";

type ThemeContextType = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyToDocument(theme: ThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", getPalette(theme).isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  // Applied after hydration to avoid SSR/client mismatch.
  useEffect(() => {
    const stored = getStoredSettings().theme ?? DEFAULT_THEME;
    setThemeState(stored);
    applyToDocument(stored);

    const onUpdate = () => {
      const next = getStoredSettings().theme ?? DEFAULT_THEME;
      setThemeState(next);
      applyToDocument(next);
    };
    window.addEventListener("meupdv_settings_updated", onUpdate);
    return () => window.removeEventListener("meupdv_settings_updated", onUpdate);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    applyToDocument(id);
    saveStoredSettings({ ...getStoredSettings(), theme: id });
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
