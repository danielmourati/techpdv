import { useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import { DEFAULT_THEME, type ThemeId } from "@/data/theme-palettes";

/**
 * Tema faz parte das configurações da loja: a escolha altera o estado de
 * trabalho (preview imediato) e é persistida junto com o "Salvar".
 */
export function useTheme() {
  const { settings, update } = useSettings();

  const setTheme = useCallback((id: ThemeId) => update({ theme: id }), [update]);

  return { theme: settings.theme ?? DEFAULT_THEME, setTheme };
}
