import { brl } from "@/lib/format";
import { StatusPill } from "./StatusPill";

export function StatusBar({
  stock,
  unitValue,
  status,
  operator,
}: {
  stock: number;
  unitValue: number;
  status: string;
  operator: string;
}) {
  return (
    <footer className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border bg-card px-3 py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="num text-muted-foreground">
          Estoque:{" "}
          <strong className="font-semibold text-foreground">{stock}</strong>
        </span>
        <span className="num text-muted-foreground">
          Valor unitário:{" "}
          <strong className="font-semibold text-foreground">{brl(unitValue)}</strong>
        </span>
        <span className="text-muted-foreground">
          Operador: <strong className="font-semibold text-foreground">{operator}</strong>
        </span>
      </div>
      <StatusPill tone="warning" className="shrink-0">
        {status}
      </StatusPill>
    </footer>
  );
}
