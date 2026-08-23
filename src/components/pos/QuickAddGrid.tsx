import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";
import { MOCK_PRODUCTS, type Product } from "@/data/mock-products";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 8;

export function QuickAddGrid({ onAdd }: { onAdd: (product: Product) => void }) {
  const products = MOCK_PRODUCTS.filter((p) => p.quickAdd);
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 px-3 pt-3">
        <div className="min-w-0">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
            Produtos · carregamento ajax
          </p>
          <p className="truncate font-display text-base font-semibold">
            Toque para lançar rapidamente
          </p>
        </div>
        <span className="num shrink-0 text-[11px] text-muted-foreground">
          {products.length} produto(s)
        </span>
      </div>

      <div className="min-h-0 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd(p)}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-card px-2 py-2 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <img
                src={productPlaceholder}
                alt=""
                aria-hidden
                className="size-10 shrink-0 rounded-sm object-contain"
                loading="lazy"
              />
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-bold uppercase">
                  {p.name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">Produto</span>
              </span>
              <span className="num shrink-0 text-sm font-bold text-primary">{brl(p.price)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-border px-3 py-2">
        <Button
          type="button"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="h-9 shrink-0 gap-1 rounded-md text-xs"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <div className="min-w-0 text-center">
          <p className="num truncate text-xs font-semibold">
            Página {page} de {pages}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            Page Up / Page Down · sem recarregar a tela
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={page === pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          className="h-9 shrink-0 gap-1 rounded-md text-xs"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
