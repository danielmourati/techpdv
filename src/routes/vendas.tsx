import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  ShoppingCart,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  getStoredSalesHistory,
  saveStoredSalesHistory,
  type CompletedSale,
  type SaleStatus,
} from "@/data/mock-sales-history";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [
      { title: "Histórico de Vendas — MeuPDV" },
      { name: "description", content: "Consulta e gerenciamento de vendas concluídas e canceladas." },
    ],
  }),
  component: VendasPage,
});

function VendasPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<CompletedSale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [selectedSale, setSelectedSale] = useState<CompletedSale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadSales = () => {
    setSales(getStoredSalesHistory());
  };

  useEffect(() => {
    loadSales();
    window.addEventListener("meupdv_sales_updated", loadSales);
    return () => window.removeEventListener("meupdv_sales_updated", loadSales);
  }, []);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiptNumber.toString().includes(searchTerm) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.operator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesMethod = methodFilter === "ALL" || s.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // KPIs
  const totalSalesCount = sales.length;
  const completedSales = sales.filter((s) => s.status === "CONCLUIDA");
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);
  const averageTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
  const canceledCount = sales.filter((s) => s.status === "CANCELADA").length;

  const handleOpenDetails = (sale: CompletedSale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  const handleOpenReceipt = (sale: CompletedSale) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
  };

  const handleOpenCancel = (sale: CompletedSale) => {
    setSelectedSale(sale);
    setCancelReason("");
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedSale) return;
    if (!cancelReason.trim()) {
      toast.error("Por favor, informe a justificativa do cancelamento.");
      return;
    }

    const updated = sales.map((s) => {
      if (s.id === selectedSale.id) {
        return {
          ...s,
          status: "CANCELADA" as SaleStatus,
          cancelReason: cancelReason.trim(),
          canceledAt: new Date().toLocaleString("pt-BR"),
        };
      }
      return s;
    });

    saveStoredSalesHistory(updated);
    setIsCancelOpen(false);
    setIsDetailsOpen(false);
    toast.success(`Venda ${selectedSale.code} cancelada com sucesso.`);
  };

  const printSimulated = () => {
    toast.success("Enviado para a impressora térmica não fiscal (80mm)");
  };

  return (
    <AppLayout
      title="Gestão de Vendas"
      subtitle="Histórico de vendas, emissão de comprovantes e cancelamentos"
      actions={
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 font-medium">
            <Link to="/">
              <Plus className="size-4" />
              Abrir Frente de Caixa
            </Link>
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
                Total Faturado
              </CardTitle>
              <TrendingUp className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {brl(totalRevenue)}
              </div>
              <p className="text-[11px] text-muted-foreground">Vendas concluídas</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Ticket Médio
              </CardTitle>
              <ShoppingCart className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {brl(averageTicket)}
              </div>
              <p className="text-[11px] text-muted-foreground">Por atendimento</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Qtd. de Vendas
              </CardTitle>
              <Layers className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {completedSales.length}
              </div>
              <p className="text-[11px] text-muted-foreground">De {totalSalesCount} transações</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Cancelamentos
              </CardTitle>
              <Ban className="size-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-rose-600 sm:text-2xl">
                {canceledCount}
              </div>
              <p className="text-[11px] text-muted-foreground">Vendas estornadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por código, cupom, cliente ou operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Status</SelectItem>
                <SelectItem value="CONCLUIDA">Concluídas</SelectItem>
                <SelectItem value="CANCELADA">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Formas de Pagto</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                <SelectItem value="CARTAO_DEBITO">Débito</SelectItem>
                <SelectItem value="CARTAO_CREDITO">Crédito</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter !== "ALL" || methodFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setMethodFilter("ALL");
                }}
              >
                <X className="mr-1 size-3.5" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Cód / Cupom</th>
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Operador</th>
                  <th className="px-4 py-3">Forma Pagto</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3 text-right">Valor Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      Nenhuma venda encontrada com os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-foreground">
                          {sale.code}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          Cupom #{sale.receiptNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{sale.date}</span>
                        <span className="block text-[10px] text-muted-foreground">{sale.time}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {sale.customerName ?? "Consumidor Final"}
                        </span>
                        {sale.customerDocument && (
                          <span className="block text-[10px] text-muted-foreground">
                            {sale.customerDocument}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{sale.operator}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] font-medium uppercase">
                          {sale.paymentMethod.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{sale.items.length} itens</span>
                      </td>
                      <td className="num px-4 py-3 text-right font-display text-sm font-bold text-foreground">
                        {brl(sale.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {sale.status === "CONCLUIDA" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20">
                            Concluída
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-rose-500/15 text-rose-600 hover:bg-rose-500/20">
                            Cancelada
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            title="Ver Detalhes"
                            onClick={() => handleOpenDetails(sale)}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            title="Reimprimir Cupom"
                            onClick={() => handleOpenReceipt(sale)}
                          >
                            <Printer className="size-3.5" />
                          </Button>
                          {sale.status === "CONCLUIDA" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Cancelar Venda"
                              onClick={() => handleOpenCancel(sale)}
                            >
                              <Ban className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sale Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Venda {selectedSale?.code}</span>
              {selectedSale?.status === "CONCLUIDA" ? (
                <Badge className="bg-emerald-500/15 text-emerald-600">Concluída</Badge>
              ) : (
                <Badge variant="destructive">Cancelada</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Cupom #{selectedSale?.receiptNumber} emitido em {selectedSale?.date} às {selectedSale?.time}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-semibold text-foreground">
                    {selectedSale.customerName ?? "Consumidor Final"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Operador:</span>
                  <p className="font-semibold text-foreground">{selectedSale.operator}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Forma de Pagamento:</span>
                  <p className="font-semibold text-foreground uppercase">
                    {selectedSale.paymentMethod.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">NFC-e Simulada:</span>
                  <p className="truncate font-mono text-[10px] font-medium text-muted-foreground">
                    {selectedSale.nfceKey ?? "Não emitida"}
                  </p>
                </div>
              </div>

              {selectedSale.cancelReason && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <p className="font-semibold">Motivo do Cancelamento:</p>
                  <p className="text-[11px]">{selectedSale.cancelReason}</p>
                  <p className="mt-1 text-[10px] text-rose-600">Cancelada em: {selectedSale.canceledAt}</p>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Itens da Venda:</p>
                <div className="max-h-48 overflow-y-auto rounded border border-border">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-muted/60 text-muted-foreground">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-center">Qtd</th>
                        <th className="p-2 text-right">Unitário</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedSale.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{item.name}</td>
                          <td className="p-2 text-center font-mono">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="p-2 text-right font-mono">{brl(item.price)}</td>
                          <td className="p-2 text-right font-mono font-semibold">
                            {brl(item.quantity * item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total calculation */}
              <div className="space-y-1 rounded border border-border p-2.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono">{brl(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Desconto Aplicado:</span>
                    <span className="font-mono">-{brl(selectedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-sm font-bold text-foreground">
                  <span>TOTAL:</span>
                  <span className="text-primary">{brl(selectedSale.total)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedSale && handleOpenReceipt(selectedSale)}
              >
                <Printer className="mr-1.5 size-3.5" />
                Imprimir Cupom
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Sale Modal */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Ban className="size-5" />
              Cancelar Venda {selectedSale?.code}
            </DialogTitle>
            <DialogDescription>
              Esta ação estornará a venda do caixa e registrará o motivo no histórico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Total da venda:{" "}
              <strong className="text-foreground">{brl(selectedSale?.total ?? 0)}</strong>
            </p>
            <div className="space-y-1.5">
              <label htmlFor="cancel-reason" className="font-semibold text-foreground">
                Justificativa do cancelamento:
              </label>
              <textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Desistência do cliente, erro de lançamento, troca de mercadoria..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:border-primary focus:outline-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCancelOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              className="gap-1.5"
            >
              <Ban className="size-3.5" />
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Simulated Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader>
            <DialogTitle className="text-center font-mono text-xs">
              MERCADINHO CENTRAL - MEUPDV
            </DialogTitle>
            <DialogDescription className="text-center font-mono text-[10px]">
              CNPJ: 12.345.678/0001-90
              <br />
              Rua do Comércio, 100 - Centro - São Paulo/SP
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-2 border-y border-dashed border-border py-2 font-mono text-[10px]">
              <div className="flex justify-between">
                <span>CUPOM NÃO FISCAL</span>
                <span>#{selectedSale.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{selectedSale.date}</span>
                <span>{selectedSale.time}</span>
              </div>
              <div className="border-t border-dashed border-border pt-1">
                {selectedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="max-w-[140px] truncate">{item.name}</span>
                    <span>
                      {item.quantity}x {brl(item.price)} = {brl(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-border pt-1">
                <div className="flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span>{brl(selectedSale.total)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>FORMA:</span>
                  <span>{selectedSale.paymentMethod}</span>
                </div>
              </div>
              <div className="text-center text-[9px] text-muted-foreground">
                Operador: {selectedSale.operator}
                <br />
                Obrigado pela preferência!
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button size="sm" onClick={printSimulated} className="w-full gap-1.5 text-xs">
              <Printer className="size-3.5" />
              Imprimir Recibo (80mm)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReceiptOpen(false)}
              className="w-full text-xs"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
