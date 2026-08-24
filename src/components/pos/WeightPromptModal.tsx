import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";
import type { Product } from "@/data/mock-products";
import { brl, qty } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/useSettings";

const SCALE_LABELS: Record<string, string> = {
  TOLEDO_PRIX3: "Toledo Prix 3",
  FILIZOLA_PLATINA: "Filizola Platina",
  ELGIN_DP30: "Elgin DP-30",
  URANO_POP: "Urano POP",
  GENERIC: "Balança genérica",
};

const PADS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"];

export function WeightPromptModal({
  product,
  initialWeight,
  onOpenChange,
  onConfirm,
}: {
  product: Product | null;
  initialWeight?: number | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: Product, weight: number) => void;
}) {
  const { saved: settings } = useSettings();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setValue(initialWeight ? String(initialWeight).replace(".", ",") : "");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [product, initialWeight]);

  const weight = Number(value.replace(",", ".")) || 0;
  const valid = weight > 0;

  const confirm = () => {
    if (product && valid) {
      onConfirm(product, weight);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display uppercase">
            <Scale className="size-5 text-primary" />
            Produto vendido por peso
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-md border border-border bg-surface p-3">
          <p className="font-display text-lg font-bold uppercase leading-tight text-primary">
            {product?.name}
          </p>
          <p className="num text-xs text-muted-foreground">
            {product?.code} · {brl(product?.price ?? 0)} / kg
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Balança: {SCALE_LABELS[settings.scaleModel] ?? settings.scaleModel} ·{" "}
            {settings.scalePort} · {settings.scaleBaudRate} bps
          </p>
        </div>

        <label className="block">
          <span className="mb-1 block font-display text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Peso em quilos
          </span>
          <Input
            ref={inputRef}
            value={value}
            inputMode="decimal"
            placeholder="0,000"
            aria-label="Peso em quilos"
            onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirm();
              }
            }}
            className="num h-14 rounded-md text-center font-display text-3xl font-bold"
          />
        </label>

        <div className="grid grid-cols-3 gap-2">
          {PADS.map((pad) => (
            <Button
              key={pad}
              type="button"
              variant="outline"
              className="num h-11 rounded-md text-base font-bold"
              onClick={() =>
                setValue((prev) => (pad === "⌫" ? prev.slice(0, -1) : `${prev}${pad}`))
              }
            >
              {pad}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md bg-primary px-3 py-2 text-primary-foreground">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em]">
            {qty(weight)} kg × {brl(product?.price ?? 0)}
          </span>
          <span className="num font-display text-2xl font-bold">
            {brl(weight * (product?.price ?? 0))}
          </span>
        </div>

        <Button
          type="button"
          disabled={!valid}
          onClick={confirm}
          className="h-12 w-full rounded-md font-display text-sm font-bold"
        >
          Confirmar peso e lançar (Enter)
        </Button>
      </DialogContent>
    </Dialog>
  );
}
