import { forwardRef, useMemo, useState } from "react";
import { Plus, ScanBarcode, Scale, X } from "lucide-react";
import { searchProducts, MOCK_PRODUCTS, type Product } from "@/data/mock-products";
import { brl } from "@/lib/format";
import { parseTerm } from "@/lib/parse-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyHint } from "./KeyHint";

type Props = {
  onAdd: (product: Product, quantity: number, price?: number) => void;
  onWeightRequest: (product: Product, suggestedWeight?: number | null) => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </span>
  );
}

export const ProductSearch = forwardRef<HTMLInputElement, Props>(function ProductSearch(
  { onAdd, onWeightRequest },
  ref,
) {
  const [term, setTerm] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const parsed = useMemo(() => parseTerm(term), [term]);

  const results = useMemo(() => {
    if (parsed.scaleCode) {
      const found = MOCK_PRODUCTS.find((p) => p.code === parsed.scaleCode);
      return found ? [found] : [];
    }
    return searchProducts(parsed.term);
  }, [parsed]);

  const selected = results[0];
  const effectiveQty = parsed.factor ?? Number(quantity.replace(",", ".")) || 1;
  const numPrice = price ? Number(price.replace(",", ".")) : selected?.price ?? 0;

  const reset = () => {
    setTerm("");
    setQuantity("1");
    setPrice("");
  };

  const commit = (product: Product) => {
    if (product.soldByWeight) {
      onWeightRequest(product, parsed.scaleWeight ?? parsed.factor ?? null);
      reset();
      return;
    }
    const p = price ? Number(price.replace(",", ".")) : undefined;
    onAdd(product, effectiveQty, p);
    reset();
  };

  return (
    <div className="relative shrink-0 border-b border-border p-3">
      <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <ScanBarcode className="size-4 shrink-0 text-primary" />
          <span className="truncate font-display text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
            Código de barras, código ou nome · use 3*código para multiplicar
          </span>
        </div>
        <KeyHint className="shrink-0 text-muted-foreground">F2</KeyHint>
      </div>

      <div className="relative">
        <Input
          ref={ref}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && selected) {
              e.preventDefault();
              commit(selected);
            }
          }}
          placeholder="Digite ou leia o produto (ex.: 3*7891000100101)"
          aria-label="Digite ou leia o produto"
          className="h-11 rounded-md border-input pr-28 font-display text-base font-medium placeholder:text-primary/50"
        />
        {parsed.factor !== null && (
          <span className="num absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-2 py-1 font-display text-xs font-bold text-primary-foreground">
            <X className="mr-1 inline size-3" />
            {parsed.factor} un
          </span>
        )}
        {parsed.scaleWeight !== null && (
          <span className="num absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-warning px-2 py-1 font-display text-xs font-bold text-warning-foreground">
            <Scale className="mr-1 inline size-3" />
            {parsed.scaleWeight} kg
          </span>
        )}
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <label className="min-w-0">
          <FieldLabel>Quantidade</FieldLabel>
          <Input
            value={parsed.factor !== null ? String(parsed.factor) : quantity}
            readOnly={parsed.factor !== null}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="decimal"
            aria-label="Quantidade"
            className="num h-11 rounded-md text-base font-semibold"
          />
        </label>
        <label className="min-w-0">
          <FieldLabel>Valor unitário</FieldLabel>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            aria-label="Valor unitário"
            placeholder={brl(selected?.price ?? 0)}
            className="num h-11 rounded-md text-base font-semibold"
          />
        </label>
        <label className="min-w-0">
          <FieldLabel>Valor total</FieldLabel>
          <Input
            readOnly
            value={brl(effectiveQty * numPrice)}
            aria-label="Valor total"
            className="num h-11 rounded-md bg-surface text-base font-semibold"
          />
        </label>
      </div>

      <Button
        type="button"
        disabled={!selected}
        onClick={() => selected && commit(selected)}
        className="mt-2 h-11 w-full gap-2 rounded-md font-display text-sm font-bold"
      >
        <Plus className="size-4" />
        Lançar produto no cupom
      </Button>

      {results.length > 0 && parsed.term.length > 0 && (
        <ul className="absolute left-3 right-3 top-[7.5rem] z-20 max-h-64 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
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
                    {p.soldByWeight && (
                      <span className="ml-2 rounded-sm bg-warning/20 px-1 font-display text-[10px] font-bold uppercase text-warning-foreground">
                        peso
                      </span>
                    )}
                  </span>
                  <span className="num block text-xs text-muted-foreground">
                    {p.code} · estoque {p.stock} {p.unit}
                  </span>
                </span>
                <span className="num shrink-0 text-sm font-semibold">
                  {brl(p.price)}
                  {p.soldByWeight ? "/kg" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
