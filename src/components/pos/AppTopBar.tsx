import { Bell, Menu, RefreshCw, SlidersHorizontal, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppTopBar({ store = "Mercadinho Central - MeuPDV" }: { store?: string }) {
  return (
    <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-3 py-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Abrir menu"
        className="size-10 shrink-0 rounded-md"
      >
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-muted-foreground">{store} /</p>
        <h1 className="truncate font-display text-xl font-bold leading-tight">Frente de caixa</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Caixa"
          className="size-10 rounded-md border-success/40 bg-success/10 text-success"
        >
          <Wallet className="size-5" />
        </Button>
        {[
          { icon: Bell, label: "Notificações" },
          { icon: RefreshCw, label: "Sincronizar" },
          { icon: SlidersHorizontal, label: "Preferências" },
        ].map(({ icon: Icon, label }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            size="icon"
            aria-label={label}
            className="size-10 rounded-md text-primary"
          >
            <Icon className="size-5" />
          </Button>
        ))}
      </div>
    </div>
  );
}
