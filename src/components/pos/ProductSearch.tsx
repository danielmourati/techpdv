import { forwardRef, useMemo, useState } from "react";
import { Barcode, Search } from "lucide-react";
import { searchProducts, type Product } from "@/data/mock-products";
import { brl } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyHint } from "./KeyHint";

type Props = {
  onAdd: (product: Product, quantity: number, price?: number) => void;
};

export const ProductSearch = forwardRef<HTMLInputElement, Props>(function ProductSearch(
  { onAdd },
  ref,
) {
  const [term, setTerm] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const results = useMemo(() => searchProducts(term), [term]);

  const commit = (product: Product) => {
    const q = Number(quantity.replace(",", ".")) || 1;
    const p = price ? Number(price.replace(",", ".")) : undefined;
    onAdd(product, q, p);
    setTerm("");
    setQuantity("1");
    setPrice("");
  };

  return (
    <div className="relative rounded-md border border-border bg-card p-3">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_7rem_9rem_auto]">
        <div className="relative min-w-0">
          <Barcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={ref}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                e.preventDefault();
                commit(results[0]);
              }
            }}
            placeholder="Digite ou leia o produto"
            aria-label="Digite ou leia o produto"
            className="h-12 rounded-sm border-input pl-9 font-display text-base uppercase tracking-wide"
          />
        </div>
        <Input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          inputMode="decimal"
          aria-label="Quantidade"
          placeholder="Qtd"
          className="num h-12 rounded-sm text-center text-base"
        />
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          aria-label="Valor unitário"
          placeholder="Valor R$"
          className="num h-12 rounded-sm text-center text-base"
        />
        <Button
          type="button"
          disabled={!results[0]}
          onClick={() => results[0] && commit(results[0])}
          className="h-12 gap-2 rounded-sm font-display uppercase tracking-[0.1em]"
        >
          <Search className="size-4" />
          Lançar
          <KeyHint>Enter</KeyHint>
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="absolute left-3 right-3 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-sm border border-border bg-popover shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => commit(p)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 text-left hover:bg-accent"
              >
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-semibold uppercase">
                    {p.name}
                  </span>
                  <span className="num block text-xs text-muted-foreground">
                    {p.code} · estoque {p.stock} {p.unit}
                  </span>
                </span>
                <span className="num shrink-0 text-sm font-semibold">{brl(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
