import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getStoredSettings,
  saveStoredSettings,
  type StoreSettings,
} from "@/data/mock-settings";
import { DEFAULT_THEME, getPalette, type ThemeId } from "@/data/theme-palettes";

type SettingsContextType = {
  /** Estado de trabalho (pode conter alterações não salvas). */
  settings: StoreSettings;
  /** Última versão persistida no localStorage. */
  saved: StoreSettings;
  dirty: boolean;
  update: (patch: Partial<StoreSettings>) => void;
  save: () => void;
  discard: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", getPalette(theme).isDark);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<StoreSettings>(() => getStoredSettings());
  const [settings, setSettings] = useState<StoreSettings>(saved);

  // Hidrata do localStorage depois do SSR e mantém sincronizado entre abas/telas.
  useEffect(() => {
    const stored = getStoredSettings();
    setSaved(stored);
    setSettings(stored);

    const onUpdate = () => {
      const next = getStoredSettings();
      setSaved(next);
      setSettings(next);
    };
    window.addEventListener("meupdv_settings_updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("meupdv_settings_updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  // Tema tem preview imediato a partir do estado de trabalho.
  useEffect(() => {
    applyTheme(settings.theme ?? DEFAULT_THEME);
  }, [settings.theme]);

  const update = useCallback((patch: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(() => {
    setSettings((current) => {
      saveStoredSettings(current);
      setSaved(current);
      return current;
    });
  }, []);

  const discard = useCallback(() => {
    setSaved((current) => {
      setSettings(current);
      return current;
    });
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(saved),
    [settings, saved],
  );

  const value = useMemo(
    () => ({ settings, saved, dirty, update, save, discard }),
    [settings, saved, dirty, update, save, discard],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
