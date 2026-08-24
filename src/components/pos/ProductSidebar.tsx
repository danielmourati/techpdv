import { TriangleAlert } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";
import { brl } from "@/lib/format";
import { useSettings } from "@/hooks/useSettings";

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "PD";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  const first = words[0]!;
  const last = words[words.length - 1]!;
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-2xs">
      <span className="truncate font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="num shrink-0 font-display text-base font-extrabold text-foreground">{value}</span>
    </div>
  );
}

export function ProductSidebar({
  productName,
  imageUrl,
  stock,
  unit,
  unitValue,
  itemValue,
  status,
}: {
  productName?: string | undefined;
  imageUrl?: string | undefined;
  stock: number;
  unit: string;
  unitValue: number;
  itemValue: number;
  status: string;
}) {
  const isOccupied = status.toLowerCase().includes("ocupado");
  const { saved: settings } = useSettings();

  return (
    <aside className="grid min-h-0 grid-rows-[1.05fr_1.3fr_auto] gap-2">
      <div className="grid min-h-0 place-items-center overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xs">
        {settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt={`Logo ${settings.tradeName}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="break-words px-2 text-center font-display text-4xl font-black uppercase tracking-wide text-primary sm:text-5xl">
            {getInitials(settings.tradeName || "MeuPDV")}
          </span>
        )}
      </div>

      <div className="grid min-h-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-2xs">
        <img
          src={imageUrl || productPlaceholder}
          alt={productName ? `Imagem do produto ${productName}` : "Imagem do produto"}
          className="max-h-full max-w-full rounded-lg object-contain"
          loading="lazy"
        />
      </div>


      <div className="grid gap-2">
        <InfoRow label="Estoque" value={`${stock} ${unit}`} />
        <InfoRow label="Valor Unitário" value={brl(unitValue)} />
        <InfoRow label="Valor Deste Item" value={brl(itemValue)} />

        <div
          className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-2xs ${
            isOccupied
              ? "border-warning/50 bg-warning/15 text-warning-foreground"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
          }`}
        >
          <TriangleAlert className="size-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-display text-xs font-bold uppercase tracking-wider opacity-85">
              Status do Atendimento
            </p>
            <p className="truncate font-display text-base sm:text-lg font-extrabold uppercase">
              {status}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
