import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DollarSign,
  Lock,
  LogIn,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { getStoredProducts, type Product } from "@/data/mock-products";
import { parseTerm } from "@/lib/parse-input";
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
import { useSettings } from "@/hooks/useSettings";
import { MOCK_USERS, type AuthUser } from "@/data/mock-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frente de Caixa & Portal — MeuPDV" },
      {
        name: "description",
        content:
          "PDV rápido e otimizado para teclado com identificação de operador, cupom fiscal em tempo real, PIX e NFC-e.",
      },
      { property: "og:title", content: "Frente de Caixa & Portal — MeuPDV" },
      {
        property: "og:description",
        content:
          "Operação de caixa em uma única tela: leitura de produtos, venda por peso, cupom da venda, PIX e NFC-e.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  if (!user) {
    return <HomeLoginPortal />;
  }

  return <FrenteDeCaixa user={user} />;
}

// ---------------------------------------------------------------------------
// 1. Home Login Portal (Padrão idêntico ao /login quando não autenticado)
// ---------------------------------------------------------------------------
function HomeLoginPortal() {
  const { login, openingFloat } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>(MOCK_USERS[0].id);
  const [password, setPassword] = useState<string>("");
  const [cashFloat, setCashFloat] = useState<string>(String(openingFloat || 100));
  const [loading, setLoading] = useState(false);

  const selectedUser = MOCK_USERS.find((u) => u.id === selectedUserId) ?? MOCK_USERS[0]!;

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    const u = MOCK_USERS.find((item) => item.id === id);
    if (u) {
      setPassword(u.passwordHint);
    }
  };

  const handleQuickLogin = (u: AuthUser) => {
    setSelectedUserId(u.id);
    setPassword(u.passwordHint);
    setLoading(true);
    setTimeout(() => {
      login(u.id, u.passwordHint, parseFloat(cashFloat.replace(",", ".")) || 100);
      toast.success(`Bem-vindo, ${u.name}! (${u.roleLabel})`);
      setLoading(false);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const floatVal = parseFloat(cashFloat.replace(",", ".")) || 100;
      const success = login(selectedUserId, password || undefined, floatVal);
      if (success) {
        toast.success(`Autenticado com sucesso como ${selectedUser.name}!`);
      } else {
        toast.error("Senha ou PIN incorreto. Tente 'admin123' ou '123456'.");
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-radial from-background via-background to-muted/50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.tradeName || "Logo"}
              className="mb-2 size-16 rounded-2xl object-contain bg-white p-1.5 shadow-lg shadow-primary/20 ring-4 ring-primary/10"
            />
          ) : (
            <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-black text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10">
              PD
            </div>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {settings.tradeName || "MeuPDV"}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Frente de Caixa & Gestão Comercial Inteligente
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 shadow-xl shadow-black/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-display text-lg font-bold">Identificação de Acesso</CardTitle>
            <CardDescription className="text-xs">
              Selecione o operador ou administrador para entrar no sistema.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Select User Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="user-select" className="text-xs font-semibold">
                  Selecione o Usuário
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {MOCK_USERS.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u.id)}
                        className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card hover:bg-accent"
                          }`}
                      >
                        <div className="flex w-full items-center justify-between mb-1.5">
                          <span
                            className={`grid size-7 place-items-center rounded-md font-display text-xs font-bold ${u.role === "admin"
                              ? "bg-primary text-primary-foreground"
                              : "bg-emerald-600 text-white"
                              }`}
                          >
                            {u.avatarText}
                          </span>
                          <Badge
                            variant={u.role === "admin" ? "default" : "secondary"}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {u.role === "admin" ? "Admin" : "Operador"}
                          </Badge>
                        </div>
                        <p className="truncate font-semibold text-xs text-foreground">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">{u.roleLabel}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Preview Badge */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${selectedUser.role === "admin"
                      ? "bg-primary text-primary-foreground"
                      : "bg-emerald-600 text-white"
                      }`}
                  >
                    {selectedUser.avatarText}
                  </span>
                  <div>
                    <p className="text-xs font-bold leading-tight">{selectedUser.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <Badge
                  variant={selectedUser.role === "admin" ? "default" : "secondary"}
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  {selectedUser.role === "admin" ? "Admin" : "Operador"}
                </Badge>
              </div>

              {/* Password / PIN Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="home-password" className="text-xs font-semibold">
                    Senha ou PIN de Acesso
                  </Label>
                  <button
                    type="button"
                    onClick={() => setPassword(selectedUser.passwordHint)}
                    className="text-[10px] font-medium text-primary hover:underline"
                  >
                    Preencher demo ({selectedUser.passwordHint})
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="home-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    className="h-10 pl-9 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Opening Cash Float */}
              <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="home-float" className="text-xs font-semibold flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-emerald-600" />
                    Fundo de Troco Inicial (Suprimento)
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Valor em gaveta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="home-float"
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashFloat}
                      onChange={(e) => setCashFloat(e.target.value)}
                      className="h-9 pl-9 font-mono text-xs font-bold text-foreground"
                      placeholder="100.00"
                    />
                  </div>
                  <div className="flex gap-1">
                    {[50, 100, 200].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCashFloat(String(v))}
                        className="rounded-md border border-border bg-card px-2 py-1 text-[10px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        R$ {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1-Click Fast Demonstration Login */}
              <div className="pt-1">
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                  Acesso rápido com 1 clique:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-medium justify-start"
                    onClick={() => handleQuickLogin(MOCK_USERS[0]!)}
                  >
                    <ShieldCheck className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">Admin (Acesso Total)</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-medium justify-start"
                    onClick={() => handleQuickLogin(MOCK_USERS[1]!)}
                  >
                    <UserCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Operador (Caixa)</span>
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button type="submit" className="w-full gap-2 font-semibold" disabled={loading}>
                <LogIn className="size-4" />
                {loading ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2026 MeuPDV — Sistema de Frente de Caixa e Gestão Comercial</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Frente de Caixa (Quando autenticado)
// ---------------------------------------------------------------------------
function FrenteDeCaixa({ user }: { user: AuthUser }) {
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
    let barcodeBuffer = "";
    let lastKeyTime = Date.now();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.key === "F4" || e.key === "F10") {
        e.preventDefault();
        if (sales.active && sales.active.items.length > 0) setPixOpen(true);
        return;
      }

      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.startsWith("F") && e.key.length <= 3) return;

      const now = Date.now();
      const isFastScan = now - lastKeyTime < 65;
      lastKeyTime = now;

      // When Enter is received from a rapid barcode scanner
      if (e.key === "Enter") {
        if (barcodeBuffer.length >= 3) {
          const parsed = parseTerm(barcodeBuffer);
          const allProds = getStoredProducts();
          const found = allProds.find(
            (p) =>
              p.code === parsed.term ||
              p.internalCode?.toLowerCase() === parsed.term.toLowerCase()
          );
          if (found) {
            e.preventDefault();
            if (found.soldByWeight) {
              requestWeight(found, parsed.scaleWeight ?? parsed.factor);
            } else {
              const qtyToAdd = parsed.factor ?? 1;
              sales.addProduct(found, qtyToAdd);
              toast.success(`+ ${qtyToAdd}x ${found.name} lido pelo leitor!`, { duration: 1500 });
            }
            barcodeBuffer = "";
            searchRef.current?.focus();
            return;
          }
        }
        barcodeBuffer = "";
        return;
      }

      // Buffer characters
      if (e.key.length === 1) {
        if (isFastScan || barcodeBuffer.length > 0) {
          barcodeBuffer += e.key;
        } else {
          barcodeBuffer = e.key;
        }
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

          <main className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2 lg:grid-cols-[16rem_minmax(0,1fr)_22rem] 2xl:grid-cols-[18rem_minmax(0,1fr)_24rem]">
            <div className="hidden min-h-0 lg:grid">
              <ProductSidebar
                productName={sales.currentItem?.name}
                imageUrl={currentProduct?.imageUrl}
                stock={currentProduct?.stock ?? 0}
                unit={currentProduct?.unit ?? "UN"}
                unitValue={sales.currentItem?.price ?? 0}
                itemValue={
                  sales.currentItem ? sales.currentItem.price * sales.currentItem.quantity : 0
                }
                status={(sales.active?.items.length ?? 0) > 0 ? "Caixa ocupado" : "Caixa livre"}
              />
            </div>

            <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-md border border-border bg-card">
              <CurrentProductBar item={sales.currentItem} />
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
