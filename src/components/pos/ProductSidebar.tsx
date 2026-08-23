import { TriangleAlert } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";
import { brl } from "@/lib/format";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
      <span className="truncate font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="num shrink-0 text-sm font-bold">{value}</span>
    </div>
  );
}

export function ProductSidebar({
  productName,
  stock,
  unit,
  unitValue,
  itemValue,
  status,
}: {
  productName?: string;
  stock: number;
  unit: string;
  unitValue: number;
  itemValue: number;
  status: string;
}) {
  return (
    <aside className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2">
      <div className="grid min-h-0 place-items-center overflow-hidden rounded-md border border-border bg-surface p-3">
        <img
          src={productPlaceholder}
          alt={productName ? `Imagem do produto ${productName}` : "Imagem do produto"}
          className="max-h-full w-auto max-w-full rounded-sm object-contain"
          loading="lazy"
        />
      </div>

      <div className="grid gap-2">
        <InfoRow label="Estoque" value={`${stock} ${unit}`} />
        <InfoRow label="Valor unitário" value={brl(unitValue)} />
        <InfoRow label="Valor deste item" value={brl(itemValue)} />

        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md border border-warning/50 bg-warning/15 px-3 py-2">
          <TriangleAlert className="size-5 shrink-0 text-warning-foreground" />
          <div className="min-w-0">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-warning-foreground/80">
              Status do atendimento
            </p>
            <p className="truncate font-display text-base font-bold uppercase text-warning-foreground">
              {status}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
