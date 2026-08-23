import productPlaceholder from "@/assets/product-placeholder.jpg";
import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";
import { Panel } from "./Panel";

export function CurrentProduct({ item }: { item: SaleItem | null }) {
  return (
    <Panel title="Produto atual" bodyClassName="p-3">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item ? `Cód. ${item.code}` : "Nenhum item lançado"}
          </p>
          <p className="num truncate font-display text-3xl font-bold uppercase leading-tight text-foreground lg:text-4xl">
            {item ? `${qty(item.quantity)} × ${item.name}` : "—"}
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-sm bg-surface px-3 py-2">
              <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Quantidade
              </dt>
              <dd className="num text-lg font-semibold">{item ? qty(item.quantity) : "0"}</dd>
            </div>
            <div className="rounded-sm bg-surface px-3 py-2">
              <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Valor unitário
              </dt>
              <dd className="num text-lg font-semibold">{brl(item?.price ?? 0)}</dd>
            </div>
            <div className="rounded-sm bg-primary px-3 py-2 text-primary-foreground">
              <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] opacity-80">
                Total do item
              </dt>
              <dd className="num text-lg font-bold">
                {brl(item ? item.price * item.quantity : 0)}
              </dd>
            </div>
          </dl>
        </div>
        <img
          src={productPlaceholder}
          alt={item ? `Imagem do produto ${item.name}` : "Imagem do produto"}
          className="hidden size-28 shrink-0 rounded-sm border border-border object-cover sm:block lg:size-36"
          loading="lazy"
        />
      </div>
    </Panel>
  );
}
