import { Banknote, CheckCircle2, Minus, Plus, QrCode, Receipt, Trash2 } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";
import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

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
  const { saved: settings } = useSettings();
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden rounded-md border border-border bg-card">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3.5 py-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
          <Receipt className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-primary">
            Cupom da Venda
          </p>
          <p className="num truncate font-display text-xl font-extrabold leading-tight">
            {items.length} produto(s)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Limpar cupom"
          onClick={onClear}
          className="size-9 shrink-0 rounded-lg border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
        >
          <Trash2 className="size-4" />
        </Button>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_5.5rem_2rem] items-center gap-2 border-b border-border px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
        <span>Produto</span>
        <span className="text-center">Qtd.</span>
        <span className="text-right">Unit.</span>
        <span className="text-right">Total</span>
        <span className="sr-only">Ações</span>
      </div>

      <ul className="min-h-0 divide-y divide-border overflow-y-auto">
        {items.length === 0 && (
          <li className="px-4 py-12 text-center text-sm font-medium text-muted-foreground">
            Nenhum item no cupom. Leia um código ou selecione nos atalhos.
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "grid cursor-pointer grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_5.5rem_2rem] items-center gap-2 px-3.5 py-2.5 transition-colors",
              item.id === currentItemId ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/30",
            )}
          >
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5">
              <img
                src={productPlaceholder}
                alt=""
                aria-hidden
                className="size-10 shrink-0 rounded-md border border-border/60 object-cover shadow-2xs"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold uppercase text-foreground leading-tight">
                  {item.name}
                </p>
                <p className="num truncate text-xs text-muted-foreground">{item.code}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Diminuir quantidade de ${item.name}`}
                className="size-7 shrink-0 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeQuantity(item.id, item.unit === "KG" ? -0.1 : -1);
                }}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="num w-13 rounded-md border border-border py-1 text-center text-xs sm:text-sm font-bold bg-card">
                {qty(item.quantity)}
                {item.unit === "KG" ? " kg" : ""}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Aumentar quantidade de ${item.name}`}
                className="size-7 shrink-0 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeQuantity(item.id, item.unit === "KG" ? 0.1 : 1);
                }}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            <span className="num truncate text-right text-xs sm:text-sm font-semibold text-muted-foreground">
              {brl(item.price)}
              {item.unit === "KG" ? "/kg" : ""}
            </span>
            <span className="num truncate text-right text-sm sm:text-base font-extrabold text-primary">
              {brl(item.price * item.quantity)}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remover ${item.name}`}
              className="size-8 shrink-0 rounded-md text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <footer className="grid gap-2.5 border-t border-border p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2">
          <span className="truncate font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cliente
          </span>
          <span className="shrink-0 font-display text-xs font-extrabold uppercase tracking-wide text-primary">
            {settings.askCustomerIdentification ? "Informar CPF/CNPJ" : "Consumidor Final"}
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
          <span className="truncate font-display text-xs sm:text-sm font-bold uppercase tracking-wider">
            Total da Venda
          </span>
          <span className="num shrink-0 font-display text-2xl sm:text-3xl font-black">{brl(total)}</span>
        </div>

        <Button
          type="button"
          onClick={onFinish}
          disabled={items.length === 0}
          className="h-13 gap-2.5 rounded-lg bg-success text-success-foreground hover:bg-success/90 shadow-md font-bold text-base"
        >
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="grid text-left">
            <span className="font-display text-base font-extrabold leading-tight">Finalizar Venda</span>
            <span className="text-xs leading-tight opacity-90 font-medium">F10 ou Enter</span>
          </span>
        </Button>

        {settings.receiptFooterMessage && (
          <p className="truncate px-1 text-center text-xs italic text-muted-foreground">
            {settings.receiptFooterMessage}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCash}
            className="h-10.5 gap-2 rounded-lg text-xs sm:text-sm font-bold"
          >
            <Banknote className="size-4.5 text-emerald-600" />
            Dinheiro
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onPix}
            className="h-10.5 gap-2 rounded-lg text-xs sm:text-sm font-bold"
          >
            <QrCode className="size-4.5 text-blue-600" />
            PIX Checkout
          </Button>
        </div>
      </footer>
    </section>
  );
}
