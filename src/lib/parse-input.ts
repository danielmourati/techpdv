export type ParsedTerm = {
  /** Fator de multiplicação detectado (ex.: "3*7891..." => 3) */
  factor: number | null;
  /** Termo de busca sem o fator */
  term: string;
  /** Peso lido de etiqueta de balança (kg), quando aplicável */
  scaleWeight: number | null;
  /** Código do produto extraído da etiqueta de balança */
  scaleCode: string | null;
};

const FACTOR_RE = /^\s*(\d+(?:[.,]\d+)?)\s*[*xX]\s*(.*)$/;

/**
 * Etiqueta de balança (mock): 2 + 6 dígitos de código + 5 dígitos de peso em gramas.
 * Ex.: 2000001001250 => código 000001, peso 1,250 kg
 */
const SCALE_RE = /^2(\d{6})(\d{5})\d?$/;

export function parseTerm(raw: string): ParsedTerm {
  const value = raw.trim();
  const scale = SCALE_RE.exec(value.replace(/\s/g, ""));
  if (scale) {
    return {
      factor: null,
      term: scale[1] ?? "",
      scaleWeight: Number(scale[2]) / 1000,
      scaleCode: scale[1] ?? null,
    };
  }

  const match = FACTOR_RE.exec(value);
  if (match) {
    const factor = Number((match[1] ?? "1").replace(",", "."));
    return {
      factor: Number.isFinite(factor) && factor > 0 ? factor : null,
      term: (match[2] ?? "").trim(),
      scaleWeight: null,
      scaleCode: null,
    };
  }

  return { factor: null, term: value, scaleWeight: null, scaleCode: null };
}
