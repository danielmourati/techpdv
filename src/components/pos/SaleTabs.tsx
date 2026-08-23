import { Plus, Tickets, X } from "lucide-react";
import type { SaleSession } from "@/data/mock-sales";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SaleTabs({
  sessions,
  totals,
  activeId,
  onSelect,
  onNew,
  onClose,
}: {
  sessions: SaleSession[];
  totals: Record<string, number>;
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose?: (id: string) => void;
}) {
  return (
    <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-3 pb-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <Tickets className="size-5 text-primary" />
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              Atendimentos
            </p>
            <p className="num whitespace-nowrap text-[11px] text-muted-foreground">
              {`${sessions.length} de 8 vendas abertas`}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-1">
          {sessions.map((s, index) => {
            const isActive = s.id === activeId;
            const itemCount = s.items.length;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={isActive}
                className={cn(
                  "grid min-w-[13rem] shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border-2 px-2 py-1.5 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "num grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">Venda {s.number}</span>
                  <span className="num block truncate text-[11px] text-muted-foreground">
                    {itemCount} {itemCount === 1 ? "item" : "itens"} • {brl(totals[s.id] ?? 0)}
                  </span>
                </span>
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Fechar venda ${s.number}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose?.(s.id);
                  }}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        onClick={onNew}
        className="h-11 shrink-0 gap-2 rounded-md px-4 text-left"
      >
        <Plus className="size-5 shrink-0" />
        <span className="grid">
          <span className="font-display text-sm font-bold leading-tight">Nova venda</span>
          <span className="text-[10px] leading-tight opacity-80">Sem perder a atual</span>
        </span>
      </Button>
    </div>
  );
}
