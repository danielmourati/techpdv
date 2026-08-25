import { CheckCircle2, Minus, Plus, Receipt, Trash2 } from "lucide-react";
import type { SaleItem } from "@/data/mock-sales";
import emptyCartAsset from "@/assets/cupom-vazio.png.asset.json";
import productPlaceholderAsset from "@/assets/produto-sem-foto.png.asset.json";

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
}: {
  items: SaleItem[];
  total: number;
  currentItemId: string | null;
  onChangeQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onClear: () => void;
  onFinish: () => void;
  onCash?: () => void;
  onPix?: () => void;
}) {
  const { saved: settings } = useSettings();

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-sm">
      {/* Streamlined Header */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-border bg-muted/60 px-3 py-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-2xs">
          <Receipt className="size-4.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-display text-[11px] font-black uppercase tracking-wider text-primary">
              Cupom da Venda
            </p>
            <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <p className="num truncate font-display text-sm font-extrabold text-foreground leading-none mt-0.5">
            {items.length === 0 ? "Aguardando itens..." : `${items.length} produto(s) no cupom`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Limpar cupom"
          onClick={onClear}
          disabled={items.length === 0}
          className="size-7.5 shrink-0 rounded-md border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="Limpar todos os itens (F8)"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </header>

      {/* Subheader table columns */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>Item / Descrição</span>
        <span>Subtotal</span>
      </div>

      {/* Optimized Compact Item List */}
      <ul className="min-h-0 divide-y divide-border overflow-y-auto">
        {items.length === 0 && (
          <li className="grid place-items-center gap-3 px-4 py-8 text-center">
            <img
              src={emptyCartAsset.url}
              alt="Cupom sem itens"
              className="w-36 max-w-full opacity-90"
              loading="lazy"
            />
            <p className="text-xs font-semibold text-muted-foreground">
              Nenhum item no cupom. Leia um código com o leitor ou use os atalhos.
            </p>
          </li>
        )}
        {items.map((item, index) => (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "cursor-pointer px-3 py-1.5 transition-colors border-l-4",
              item.id === currentItemId
                ? "bg-accent border-l-primary"
                : "border-l-transparent hover:bg-muted/50",
            )}
          >
            {/* Top Line: Number + Name + Subtotal + Remove */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                <span className="text-primary font-black text-xs shrink-0">#{index + 1}</span>
                <img
                  src={item.imageUrl || productPlaceholderAsset.url}
                  alt={item.name}
                  className="size-8 shrink-0 rounded-md border border-border/60 bg-surface object-contain p-0.5"
                  loading="lazy"
                />
                <span className="font-display text-xs sm:text-[13px] font-extrabold uppercase text-foreground leading-tight truncate">
                  {item.name}
                </span>
              </div>


              <div className="flex items-center gap-1.5 shrink-0">
                <span className="num font-display text-xs sm:text-sm font-black text-primary">
                  {brl(item.price * item.quantity)}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Remover ${item.name}`}
                  className="size-6 shrink-0 rounded text-destructive hover:bg-destructive/10 transition-colors p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  title="Remover item"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Bottom Line: Barcode + Compact Qtd adjusters + Unit Price */}
            <div className="mt-0.5 flex items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="num text-[10px] text-muted-foreground font-mono">
                  {item.code}
                </span>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label={`Diminuir quantidade de ${item.name}`}
                    className="size-5 rounded border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors shadow-2xs font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeQuantity(item.id, item.unit === "KG" ? -0.1 : -1);
                    }}
                  >
                    <Minus className="size-2.5 stroke-[3]" />
                  </button>
                  <span className="num min-w-10 rounded border border-border px-1 py-0.2 text-center text-[11px] font-extrabold bg-background text-foreground shadow-2xs">
                    {qty(item.quantity)}
                    {item.unit === "KG" ? " kg" : ""}
                  </span>
                  <button
                    type="button"
                    aria-label={`Aumentar quantidade de ${item.name}`}
                    className="size-5 rounded border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors shadow-2xs font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeQuantity(item.id, item.unit === "KG" ? 0.1 : 1);
                    }}
                  >
                    <Plus className="size-2.5 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="num text-[11px] font-bold text-muted-foreground">
                  {brl(item.price)}
                  {item.unit === "KG" ? "/kg" : " un"}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Streamlined Footer without Dinheiro / PIX buttons */}
      <footer className="grid gap-2 border-t border-border bg-muted/50 p-2.5">
        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-1.5">
          <span className="font-display text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Cliente
          </span>
          <span className="font-display text-[11px] font-black uppercase text-primary">
            {settings.askCustomerIdentification ? "Informar CPF/CNPJ" : "Consumidor Final"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg bg-primary px-3.5 py-2 text-primary-foreground shadow-sm">
          <span className="font-display text-xs font-bold uppercase tracking-wider">
            Total da Venda
          </span>
          <span className="num font-display text-xl sm:text-2xl font-black">{brl(total)}</span>
        </div>

        <Button
          type="button"
          onClick={onFinish}
          disabled={items.length === 0}
          className="h-11 gap-2 rounded-lg bg-success text-success-foreground hover:bg-success/90 shadow-md font-bold text-sm"
        >
          <CheckCircle2 className="size-4.5 shrink-0" />
          <span className="grid text-left">
            <span className="font-display text-sm font-extrabold leading-tight">Finalizar Venda</span>
            <span className="text-[10px] leading-tight opacity-90 font-medium">F10 ou Enter</span>
          </span>
        </Button>

        {settings.receiptFooterMessage && (
          <p className="truncate px-1 text-center text-[10px] italic text-muted-foreground">
            {settings.receiptFooterMessage}
          </p>
        )}
      </footer>
    </section>
  );
}
