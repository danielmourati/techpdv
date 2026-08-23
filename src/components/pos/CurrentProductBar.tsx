import { ScanBarcode } from "lucide-react";
import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";

export function CurrentProductBar({ item }: { item: SaleItem | null }) {
  return (
    <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-primary px-2 py-2 text-primary-foreground sm:gap-3 sm:px-3">
      <div className="hidden shrink-0 items-center gap-2 rounded-md bg-primary-foreground px-3 py-2 text-primary md:flex">
        <ScanBarcode className="size-5 shrink-0" />
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.12em]">
            Produto atual
          </p>
          <p className="text-[11px] text-muted-foreground">
            {item ? "Item lançado no cupom" : "Aguardando leitura"}
          </p>
        </div>
      </div>

      <div className="min-w-0 rounded-md bg-primary-foreground px-4 py-2 text-center text-foreground">
        <p className="num truncate font-display text-2xl font-bold leading-tight lg:text-3xl">
          {item ? (
            <>
              {qty(item.quantity)} <span className="opacity-50">×</span> {item.name}
            </>
          ) : (
            "Nenhum item lançado"
          )}
        </p>
        <p className="num text-[11px] text-muted-foreground">
          {item ? `Código ${item.code}` : "Leia o código de barras para começar"}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">
          Total do item
        </p>
        <p className="num font-display text-2xl font-bold leading-tight lg:text-3xl">
          {brl(item ? item.price * item.quantity : 0)}
        </p>
      </div>
    </div>
  );
}
