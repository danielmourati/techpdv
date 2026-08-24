export type ThemeId = "DARK_OPERACIONAL" | "CLEAN_CORPORATIVA" | "ALTO_CONTRASTE";

export type ThemePalette = {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  swatches: {
    background: string;
    surface: string;
    action: string;
    text: string;
  };
};

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "CLEAN_CORPORATIVA",
    name: "Clean Corporativa",
    description:
      "Varejo tradicional: fundo cinza neve, cartões brancos e azul de confiança nas ações. Ideal para ambientes muito iluminados.",
    isDark: false,
    swatches: {
      background: "#F3F4F6",
      surface: "#FFFFFF",
      action: "#2563EB",
      text: "#1F2937",
    },
  },
  {
    id: "DARK_OPERACIONAL",
    name: "Dark Operacional",
    description:
      "Azul profundo com ciano neon nas ações. Reduz a fadiga ocular do operador em turnos longos.",
    isDark: true,
    swatches: {
      background: "#0A1128",
      surface: "#1E293B",
      action: "#00E5FF",
      text: "#F8F9FA",
    },
  },
  {
    id: "ALTO_CONTRASTE",
    name: "Alto Contraste (Touch)",
    description:
      "Fundo branco, laranja vibrante no checkout e divisores suaves. Feito para PDV touchscreen e alta velocidade.",
    isDark: false,
    swatches: {
      background: "#FFFFFF",
      surface: "#F9FAFB",
      action: "#F97316",
      text: "#111827",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "CLEAN_CORPORATIVA";

export function getPalette(id: ThemeId): ThemePalette {
  return THEME_PALETTES.find((p) => p.id === id) ?? THEME_PALETTES[0]!;
}
