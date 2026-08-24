import { ScanBarcode } from "lucide-react";
import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";

export function CurrentProductBar({ item }: { item: SaleItem | null }) {
  return (
    <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-primary px-3 py-3 text-primary-foreground sm:gap-4 sm:px-4 shadow-sm">
      <div className="hidden shrink-0 items-center gap-2.5 rounded-lg bg-primary-foreground px-3.5 py-3 text-primary shadow-xs md:flex">
        <ScanBarcode className="size-7 shrink-0" />
        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-wider">
            Produto Atual
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {item ? "Item lançado no cupom" : "Aguardando leitura"}
          </p>
        </div>
      </div>

      <div className="min-w-0 rounded-lg bg-primary-foreground px-4 py-3.5 text-center text-foreground shadow-xs">
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
        <p className="num text-sm lg:text-base font-semibold text-muted-foreground mt-0.5">
          {item
            ? `Código ${item.code} · ${brl(item.price)}${item.unit === "KG" ? " / kg" : " / un"}`
            : "Leia o código de barras ou use F2 para pesquisar"}
        </p>
      </div>

      <div className="shrink-0 text-right pr-1">
        <p className="font-display text-xs font-extrabold uppercase tracking-wider opacity-90">
          Total do Item
        </p>
        <p className="num font-display text-3xl font-black leading-tight lg:text-4xl 2xl:text-5xl text-primary-foreground">
          {brl(item ? item.price * item.quantity : 0)}
        </p>
      </div>
    </div>
  );
}
