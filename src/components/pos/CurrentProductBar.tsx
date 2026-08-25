import type { SaleItem } from "@/data/mock-sales";
import type { Product } from "@/data/mock-products";
import productPlaceholderAsset from "@/assets/produto-sem-foto.png.asset.json";
import { brl, qty } from "@/lib/format";

export function CurrentProductBar({
  item,
  previewProduct,
}: {
  item: SaleItem | null;
  previewProduct?: Product | null;
}) {
  const name = item?.name ?? previewProduct?.name ?? null;
  const image = item?.imageUrl ?? previewProduct?.imageUrl ?? productPlaceholderAsset.url;
  const unit = item?.unit ?? previewProduct?.unit ?? "UN";
  const itemTotal = item ? item.price * item.quantity : (previewProduct?.price ?? 0);

  return (
    <div className="m-2 flex items-center justify-between gap-3 rounded-lg border-2 border-primary bg-primary-foreground px-3 py-2 text-foreground shadow-sm">
      <img
        src={image}
        alt={name ? `Imagem de ${name}` : "Produto sem foto"}
        className="size-14 shrink-0 rounded-lg border border-border bg-surface object-contain p-1 sm:size-16"
        loading="lazy"
      />

      <div className="min-w-0 flex-1 text-center">
        <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Produto atual
        </p>
        <p className="num truncate font-display text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
          {name ? (
            <>
              {item ? (
                <>
                  {qty(item.quantity)}
                  {unit === "KG" ? " kg" : ""} <span className="opacity-40">×</span>{" "}
                </>
              ) : null}
              {name}
            </>
          ) : (
            "Nenhum item lançado"
          )}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Total do Item
        </p>
        <p className="num font-display text-xl font-black leading-tight text-primary sm:text-2xl lg:text-3xl">
          {brl(itemTotal)}
        </p>
      </div>
    </div>
  );
}
