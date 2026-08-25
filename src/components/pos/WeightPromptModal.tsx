import { useEffect, useRef, useState } from "react";
import { Scale, Package, Layers } from "lucide-react";
import type { Product } from "@/data/mock-products";
import { brl, qty } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/useSettings";
import productPlaceholderAsset from "@/assets/produto-sem-foto.png.asset.json";
const productPlaceholder = productPlaceholderAsset.url;

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
      setTimeout(() => inputRef.current?.focus(), 40);
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
      <DialogContent className="max-w-lg p-5">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 font-display text-base font-black uppercase tracking-wider text-foreground">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Scale className="size-4.5" />
            </div>
            Produto vendido por peso
          </DialogTitle>
        </DialogHeader>

        {/* Informações e Imagem do Produto */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 rounded-xl border border-border/80 bg-muted/30 p-3 shadow-2xs">
          {/* Foto do Produto */}
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-white p-1 shadow-2xs flex items-center justify-center">
            <img
              src={product?.imageUrl || productPlaceholder}
              alt={product?.name || "Produto"}
              className="size-full object-contain"
            />
            <span className="absolute bottom-1 right-1 rounded-md bg-warning/90 px-1 py-0.2 font-display text-[9px] font-black uppercase text-warning-foreground shadow-2xs">
              KG
            </span>
          </div>

          {/* Dados do Produto */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="num rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                {product?.code}
              </span>
              {product?.category && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {product.category}
                </span>
              )}
            </div>

            <p className="font-display text-base sm:text-lg font-black uppercase leading-snug text-foreground line-clamp-2">
              {product?.name}
            </p>

            <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
              <span className="num font-display text-sm font-extrabold text-primary">
                {brl(product?.price ?? 0)} <span className="text-xs font-semibold text-muted-foreground">/ kg</span>
              </span>
              {product?.stock !== undefined && (
                <span className="text-[11px] font-medium text-muted-foreground">
                  • Estoque: <strong className="text-foreground">{product.stock} kg</strong>
                </span>
              )}
            </div>

            <p className="text-[10px] font-mono text-muted-foreground/80 truncate pt-0.5">
              Balança: {SCALE_LABELS[settings.scaleModel] ?? settings.scaleModel} · {settings.scalePort} ({settings.scaleBaudRate} bps)
            </p>
          </div>
        </div>

        {/* Input do Peso com Fonte Ampliada */}
        <label className="block space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Peso em quilos (KG)
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Use a balança ou digite abaixo
            </span>
          </div>
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
            className="num h-16 rounded-xl text-center font-display text-3xl sm:text-4xl font-black text-foreground border-2 border-primary/40 bg-background shadow-xs focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
          />
        </label>

        {/* Teclado Numérico */}
        <div className="grid grid-cols-3 gap-2">
          {PADS.map((pad) => (
            <Button
              key={pad}
              type="button"
              variant="outline"
              className="num h-11 rounded-xl text-lg font-bold hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              onClick={() =>
                setValue((prev) => (pad === "⌫" ? prev.slice(0, -1) : `${prev}${pad}`))
              }
            >
              {pad}
            </Button>
          ))}
        </div>

        {/* Total da Pesagem */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-md shadow-primary/20">
          <div className="min-w-0">
            <span className="block font-display text-[11px] font-bold uppercase tracking-wider text-white/80">
              Cálculo do Item
            </span>
            <span className="block truncate font-display text-sm font-extrabold text-white">
              {qty(weight)} kg × {brl(product?.price ?? 0)}
            </span>
          </div>
          <span className="num font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
            {brl(weight * (product?.price ?? 0))}
          </span>
        </div>

        <Button
          type="button"
          disabled={!valid}
          onClick={confirm}
          className="h-12 w-full rounded-xl font-display text-sm sm:text-base font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
        >
          Confirmar peso e lançar (Enter)
        </Button>
      </DialogContent>
    </Dialog>
  );
}
