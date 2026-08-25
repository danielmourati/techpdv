import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import productPlaceholderAsset from "@/assets/produto-sem-foto.png.asset.json";
const productPlaceholder = productPlaceholderAsset.url;
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
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-card/30">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 pt-3 pb-2 border-b border-border/40">
        <div className="min-w-0">
          <p className="font-display text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            Atalhos de Venda Rápida
          </p>
          <p className="truncate font-display text-xs sm:text-sm font-semibold text-muted-foreground">
            Toque no card para lançar no cupom
          </p>
        </div>
        <span className="num shrink-0 text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/40">
          {products.length} atalhos
        </span>
      </div>

      <div className="min-h-0 overflow-y-auto p-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {visible.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdd(p)}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-3 text-left transition-all duration-200 hover:border-primary hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {/* Product Image on Top (Square container) */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface p-2 border border-border/40 flex items-center justify-center mb-2.5">
                <img
                  src={p.imageUrl || productPlaceholder}
                  alt={p.name}
                  aria-hidden
                  className="size-full object-contain transition-transform duration-300 group-hover:scale-108"
                  loading="lazy"
                />
                {p.soldByWeight && (
                  <span className="absolute top-1.5 right-1.5 rounded-md bg-warning/90 px-1.5 py-0.5 font-display text-[10px] font-black uppercase text-warning-foreground shadow-2xs">
                    Kg
                  </span>
                )}
              </div>

              {/* Product Info at Bottom */}
              <div className="w-full flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-extrabold uppercase leading-snug text-foreground line-clamp-2 break-words group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">
                    {p.category}
                  </p>
                </div>

                {/* Price and Plus Button Row */}
                <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-border/40">
                  <div className="min-w-0">
                    <span className="num font-display text-sm sm:text-base font-black text-primary">
                      {brl(p.price)}
                    </span>
                    {p.soldByWeight && (
                      <span className="text-[10px] text-muted-foreground font-semibold ml-0.5">
                        /kg
                      </span>
                    )}
                  </div>

                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                    <Plus className="size-4 stroke-[3]" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-border px-4 py-2.5 bg-card/60">
        <Button
          type="button"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="h-9 shrink-0 gap-1.5 rounded-lg text-xs font-bold"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <div className="min-w-0 text-center">
          <p className="num truncate text-xs font-bold text-foreground">
            Página {page} de {pages}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={page === pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          className="h-9 shrink-0 gap-1.5 rounded-lg text-xs font-bold"
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
