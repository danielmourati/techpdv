import { Plus } from "lucide-react";
import type { SaleSession } from "@/data/mock-sales";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KeyHint } from "./KeyHint";

export function SaleTabs({
  sessions,
  totals,
  activeId,
  onSelect,
  onNew,
}: {
  sessions: SaleSession[];
  totals: Record<string, number>;
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-3 py-2">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
        {sessions.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-current={isActive}
              className={cn(
                "shrink-0 rounded-sm border px-3 py-1.5 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-surface-foreground hover:border-primary/40",
              )}
            >
              <span className="block font-display text-xs font-semibold uppercase tracking-[0.1em]">
                Venda {s.number}
              </span>
              <span className="num block text-sm font-semibold">{brl(totals[s.id] ?? 0)}</span>
            </button>
          );
        })}
      </div>
      <Button
        type="button"
        onClick={onNew}
        className="shrink-0 gap-2 rounded-sm font-display uppercase tracking-[0.1em]"
      >
        <Plus className="size-4" />
        Nova venda
        <KeyHint>F9</KeyHint>
      </Button>
    </div>
  );
}
