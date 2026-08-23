import { Minus, Plus, Trash2 } from "lucide-react";
import type { SaleItem } from "@/data/mock-sales";
import { brl, qty } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Panel } from "./Panel";
import { KeyHint } from "./KeyHint";

export function CouponPanel({
  items,
  total,
  currentItemId,
  onChangeQuantity,
  onRemove,
  onSelect,
  onFinish,
}: {
  items: SaleItem[];
  total: number;
  currentItemId: string | null;
  onChangeQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onFinish: () => void;
}) {
  return (
    <Panel
      title="Cupom da venda"
      className="h-full"
      bodyClassName="min-h-0"
      action={
        <span className="num shrink-0 font-display text-xs font-semibold uppercase tracking-[0.1em] text-primary-foreground/80">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      }
    >
      <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {items.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhum item no cupom.
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "cursor-pointer px-3 py-2",
              item.id === currentItemId ? "bg-accent/60" : "hover:bg-surface",
            )}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <p className="min-w-0 truncate font-display text-sm font-semibold uppercase">
                {item.name}
              </p>
              <p className="num shrink-0 text-sm font-bold">{brl(item.price * item.quantity)}</p>
            </div>
            <div className="mt-1 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={`Diminuir quantidade de ${item.name}`}
                  className="size-7 rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeQuantity(item.id, -1);
                  }}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="num w-10 text-center text-sm font-semibold">
                  {qty(item.quantity)}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={`Aumentar quantidade de ${item.name}`}
                  className="size-7 rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeQuantity(item.id, 1);
                  }}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              <span className="num min-w-0 truncate text-xs text-muted-foreground">
                {item.unit} × {brl(item.price)}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Remover ${item.name}`}
                className="size-7 shrink-0 rounded-sm text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <footer className="shrink-0 border-t border-border bg-surface p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Total da venda
          </span>
          <span className="num font-display text-3xl font-bold leading-none text-primary">
            {brl(total)}
          </span>
        </div>
        <Button
          type="button"
          onClick={onFinish}
          disabled={items.length === 0}
          className="mt-3 h-14 w-full gap-2 rounded-sm bg-success font-display text-base font-bold uppercase tracking-[0.12em] text-success-foreground hover:bg-success/90"
        >
          Finalizar venda
          <KeyHint>F4</KeyHint>
        </Button>
      </footer>
    </Panel>
  );
}
