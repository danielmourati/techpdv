import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getStoredProducts, type Product } from "@/data/mock-products";
import { useSalesSessions } from "@/hooks/useSalesSessions";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/pos/AppSidebar";
import { AppTopBar } from "@/components/pos/AppTopBar";
import { CurrentProductBar } from "@/components/pos/CurrentProductBar";
import { ProductSidebar } from "@/components/pos/ProductSidebar";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { QuickAddGrid } from "@/components/pos/QuickAddGrid";
import { CouponPanel } from "@/components/pos/CouponPanel";
import { PixModal } from "@/components/pos/PixModal";
import { NfceStepperModal } from "@/components/pos/NfceStepperModal";
import { WeightPromptModal } from "@/components/pos/WeightPromptModal";
import { getStoredSalesHistory, saveStoredSalesHistory, type CompletedSale } from "@/data/mock-sales-history";
import { getStoredFinancial, saveStoredFinancial, type FinancialEntry } from "@/data/mock-financial";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frente de Caixa — PDV para varejo e atacado" },
      {
        name: "description",
        content:
          "PDV rápido e otimizado para teclado: leitura com fator de multiplicação, venda por peso, cupom em tempo real, PIX e NFC-e.",
      },
      { property: "og:title", content: "Frente de Caixa — PDV para varejo e atacado" },
      {
        property: "og:description",
        content:
          "Operação de caixa em uma única tela: leitura de produtos, venda por peso, cupom da venda, PIX e NFC-e.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrenteDeCaixa,
});

function FrenteDeCaixa() {
  const { user } = useAuth();
  const sales = useSalesSessions();
  const searchRef = useRef<HTMLInputElement>(null);
  const [pixOpen, setPixOpen] = useState(false);
  const [nfceOpen, setNfceOpen] = useState(false);
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const [suggestedWeight, setSuggestedWeight] = useState<number | null>(null);

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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sales]);

  const products = getStoredProducts();
  const currentProduct = sales.currentItem
    ? products.find((p) => p.id === sales.currentItem?.productId)
    : undefined;

  const requestWeight = (product: Product, weight?: number | null) => {
    setSuggestedWeight(weight ?? null);
    setWeightProduct(product);
  };

  const handleFinishSale = (method: "PIX" | "DINHEIRO" | "CARTAO_DEBITO" | "CARTAO_CREDITO") => {
    if (!sales.active || sales.active.items.length === 0) {
      toast.error("Nenhum item adicionado à venda.");
      return;
    }

    const receiptNumber = Math.floor(100 + Math.random() * 900);
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString("pt-BR");

    const newSale: CompletedSale = {
      id: `sale-${Date.now()}`,
      code: `VDA-00${receiptNumber}`,
      receiptNumber,
      date: dateStr,
      time: timeStr,
      customerName: "Consumidor Final",
      operator: user?.name ?? "Operador de Caixa",
      items: [...sales.active.items],
      subtotal: sales.activeTotal,
      discount: 0,
      total: sales.activeTotal,
      paymentMethod: method,
      amountPaid: sales.activeTotal,
      change: 0,
      status: "CONCLUIDA",
      nfceKey: `3526 0812 3456 7800 0190 6500 1000 0001 ${Math.floor(1000 + Math.random() * 9000)} 5678`,
    };

    saveStoredSalesHistory([newSale, ...getStoredSalesHistory()]);

    const newFin: FinancialEntry = {
      id: `fin-${Date.now()}`,
      description: `Venda PDV Cupom #${receiptNumber}`,
      type: "RECEITA",
      category: "Vendas à Vista",
      amount: newSale.total,
      paymentMethod: method,
      status: "PAGO",
      dueDate: dateStr,
      paymentDate: `${dateStr} ${timeStr}`,
      operator: newSale.operator,
      createdAt: dateStr,
    };
    saveStoredFinancial([newFin, ...getStoredFinancial()]);

    sales.clearActive();
    toast.success(`Venda #${receiptNumber} finalizada com sucesso!`);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen max-h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppTopBar cashTotal={sales.activeTotal} />
          <CurrentProductBar item={sales.currentItem} />

          <main className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2 lg:grid-cols-[16rem_minmax(0,1fr)_28rem]">
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
              <ProductSearch
                ref={searchRef}
                onAdd={sales.addProduct}
                onWeightRequest={requestWeight}
              />
              <QuickAddGrid
                onAdd={(p) => (p.soldByWeight ? requestWeight(p) : sales.addProduct(p, 1))}
              />
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
                onCash={() => handleFinishSale("DINHEIRO")}
                onPix={() => setPixOpen(true)}
              />
            </div>
          </main>
        </div>
      </div>

      <WeightPromptModal
        product={weightProduct}
        initialWeight={suggestedWeight}
        onOpenChange={(open) => !open && setWeightProduct(null)}
        onConfirm={(product, weight) => {
          sales.addProduct(product, weight);
          setWeightProduct(null);
          searchRef.current?.focus();
        }}
      />

      <PixModal
        open={pixOpen}
        total={sales.activeTotal}
        onOpenChange={setPixOpen}
        onConfirmed={() => {
          handleFinishSale("PIX");
          setPixOpen(false);
          setNfceOpen(true);
        }}
      />
      <NfceStepperModal open={nfceOpen} onOpenChange={setNfceOpen} />
    </SidebarProvider>
  );
}
