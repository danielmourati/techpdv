import { Banknote, CheckCircle2, Minus, Plus, QrCode, Receipt, Trash2 } from "lucide-react";
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

      <div className="flex items-center justify-between border-b border-border px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
        <span>Itens Lançados ({items.length})</span>
        <span>Subtotal</span>
      </div>

      <ul className="min-h-0 divide-y divide-border overflow-y-auto">
        {items.length === 0 && (
          <li className="px-4 py-12 text-center text-sm font-medium text-muted-foreground">
            Nenhum item no cupom. Leia um código de barras ou selecione nos atalhos.
          </li>
        )}
        {items.map((item, index) => (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "cursor-pointer px-3.5 py-3 transition-colors border-l-4",
              item.id === currentItemId
                ? "bg-primary/10 border-l-primary"
                : "border-l-transparent hover:bg-muted/30",
            )}
          >
            {/* Top Line: Item Number + Full Product Name + Total + Remove */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm sm:text-base font-extrabold uppercase text-foreground leading-snug break-words">
                  <span className="text-primary mr-1.5 font-black">#{index + 1}</span>
                  {item.name}
                </p>
                <p className="num text-xs text-muted-foreground font-mono mt-0.5">
                  Cód: {item.code}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="num font-display text-base sm:text-lg font-black text-primary">
                  {brl(item.price * item.quantity)}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Remover ${item.name}`}
                  className="size-7.5 shrink-0 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {/* Bottom Line: Quantity Controls & Unit Price */}
            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/40 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Qtd:
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label={`Diminuir quantidade de ${item.name}`}
                    className="size-7 shrink-0 rounded-md hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeQuantity(item.id, item.unit === "KG" ? -0.1 : -1);
                    }}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="num min-w-14 rounded-md border border-border px-2 py-0.5 text-center text-xs sm:text-sm font-bold bg-card shadow-2xs">
                    {qty(item.quantity)}
                    {item.unit === "KG" ? " kg" : " un"}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label={`Aumentar quantidade de ${item.name}`}
                    className="size-7 shrink-0 rounded-md hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeQuantity(item.id, item.unit === "KG" ? 0.1 : 1);
                    }}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground font-medium mr-1.5">Unitário:</span>
                <span className="num text-xs sm:text-sm font-bold text-foreground">
                  {brl(item.price)}
                  {item.unit === "KG" ? "/kg" : "/un"}
                </span>
              </div>
            </div>
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
