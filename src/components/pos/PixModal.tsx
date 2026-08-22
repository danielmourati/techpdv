import { useEffect, useState } from "react";
import { Banknote, Copy, CreditCard, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "./StatusPill";

const PIX_CODE =
  "00020126580014BR.GOV.BCB.PIX0136frentedecaixa@lojaexemplo.com.br52040000530398654040.005802BR5920LOJA EXEMPLO LTDA6009SAO PAULO62070503***6304A1B2";

const ALTERNATIVES = [
  { label: "Dinheiro", icon: Banknote },
  { label: "Débito", icon: CreditCard },
  { label: "Crédito", icon: Wallet },
];

export function PixModal({
  open,
  total,
  onOpenChange,
  onConfirmed,
}: {
  open: boolean;
  total: number;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
}) {
  const [seconds, setSeconds] = useState(180);

  useEffect(() => {
    if (!open) {
      setSeconds(180);
      return;
    }
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-[0.1em]">
            Pagamento via PIX
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm bg-surface px-3 py-2">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Valor a receber
            </span>
            <span className="num shrink-0 font-display text-2xl font-bold text-primary">
              {brl(total)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="grid size-48 place-items-center rounded-sm border-2 border-dashed border-border bg-muted text-muted-foreground">
              <QrCode className="size-24" aria-hidden />
              <span className="sr-only">QR Code PIX simulado</span>
            </div>
            <StatusPill tone={seconds > 30 ? "primary" : "warning"}>
              Expira em <span className="num">{mm}:{ss}</span>
            </StatusPill>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 rounded-sm font-display uppercase tracking-[0.1em]"
            onClick={() => {
              navigator.clipboard?.writeText(PIX_CODE);
              toast.success("Código PIX copiado");
            }}
          >
            <Copy className="size-4" />
            Copiar código PIX
          </Button>

          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Outras formas de pagamento
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {ALTERNATIVES.map(({ label, icon: Icon }) => (
                <Button
                  key={label}
                  type="button"
                  variant="secondary"
                  className="h-11 flex-col gap-1 rounded-sm text-xs font-semibold uppercase"
                  onClick={() => toast.info(`Fluxo de ${label} simulado`)}
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-sm font-display uppercase tracking-[0.1em]"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-12 rounded-sm bg-success font-display uppercase tracking-[0.1em] text-success-foreground hover:bg-success/90"
              onClick={onConfirmed}
            >
              Confirmar pagamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
