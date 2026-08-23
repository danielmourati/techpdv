import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  DollarSign,
  History,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl } from "@/lib/format";
import { getStoredProducts, type Product } from "@/data/mock-products";
import {
  getStoredMovements,
  registerStockMovement,
  type MovementType,
  type StockMovement,
} from "@/data/mock-inventory";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Controle de Estoque — MeuPDV" },
      { name: "description", content: "Posição de estoque, entradas, saídas, perdas e auditoria de inventário." },
    ],
  }),
  component: EstoquePage,
});

function EstoquePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("ALL");
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>("ALL");

  // Movement Modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [moveType, setMoveType] = useState<MovementType>("ENTRADA");
  const [moveQuantity, setMoveQuantity] = useState<number>(1);
  const [moveReason, setMoveReason] = useState<string>("");
  const [moveDoc, setMoveDoc] = useState<string>("");

  const loadData = () => {
    setProducts(getStoredProducts());
    setMovements(getStoredMovements());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("meupdv_products_updated", loadData);
    window.addEventListener("meupdv_inventory_updated", loadData);
    return () => {
      window.removeEventListener("meupdv_products_updated", loadData);
      window.removeEventListener("meupdv_inventory_updated", loadData);
    };
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        stockStatusFilter === "ALL" ||
        (stockStatusFilter === "OUT" && p.stock <= 0) ||
        (stockStatusFilter === "LOW" && p.stock > 0 && p.stock <= p.minStock) ||
        (stockStatusFilter === "NORMAL" && p.stock > p.minStock);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, stockStatusFilter]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.productCode.includes(searchTerm) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.operator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        movementTypeFilter === "ALL" || m.type === movementTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [movements, searchTerm, movementTypeFilter]);

  // KPIs
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.minStock);
  const outOfStockItems = products.filter((p) => p.stock <= 0);
  const totalCostValue = products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  const totalSaleValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  const handleOpenMovement = (productId?: string, type?: MovementType) => {
    setSelectedProductId(productId || (products[0]?.id ?? ""));
    setMoveType(type || "ENTRADA");
    setMoveQuantity(1);
    setMoveReason("");
    setMoveDoc("");
    setIsMoveModalOpen(true);
  };

  const handleConfirmMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Selecione um produto.");
      return;
    }
    if (moveQuantity <= 0) {
      toast.error("Informe uma quantidade válida maior que zero.");
      return;
    }

    const operatorName = user?.name ?? "Operador do Sistema";
    const success = registerStockMovement(
      selectedProductId,
      moveType,
      moveQuantity,
      moveReason || (moveType === "ENTRADA" ? "Recebimento de mercadoria" : "Ajuste manual"),
      operatorName,
      moveDoc || undefined,
    );

    if (success) {
      toast.success("Movimentação de estoque lançada com sucesso.");
      setIsMoveModalOpen(false);
      loadData();
    } else {
      toast.error("Erro ao registrar movimentação.");
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <AppLayout
      title="Gestão de Estoque"
      subtitle="Posição de estoque em tempo real, controle de entradas/saídas e inventário"
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenMovement(undefined, "ENTRADA")}
            size="sm"
            className="gap-1.5 font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowDownLeft className="size-4" />
            Nova Entrada
          </Button>
          <Button
            onClick={() => handleOpenMovement(undefined, "SAIDA")}
            variant="outline"
            size="sm"
            className="gap-1.5 font-medium"
          >
            <ArrowUpRight className="size-4" />
            Nova Saída / Perda
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Valor Total (Custo)
              </CardTitle>
              <DollarSign className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {brl(totalCostValue)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Venda: {brl(totalSaleValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Itens Críticos (Baixo)
              </CardTitle>
              <AlertTriangle className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-amber-600 sm:text-2xl">
                {lowStockItems.length}
              </div>
              <p className="text-[11px] text-muted-foreground">Abaixo do estoque mínimo</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Esgotados (Zerados)
              </CardTitle>
              <AlertOctagon className="size-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-rose-600 sm:text-2xl">
                {outOfStockItems.length}
              </div>
              <p className="text-[11px] text-muted-foreground">Com saldo zero</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Movimentações Registradas
              </CardTitle>
              <History className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {movements.length}
              </div>
              <p className="text-[11px] text-muted-foreground">Entradas e saídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Views */}
        <Tabs defaultValue="posicao" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <TabsList>
              <TabsTrigger value="posicao" className="flex items-center gap-1.5 text-xs">
                <Boxes className="size-3.5" />
                Posição de Estoque
              </TabsTrigger>
              <TabsTrigger value="movimentacoes" className="flex items-center gap-1.5 text-xs">
                <History className="size-3.5" />
                Histórico de Movimentações
              </TabsTrigger>
            </TabsList>

            {/* Quick Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produto ou movimentação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* TAB 1: Posição de Estoque */}
          <TabsContent value="posicao" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Filtrar Situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todo o Estoque</SelectItem>
                    <SelectItem value="NORMAL">Estoque Normal</SelectItem>
                    <SelectItem value="LOW">Estoque Baixo</SelectItem>
                    <SelectItem value="OUT">Esgotados (Zero)</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || stockStatusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setSearchTerm("");
                      setStockStatusFilter("ALL");
                    }}
                  >
                    <X className="mr-1 size-3" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3 text-right">Custo Unit.</th>
                      <th className="px-4 py-3 text-right">Preço Venda</th>
                      <th className="px-4 py-3 text-right">Estoque Atual</th>
                      <th className="px-4 py-3 text-right">Estoque Mín.</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Valor Total</th>
                      <th className="px-4 py-3 text-right">Ajustar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-muted-foreground">
                          Nenhum produto correspondente aos filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isZero = p.stock <= 0;
                        const isLow = p.stock > 0 && p.stock <= p.minStock;

                        return (
                          <tr key={p.id} className="transition-colors hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono font-medium text-foreground">
                              {p.code}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">{p.name}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px]">
                                {p.category}
                              </Badge>
                            </td>
                            <td className="num px-4 py-3 text-right font-mono text-muted-foreground">
                              {brl(p.costPrice)}
                            </td>
                            <td className="num px-4 py-3 text-right font-mono font-semibold text-foreground">
                              {brl(p.price)}
                            </td>
                            <td className="num px-4 py-3 text-right font-display text-sm font-bold">
                              <span
                                className={
                                  isZero
                                    ? "text-rose-600"
                                    : isLow
                                      ? "text-amber-600"
                                      : "text-foreground"
                                }
                              >
                                {p.stock} {p.unit}
                              </span>
                            </td>
                            <td className="num px-4 py-3 text-right font-mono text-muted-foreground">
                              {p.minStock} {p.unit}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isZero ? (
                                <Badge variant="destructive" className="bg-rose-500/15 text-rose-600">
                                  Esgotado
                                </Badge>
                              ) : isLow ? (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                  Baixo
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-500/15 text-emerald-600">Normal</Badge>
                              )}
                            </td>
                            <td className="num px-4 py-3 text-right font-display text-xs font-bold text-foreground">
                              {brl(p.stock * p.price)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-primary"
                                  onClick={() => handleOpenMovement(p.id, "ENTRADA")}
                                >
                                  <ArrowDownLeft className="mr-1 size-3" />
                                  Entrada
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => handleOpenMovement(p.id, "AJUSTE")}
                                >
                                  <Sliders className="mr-1 size-3" />
                                  Ajuste
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Histórico de Movimentações */}
          <TabsContent value="movimentacoes" className="space-y-4">
            <div className="flex items-center gap-2">
              <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Tipo de Movimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Tipos</SelectItem>
                  <SelectItem value="ENTRADA">Entrada (+)</SelectItem>
                  <SelectItem value="SAIDA">Saída (-)</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste (=)</SelectItem>
                  <SelectItem value="PERDA">Perda (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Data / Hora</th>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3 text-center">Tipo</th>
                      <th className="px-4 py-3 text-right">Qtd Movimentada</th>
                      <th className="px-4 py-3 text-right">Saldo Anterior</th>
                      <th className="px-4 py-3 text-right">Novo Saldo</th>
                      <th className="px-4 py-3">Motivo / Documento</th>
                      <th className="px-4 py-3">Operador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMovements.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          Nenhum registro de movimentação encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredMovements.map((m) => (
                        <tr key={m.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-muted-foreground">
                            {m.timestamp}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{m.productName}</div>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {m.productCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {m.type === "ENTRADA" && (
                              <Badge className="bg-emerald-500/15 text-emerald-600">Entrada</Badge>
                            )}
                            {m.type === "SAIDA" && (
                              <Badge className="bg-blue-500/15 text-blue-600">Saída</Badge>
                            )}
                            {m.type === "AJUSTE" && (
                              <Badge className="bg-purple-500/15 text-purple-600">Ajuste</Badge>
                            )}
                            {m.type === "PERDA" && (
                              <Badge variant="destructive" className="bg-rose-500/15 text-rose-600">
                                Perda
                              </Badge>
                            )}
                          </td>
                          <td className="num px-4 py-3 text-right font-display font-bold">
                            <span
                              className={
                                m.type === "ENTRADA"
                                  ? "text-emerald-600"
                                  : m.type === "PERDA" || m.type === "SAIDA"
                                    ? "text-rose-600"
                                    : "text-purple-600"
                              }
                            >
                              {m.type === "ENTRADA" ? "+" : m.type === "AJUSTE" ? "=" : "-"}
                              {m.quantity}
                            </span>
                          </td>
                          <td className="num px-4 py-3 text-right font-mono text-muted-foreground">
                            {m.previousStock}
                          </td>
                          <td className="num px-4 py-3 text-right font-mono font-bold text-foreground">
                            {m.newStock}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-foreground">{m.reason}</div>
                            {m.documentNumber && (
                              <span className="font-mono text-[10px] text-primary">
                                Doc: {m.documentNumber}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{m.operator}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Movement Modal */}
      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lançar Movimentação de Estoque</DialogTitle>
            <DialogDescription>
              Registre entrada de mercadoria, saída, avaria/perda ou balanço de inventário.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmMovement} className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="mov-prod" className="text-xs font-semibold">
                Produto *
              </Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger id="mov-prod" className="h-9 text-xs">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (Atual: {p.stock} {p.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                <div>
                  <span className="text-[10px] text-muted-foreground">Estoque Atual:</span>
                  <p className="font-display font-bold text-sm text-foreground">
                    {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Estoque Mínimo:</span>
                  <p className="font-mono text-xs text-muted-foreground">
                    {selectedProduct.minStock} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground">Custo Unitário:</span>
                  <p className="font-mono text-xs text-foreground">
                    {brl(selectedProduct.costPrice)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="mov-type" className="text-xs font-semibold">
                  Tipo de Movimentação *
                </Label>
                <Select value={moveType} onValueChange={(val: MovementType) => setMoveType(val)}>
                  <SelectTrigger id="mov-type" className="h-9 text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA">Entrada (Compra / NF)</SelectItem>
                    <SelectItem value="SAIDA">Saída (Uso interno)</SelectItem>
                    <SelectItem value="PERDA">Perda / Avaria / Vencido</SelectItem>
                    <SelectItem value="AJUSTE">Ajuste de Inventário (Novo saldo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="mov-qty" className="text-xs font-semibold">
                  {moveType === "AJUSTE" ? "Novo Saldo Total *" : "Quantidade *"}{" "}
                  {selectedProduct?.unit ? `(${selectedProduct.unit})` : ""}
                </Label>
                <Input
                  id="mov-qty"
                  type="number"
                  step="any"
                  min="0.001"
                  value={moveQuantity || ""}
                  onChange={(e) => setMoveQuantity(parseFloat(e.target.value) || 0)}
                  className="h-9 font-mono text-xs font-bold text-primary"
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="mov-doc" className="text-xs font-semibold">
                Número do Documento / NF (Opcional)
              </Label>
              <Input
                id="mov-doc"
                value={moveDoc}
                onChange={(e) => setMoveDoc(e.target.value)}
                placeholder="Ex: NF 10452 ou Pedido #89"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mov-reason" className="text-xs font-semibold">
                Justificativa / Motivo
              </Label>
              <textarea
                id="mov-reason"
                value={moveReason}
                onChange={(e) => setMoveReason(e.target.value)}
                placeholder="Ex: Recebimento de carga de fornecedor, contagem de prateleira, produto danificado..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:border-primary focus:outline-none"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMoveModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Confirmar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
