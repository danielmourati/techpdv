import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { useSalesSessions } from "@/hooks/useSalesSessions";
import { SaleTabs } from "@/components/pos/SaleTabs";
import { CurrentProduct } from "@/components/pos/CurrentProduct";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { QuickAddGrid } from "@/components/pos/QuickAddGrid";
import { CouponPanel } from "@/components/pos/CouponPanel";
import { StatusBar } from "@/components/pos/StatusBar";
import { PixModal } from "@/components/pos/PixModal";
import { NfceStepperModal } from "@/components/pos/NfceStepperModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frente de Caixa — PDV para varejo e atacado" },
      {
        name: "description",
        content:
          "PDV rápido e otimizado para teclado: múltiplas vendas simultâneas, cupom em tempo real, pagamento PIX e emissão de NFC-e.",
      },
      { property: "og:title", content: "Frente de Caixa — PDV para varejo e atacado" },
      {
        property: "og:description",
        content:
          "Operação de caixa em uma única tela: leitura de produtos, cupom da venda, PIX e NFC-e.",
      },
    ],
  }),
  component: FrenteDeCaixa,
});

function FrenteDeCaixa() {
  const sales = useSalesSessions();
  const searchRef = useRef<HTMLInputElement>(null);
  const [pixOpen, setPixOpen] = useState(false);
  const [nfceOpen, setNfceOpen] = useState(false);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (sales.active && sales.active.items.length > 0) setPixOpen(true);
      }
      if (e.key === "F9") {
        e.preventDefault();
        sales.newSession();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sales]);

  const currentProduct = sales.currentItem
    ? MOCK_PRODUCTS.find((p) => p.id === sales.currentItem?.productId)
    : undefined;

  return (
    <div className="flex h-screen max-h-screen flex-col overflow-hidden bg-background">
      <header className="shrink-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-primary px-4 py-2 text-primary-foreground">
          <h1 className="truncate font-display text-lg font-bold uppercase tracking-[0.18em]">
            Frente de Caixa
          </h1>
          <span className="num shrink-0 text-xs uppercase tracking-[0.1em] opacity-80">
            Venda {sales.active?.number} · aberta às {sales.active?.openedAt}
          </span>
        </div>
        <SaleTabs
          sessions={sales.sessions}
          totals={sales.totals}
          activeId={sales.active?.id ?? ""}
          onSelect={sales.selectSession}
          onNew={() => {
            sales.newSession();
            searchRef.current?.focus();
          }}
        />
      </header>

      <main className="grid min-h-0 flex-1 gap-3 overflow-hidden p-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3 overflow-hidden">
          <CurrentProduct item={sales.currentItem} />
          <ProductSearch ref={searchRef} onAdd={sales.addProduct} />
          <QuickAddGrid onAdd={(p) => sales.addProduct(p, 1)} />
        </div>

        <div className="min-h-0 overflow-hidden">
          <CouponPanel
            items={sales.active?.items ?? []}
            total={sales.activeTotal}
            currentItemId={sales.currentItem?.id ?? null}
            onChangeQuantity={sales.changeQuantity}
            onRemove={sales.removeItem}
            onSelect={sales.setCurrentItemId}
            onFinish={() => setPixOpen(true)}
          />
        </div>
      </main>

      <StatusBar
        stock={currentProduct?.stock ?? 0}
        unitValue={sales.currentItem?.price ?? 0}
        status={(sales.active?.items.length ?? 0) > 0 ? "Caixa ocupado" : "Caixa livre"}
        operator={sales.active?.operator ?? "—"}
      />

      <PixModal
        open={pixOpen}
        total={sales.activeTotal}
        onOpenChange={setPixOpen}
        onConfirmed={() => {
          setPixOpen(false);
          setNfceOpen(true);
          toast.success("Pagamento PIX confirmado (simulado)");
          sales.clearActive();
        }}
      />
      <NfceStepperModal open={nfceOpen} onOpenChange={setNfceOpen} />
    </div>
  );
}
