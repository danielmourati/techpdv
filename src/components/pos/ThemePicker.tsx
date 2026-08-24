import { Check, Palette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { DEFAULT_THEME, THEME_PALETTES } from "@/data/theme-palettes";

const SEMANTIC = [
  { hex: "#22C55E", label: "Verde", use: "Sucesso, pagamento aprovado, adicionar item" },
  { hex: "#EF4444", label: "Vermelho", use: "Cancelar venda, excluir item, estorno, erro" },
  { hex: "#F59E0B", label: "Âmbar", use: "Aguardando pagamento, estoque baixo, venda suspensa" },
];

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {THEME_PALETTES.map((palette) => {
          const selected = palette.id === theme;
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => setTheme(palette.id)}
              aria-pressed={selected}
              className={cn(
                "group relative flex flex-col gap-3 rounded-md border p-3 text-left transition-all",
                selected
                  ? "border-primary ring-2 ring-ring/40"
                  : "border-border hover:border-primary/50",
              )}
            >
              {selected && (
                <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}

              {/* Miniatura da paleta */}
              <div
                className="overflow-hidden rounded-sm border border-border"
                style={{ backgroundColor: palette.swatches.background }}
              >
                <div className="space-y-2 p-3">
                  <div
                    className="space-y-1.5 rounded-sm p-2"
                    style={{ backgroundColor: palette.swatches.surface }}
                  >
                    <div
                      className="h-1.5 w-16 rounded-full"
                      style={{ backgroundColor: palette.swatches.text }}
                    />
                    <div
                      className="h-1.5 w-10 rounded-full opacity-50"
                      style={{ backgroundColor: palette.swatches.text }}
                    />
                  </div>
                  <div
                    className="h-6 rounded-sm"
                    style={{ backgroundColor: palette.swatches.action }}
                  />
                </div>
              </div>

              <div>
                <p className="font-display text-sm font-bold tracking-tight">{palette.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {palette.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {Object.values(palette.swatches).map((hex) => (
                  <span
                    key={hex}
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setTheme(DEFAULT_THEME)}
        >
          <RotateCcw className="size-3.5" />
          Restaurar padrão
        </Button>
        <p className="text-[11px] text-muted-foreground">
          A troca é aplicada imediatamente em todo o sistema e fica salva neste terminal.
        </p>
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-3">
        <p className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider">
          <Palette className="size-3.5" />
          Cores semânticas reservadas
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Independente da paleta escolhida, estas cores são exclusivas das ações universais do PDV.
        </p>
        <ul className="mt-3 space-y-2">
          {SEMANTIC.map((item) => (
            <li key={item.hex} className="flex items-center gap-2.5">
              <span
                className="size-4 shrink-0 rounded-sm border border-border"
                style={{ backgroundColor: item.hex }}
              />
              <span className="num text-[11px] font-semibold">{item.hex}</span>
              <span className="text-[11px] text-muted-foreground">{item.use}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
