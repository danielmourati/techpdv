import { MOCK_PRODUCTS, type Product } from "@/data/mock-products";
import { brl } from "@/lib/format";
import { Panel } from "./Panel";

export function QuickAddGrid({ onAdd }: { onAdd: (product: Product) => void }) {
  const products = MOCK_PRODUCTS.filter((p) => p.quickAdd);

  return (
    <Panel title="Adição rápida" className="min-h-0" bodyClassName="min-h-0 p-2">
      <div className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onAdd(p)}
            className="flex min-w-0 flex-col justify-between gap-1 rounded-sm border border-border bg-surface px-3 py-2 text-left transition-colors hover:border-primary hover:bg-accent"
          >
            <span className="line-clamp-2 font-display text-xs font-semibold uppercase leading-tight text-surface-foreground">
              {p.name}
            </span>
            <span className="num text-sm font-bold text-primary">{brl(p.price)}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
