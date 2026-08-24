import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";

export function CurrentProductBar({ item }: { item: SaleItem | null }) {
  return (
    <div className="m-2 flex items-center justify-between gap-3 rounded-lg border-2 border-primary bg-primary-foreground px-3 py-2 text-foreground shadow-sm">
      <div className="min-w-0 flex-1 text-center">
        <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Produto atual
        </p>
        <p className="num truncate font-display text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
          {item ? (
            <>
              {qty(item.quantity)}
              {item.unit === "KG" ? " kg" : ""} <span className="opacity-40">×</span> {item.name}
            </>
          ) : (
            "Nenhum item lançado"
          )}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Total do Item
        </p>
        <p className="num font-display text-xl font-black leading-tight text-primary sm:text-2xl lg:text-3xl">
          {brl(item ? item.price * item.quantity : 0)}
        </p>
      </div>
    </div>
  );
}
