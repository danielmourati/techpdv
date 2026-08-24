import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";

export function CurrentProductBar({ item }: { item: SaleItem | null }) {
  return (
    <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-primary px-3 py-3 text-primary-foreground shadow-sm sm:gap-4 sm:px-4">
      <div className="min-w-0 rounded-lg bg-primary-foreground px-4 py-3 text-center text-foreground shadow-xs">
        <p className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Produto atual · {item ? "Item lançado no cupom" : "Aguardando leitura"}
        </p>
        <p className="num truncate font-display text-4xl font-extrabold leading-tight lg:text-5xl 2xl:text-6xl">
          {item ? (
            <>
              {qty(item.quantity)}
              {item.unit === "KG" ? " kg" : ""} <span className="opacity-40">×</span> {item.name}
            </>
          ) : (
            "Nenhum item lançado"
          )}
        </p>
        <p className="num mt-0.5 text-sm font-semibold text-muted-foreground lg:text-base">
          {item
            ? `Código ${item.code} · ${brl(item.price)}${item.unit === "KG" ? " / kg" : " / un"}`
            : "Leia o código de barras ou use F2 para pesquisar"}
        </p>
      </div>

      <div className="shrink-0 pr-1 text-right">
        <p className="font-display text-xs font-extrabold uppercase tracking-wider opacity-90">
          Total do Item
        </p>
        <p className="num font-display text-3xl font-black leading-tight text-primary-foreground lg:text-4xl 2xl:text-5xl">
          {brl(item ? item.price * item.quantity : 0)}
        </p>
      </div>
    </div>
  );
}
