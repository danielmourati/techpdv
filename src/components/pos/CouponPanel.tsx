import { Banknote, CheckCircle2, Minus, Plus, QrCode, Receipt, Trash2 } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";
import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CouponPanel({
  items,
  total,
  currentItemId,
  onChangeQuantity,
  onRemove,
  onSelect,
  onClear,
  onFinish,
  onCash,
  onPix,
}: {
  items: SaleItem[];
  total: number;
  currentItemId: string | null;
  onChangeQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onClear: () => void;
  onFinish: () => void;
  onCash: () => void;
  onPix: () => void;
}) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden rounded-md border border-border bg-card">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3 py-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <Receipt className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            Cupom da venda
          </p>
          <p className="num truncate font-display text-lg font-bold leading-tight">
            {items.length} produto(s)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Limpar cupom"
          onClick={onClear}
          className="size-9 shrink-0 rounded-md border-destructive/30 bg-destructive/10 text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_5rem_2rem] items-center gap-2 border-b border-border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span>Produto</span>
        <span className="text-center">Qtd.</span>
        <span className="text-right">Unit.</span>
        <span className="text-right">Total</span>
        <span className="sr-only">Ações</span>
      </div>

      <ul className="min-h-0 divide-y divide-border overflow-y-auto">
        {items.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-muted-foreground">
            Nenhum item no cupom.
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "grid cursor-pointer grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_5rem_2rem] items-center gap-2 px-3 py-2",
              item.id === currentItemId ? "bg-primary/5" : "hover:bg-surface",
            )}
          >
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <img
                src={productPlaceholder}
                alt=""
                aria-hidden
                className="size-9 shrink-0 rounded-sm object-contain"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold uppercase text-primary">
                  {item.name}
                </p>
                <p className="num truncate text-[11px] text-muted-foreground">{item.code}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              {/* itens por peso ajustam em 0,100 kg */}
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Diminuir quantidade de ${item.name}`}
                className="size-6 shrink-0 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeQuantity(item.id, item.unit === "KG" ? -0.1 : -1);
                }}
              >
                <Minus className="size-3" />
              </Button>
              <span className="num w-12 rounded-md border border-border py-0.5 text-center text-xs font-bold">
                {qty(item.quantity)}
                {item.unit === "KG" ? " kg" : ""}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Aumentar quantidade de ${item.name}`}
                className="size-6 shrink-0 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeQuantity(item.id, item.unit === "KG" ? 0.1 : 1);
                }}
              >
                <Plus className="size-3" />
              </Button>
            </div>

            <span className="num truncate text-right text-xs text-muted-foreground">
              {brl(item.price)}
              {item.unit === "KG" ? "/kg" : ""}
            </span>
            <span className="num truncate text-right text-sm font-bold text-primary">
              {brl(item.price * item.quantity)}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remover ${item.name}`}
              className="size-7 shrink-0 rounded-md text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        ))}
      </ul>

      <footer className="grid gap-2 border-t border-border p-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5">
          <span className="truncate font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Cliente
          </span>
          <span className="shrink-0 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
            Consumidor final
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md bg-primary px-3 py-2 text-primary-foreground">
          <span className="truncate font-display text-[11px] font-bold uppercase tracking-[0.14em]">
            Total da venda
          </span>
          <span className="num shrink-0 font-display text-2xl font-bold">{brl(total)}</span>
        </div>

        <Button
          type="button"
          onClick={onFinish}
          disabled={items.length === 0}
          className="h-12 gap-2 rounded-md bg-success text-success-foreground hover:bg-success/90"
        >
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="grid text-left">
            <span className="font-display text-sm font-bold leading-tight">Finalizar venda</span>
            <span className="text-[10px] leading-tight opacity-80">F10 ou Enter</span>
          </span>
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCash}
            className="h-10 gap-2 rounded-md text-xs font-semibold"
          >
            <Banknote className="size-4" />
            Dinheiro
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onPix}
            className="h-10 gap-2 rounded-md text-xs font-semibold"
          >
            <QrCode className="size-4" />
            PIX Checkout
          </Button>
        </div>
      </footer>
    </section>
  );
}
