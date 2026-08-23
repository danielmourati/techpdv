import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { useSalesSessions } from "@/hooks/useSalesSessions";
import { AppTopBar } from "@/components/pos/AppTopBar";
import { SaleTabs } from "@/components/pos/SaleTabs";
import { CurrentProductBar } from "@/components/pos/CurrentProductBar";
import { ProductSidebar } from "@/components/pos/ProductSidebar";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { QuickAddGrid } from "@/components/pos/QuickAddGrid";
import { CouponPanel } from "@/components/pos/CouponPanel";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      if (e.key === "F4" || e.key === "F10") {
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
      <AppTopBar />
      <SaleTabs
        sessions={sales.sessions}
        totals={sales.totals}
        activeId={sales.active?.id ?? ""}
        onSelect={sales.selectSession}
        onNew={() => {
          sales.newSession();
          searchRef.current?.focus();
        }}
        onClose={() => toast.info("Fechar venda é apenas demonstrativo nesta fase")}
      />
      <CurrentProductBar item={sales.currentItem} />

      <main className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2 lg:grid-cols-[11rem_minmax(0,1fr)_28rem]">
        <div className="hidden min-h-0 lg:grid">
          <ProductSidebar
            productName={sales.currentItem?.name}
            stock={currentProduct?.stock ?? 0}
            unit={currentProduct?.unit ?? "UN"}
            unitValue={sales.currentItem?.price ?? 0}
            itemValue={
              sales.currentItem ? sales.currentItem.price * sales.currentItem.quantity : 0
            }
            status={(sales.active?.items.length ?? 0) > 0 ? "Caixa ocupado" : "Caixa livre"}
          />
        </div>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-border bg-card">
          <ProductSearch ref={searchRef} onAdd={sales.addProduct} />
          <QuickAddGrid onAdd={(p) => sales.addProduct(p, 1)} />
        </div>

        <div className="grid min-h-0 overflow-hidden">
          <CouponPanel
            items={sales.active?.items ?? []}
            total={sales.activeTotal}
            currentItemId={sales.currentItem?.id ?? null}
            onChangeQuantity={sales.changeQuantity}
            onRemove={sales.removeItem}
            onSelect={sales.setCurrentItemId}
            onClear={sales.clearActive}
            onFinish={() => setPixOpen(true)}
            onCash={() => toast.success("Recebimento em dinheiro (simulado)")}
            onPix={() => setPixOpen(true)}
          />
        </div>
      </main>

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
