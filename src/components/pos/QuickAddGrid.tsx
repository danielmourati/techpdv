import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";
import { getStoredProducts, type Product } from "@/data/mock-products";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 8;

export function QuickAddGrid({ onAdd }: { onAdd: (product: Product) => void }) {
  const [allProducts, setAllProducts] = useState<Product[]>(() => getStoredProducts());

  useEffect(() => {
    const handleUpdate = () => setAllProducts(getStoredProducts());
    window.addEventListener("meupdv_products_updated", handleUpdate);
    return () => window.removeEventListener("meupdv_products_updated", handleUpdate);
  }, []);

  const products = allProducts.filter((p) => p.quickAdd && p.active !== false);
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const [page, setPage] = useState(1);
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 px-3.5 pt-3.5 pb-1">
        <div className="min-w-0">
          <p className="font-display text-xs font-extrabold uppercase tracking-wider text-primary">
            Atalhos de Venda Rápida
          </p>
          <p className="truncate font-display text-base sm:text-lg font-bold text-foreground">
            Toque para lançar rapidamente no cupom
          </p>
        </div>
        <span className="num shrink-0 text-xs font-semibold text-muted-foreground">
          {products.length} produto(s)
        </span>
      </div>

      <div className="min-h-0 overflow-y-auto p-3.5">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd(p)}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
            >
              <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 shadow-2xs">
                <img
                  src={p.imageUrl || productPlaceholder}
                  alt={p.name}
                  aria-hidden
                  className="size-full object-cover transition-transform duration-200 hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="min-w-0">
                <span className="block truncate font-display text-sm sm:text-base font-extrabold uppercase leading-tight text-foreground">
                  {p.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground font-medium">
                  {p.category}
                </span>
              </span>
              <span className="num shrink-0 text-sm sm:text-base font-extrabold text-primary">
                {brl(p.price)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-border px-3.5 py-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="h-10 shrink-0 gap-1.5 rounded-lg text-xs sm:text-sm font-bold"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <div className="min-w-0 text-center">
          <p className="num truncate text-xs sm:text-sm font-bold text-foreground">
            Página {page} de {pages}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Use Page Up / Page Down
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={page === pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          className="h-10 shrink-0 gap-1.5 rounded-lg text-xs sm:text-sm font-bold"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
