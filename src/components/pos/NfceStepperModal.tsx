import { useEffect, useState } from "react";
import { Check, Loader2, Printer, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "./StatusPill";

const STEPS = [
  "Preparando dados da venda",
  "Reservando numeração da NFC-e",
  "Assinando digitalmente",
  "Enviando para a SEFAZ",
  "Nota autorizada",
];

export function NfceStepperModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }
    const t = setInterval(() => {
      setStep((s) => (s >= STEPS.length ? s : s + 1));
    }, 900);
    return () => clearInterval(t);
  }, [open]);

  const done = step >= STEPS.length;
  const progress = Math.round((step / STEPS.length) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-[0.1em]">
            Emissão da NFC-e
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <Progress value={progress} className="h-2" />
            <StatusPill tone={done ? "success" : "primary"} className="shrink-0">
              {done ? "Autorizada" : `${progress}%`}
            </StatusPill>
          </div>

          <ol className="grid gap-2">
            {STEPS.map((label, i) => {
              const state = i < step ? "done" : i === step ? "running" : "idle";
              return (
                <li
                  key={label}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-sm border px-3 py-2",
                    state === "done" && "border-success/40 bg-success/10",
                    state === "running" && "border-primary/40 bg-primary/5",
                    state === "idle" && "border-border bg-surface",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full",
                      state === "done" && "bg-success text-success-foreground",
                      state === "running" && "bg-primary text-primary-foreground",
                      state === "idle" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {state === "done" ? (
                      <Check className="size-3.5" />
                    ) : state === "running" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <span className="num text-[11px] font-semibold">{i + 1}</span>
                    )}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium">{label}</span>
                </li>
              );
            })}
          </ol>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 gap-2 rounded-sm font-display uppercase tracking-[0.1em]"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              Fechar
            </Button>
            <Button
              type="button"
              disabled={!done}
              className="h-12 gap-2 rounded-sm font-display uppercase tracking-[0.1em]"
            >
              <Printer className="size-4" />
              Imprimir DANFE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
