import { SidebarTrigger } from "@/components/ui/sidebar";
import { brl } from "@/lib/format";

export function AppTopBar({
  store = "Mercadinho Central - MeuPDV",
  cashTotal = 0,
}: {
  store?: string;
  cashTotal?: number;
}) {
  return (
    <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-3 py-2">
      <SidebarTrigger className="size-9 shrink-0 rounded-md border border-border" />

      <div className="min-w-0">
        <h1 className="truncate font-display text-lg font-bold leading-tight">Frente de caixa</h1>
        <p className="truncate text-[11px] text-muted-foreground">{store}</p>
      </div>

      <div className="shrink-0 rounded-md border border-success/40 bg-success/10 px-3 py-1 text-right">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-success">
          Caixa aberto
        </p>
        <p className="num font-display text-sm font-bold leading-tight text-success">
          {brl(cashTotal)}
        </p>
      </div>
    </div>
  );
}
