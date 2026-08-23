import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgePercent,
  Banknote,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Landmark,
  Plus,
  QrCode,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
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
import {
  getStoredFinancial,
  saveStoredFinancial,
  type EntryStatus,
  type EntryType,
  type FinancialEntry,
  type PaymentMethod,
} from "@/data/mock-financial";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Gestão Financeira — MeuPDV" },
      { name: "description", content: "Fluxo de caixa, contas a pagar/receber e sangrias/suprimentos." },
    ],
  }),
  component: FinanceiroPage,
});

const DEFAULT_ENTRY: Omit<FinancialEntry, "id" | "createdAt"> = {
  description: "",
  type: "DESPESA",
  category: "Geral",
  amount: 0,
  paymentMethod: "DINHEIRO",
  status: "PAGO",
  dueDate: new Date().toISOString().split("T")[0],
  operator: "Administrador Geral",
  notes: "",
};

function FinanceiroPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_ENTRY);

  const loadData = () => {
    setEntries(getStoredFinancial());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("meupdv_financial_updated", loadData);
    return () => window.removeEventListener("meupdv_financial_updated", loadData);
  }, []);

  // Filtered
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.entityName && e.entityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        e.operator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "ALL" || e.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entries, searchTerm, typeFilter, statusFilter]);

  // KPIs
  const paidReceitas = entries
    .filter((e) => e.type === "RECEITA" && e.status === "PAGO")
    .reduce((acc, e) => acc + e.amount, 0);

  const paidDespesas = entries
    .filter((e) => e.type === "DESPESA" && e.status === "PAGO")
    .reduce((acc, e) => acc + e.amount, 0);

  const suprimentos = entries
    .filter((e) => e.type === "SUPRIMENTO" && e.status === "PAGO")
    .reduce((acc, e) => acc + e.amount, 0);

  const sangrias = entries
    .filter((e) => e.type === "SANGRIA" && e.status === "PAGO")
    .reduce((acc, e) => acc + e.amount, 0);

  const currentCashBalance = paidReceitas + suprimentos - paidDespesas - sangrias;

  const pendingPayables = entries
    .filter((e) => e.type === "DESPESA" && e.status === "PENDENTE")
    .reduce((acc, e) => acc + e.amount, 0);

  const handleOpenNewEntry = (type: EntryType = "DESPESA") => {
    setFormData({
      ...DEFAULT_ENTRY,
      type,
      category:
        type === "SANGRIA"
          ? "Retirada de Caixa"
          : type === "SUPRIMENTO"
            ? "Abertura / Troco"
            : type === "RECEITA"
              ? "Vendas & Receitas"
              : "Despesas Gerais",
      operator: user?.name ?? "Operador",
    });
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error("Informe a descrição do lançamento.");
      return;
    }
    if (formData.amount <= 0) {
      toast.error("O valor deve ser maior que zero.");
      return;
    }

    const newEntry: FinancialEntry = {
      id: `fin-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      paymentDate:
        formData.status === "PAGO" ? new Date().toLocaleString("pt-BR") : undefined,
    };

    saveStoredFinancial([newEntry, ...entries]);
    setIsModalOpen(false);
    toast.success("Lançamento financeiro registrado com sucesso.");
  };

  const handleMarkAsPaid = (entry: FinancialEntry) => {
    const updated = entries.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            status: "PAGO" as EntryStatus,
            paymentDate: new Date().toLocaleString("pt-BR"),
          }
        : e,
    );
    saveStoredFinancial(updated);
    toast.success(`Conta "${entry.description}" marcada como PAGA.`);
  };

  return (
    <AppLayout
      title="Gestão Financeira & Caixa"
      subtitle="Fluxo de caixa, sangrias, contas a pagar e controle de métodos de pagamento"
      cashTotal={currentCashBalance}
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenNewEntry("SUPRIMENTO")}
            variant="outline"
            size="sm"
            className="gap-1.5 font-medium"
          >
            <Plus className="size-4 text-emerald-500" />
            Suprimento (Troco)
          </Button>
          <Button
            onClick={() => handleOpenNewEntry("SANGRIA")}
            variant="outline"
            size="sm"
            className="gap-1.5 font-medium"
          >
            <TrendingDown className="size-4 text-rose-500" />
            Sangria (Retirada)
          </Button>
          <Button
            onClick={() => handleOpenNewEntry("DESPESA")}
            size="sm"
            className="gap-1.5 font-medium"
          >
            <Plus className="size-4" />
            Novo Lançamento
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
                Saldo Atual em Caixa
              </CardTitle>
              <Wallet className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-emerald-600 sm:text-2xl">
                {brl(currentCashBalance)}
              </div>
              <p className="text-[11px] text-muted-foreground">Dinheiro & recebimentos</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Entradas
              </CardTitle>
              <ArrowDownLeft className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {brl(paidReceitas + suprimentos)}
              </div>
              <p className="text-[11px] text-muted-foreground">Vendas + Suprimentos</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Saídas
              </CardTitle>
              <ArrowUpRight className="size-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-rose-600 sm:text-2xl">
                {brl(paidDespesas + sangrias)}
              </div>
              <p className="text-[11px] text-muted-foreground">Despesas + Sangrias</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Contas a Pagar Pendentes
              </CardTitle>
              <Clock className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-amber-600 sm:text-2xl">
                {brl(pendingPayables)}
              </div>
              <p className="text-[11px] text-muted-foreground">A vencer no mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Financial Sections */}
        <Tabs defaultValue="fluxo" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <TabsList>
              <TabsTrigger value="fluxo" className="flex items-center gap-1.5 text-xs">
                <Landmark className="size-3.5" />
                Fluxo de Caixa & Entradas/Saídas
              </TabsTrigger>
              <TabsTrigger value="contas" className="flex items-center gap-1.5 text-xs">
                <Receipt className="size-3.5" />
                Contas a Pagar & Receber
              </TabsTrigger>
              <TabsTrigger value="sangrias" className="flex items-center gap-1.5 text-xs">
                <Banknote className="size-3.5" />
                Sangrias & Suprimentos
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar lançamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* TAB 1: Fluxo de Caixa */}
          <TabsContent value="fluxo" className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Data / Venc.</th>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Forma Pagto</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Operador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          Nenhum lançamento financeiro encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map((entry) => {
                        const isIncome = entry.type === "RECEITA" || entry.type === "SUPRIMENTO";

                        return (
                          <tr key={entry.id} className="transition-colors hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono text-muted-foreground">
                              {entry.dueDate}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">
                                {entry.description}
                              </div>
                              {entry.entityName && (
                                <span className="text-[10px] text-muted-foreground">
                                  {entry.entityName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {entry.type === "RECEITA" && (
                                <Badge className="bg-emerald-500/15 text-emerald-600">Receita</Badge>
                              )}
                              {entry.type === "DESPESA" && (
                                <Badge variant="destructive" className="bg-rose-500/15 text-rose-600">
                                  Despesa
                                </Badge>
                              )}
                              {entry.type === "SANGRIA" && (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                  Sangria
                                </Badge>
                              )}
                              {entry.type === "SUPRIMENTO" && (
                                <Badge className="bg-blue-500/15 text-blue-600">Suprimento</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{entry.category}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px] font-medium">
                                {entry.paymentMethod.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="num px-4 py-3 text-right font-display text-sm font-bold">
                              <span className={isIncome ? "text-emerald-600" : "text-rose-600"}>
                                {isIncome ? "+" : "-"}
                                {brl(entry.amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {entry.status === "PAGO" ? (
                                <Badge className="bg-emerald-500/15 text-emerald-600">Pago</Badge>
                              ) : (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                  Pendente
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{entry.operator}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Contas a Pagar & Receber */}
          <TabsContent value="contas" className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Vencimento</th>
                      <th className="px-4 py-3">Descrição / Fornecedor</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Forma</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3 text-center">Situação</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries
                      .filter((e) => e.type === "DESPESA" || e.category.includes("Fiado"))
                      .map((entry) => (
                        <tr key={entry.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono font-medium text-foreground">
                            {entry.dueDate}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">
                              {entry.description}
                            </div>
                            {entry.entityName && (
                              <span className="text-[10px] text-muted-foreground">
                                {entry.entityName}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{entry.category}</td>
                          <td className="px-4 py-3 font-medium text-muted-foreground">
                            {entry.paymentMethod}
                          </td>
                          <td className="num px-4 py-3 text-right font-display text-sm font-bold text-foreground">
                            {brl(entry.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {entry.status === "PAGO" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600">
                                Quitado em {entry.paymentDate?.split(" ")[0]}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                Pendente
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {entry.status === "PENDENTE" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() => handleMarkAsPaid(entry)}
                              >
                                <CheckCircle2 className="mr-1 size-3" />
                                Dar Baixa
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Sangrias e Suprimentos */}
          <TabsContent value="sangrias" className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Tipo de Operação</th>
                      <th className="px-4 py-3">Motivo / Descrição</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries
                      .filter((e) => e.type === "SANGRIA" || e.type === "SUPRIMENTO")
                      .map((entry) => (
                        <tr key={entry.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-muted-foreground">
                            {entry.dueDate}
                          </td>
                          <td className="px-4 py-3">
                            {entry.type === "SANGRIA" ? (
                              <Badge className="bg-rose-500/15 text-rose-600">
                                Sangria (Retirada)
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/15 text-emerald-600">
                                Suprimento (Troco)
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">
                              {entry.description}
                            </div>
                            {entry.notes && (
                              <span className="text-[10px] text-muted-foreground">
                                {entry.notes}
                              </span>
                            )}
                          </td>
                          <td className="num px-4 py-3 text-right font-display text-sm font-bold">
                            <span
                              className={
                                entry.type === "SUPRIMENTO" ? "text-emerald-600" : "text-rose-600"
                              }
                            >
                              {entry.type === "SUPRIMENTO" ? "+" : "-"}
                              {brl(entry.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{entry.operator}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Financial Entry Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
            <DialogDescription>
              Registre despesas, receitas, sangrias de caixa ou reforços de troco.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEntry} className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="fin-type" className="text-xs font-semibold">
                Tipo *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val: EntryType) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger id="fin-type" className="h-9 text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESPESA">Despesa / Conta a Pagar</SelectItem>
                  <SelectItem value="RECEITA">Receita / Entrada Extra</SelectItem>
                  <SelectItem value="SANGRIA">Sangria (Retirada de Gaveta)</SelectItem>
                  <SelectItem value="SUPRIMENTO">Suprimento (Fundo de Troco)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="fin-desc" className="text-xs font-semibold">
                Descrição *
              </Label>
              <Input
                id="fin-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Conta de Energia, Pagamento Fornecedor, Troco Manhã..."
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fin-val" className="text-xs font-semibold">
                  Valor R$ *
                </Label>
                <Input
                  id="fin-val"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="h-9 font-mono text-xs font-bold text-primary"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fin-cat" className="text-xs font-semibold">
                  Categoria
                </Label>
                <Input
                  id="fin-cat"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Contas Fixas, Fornecedor..."
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fin-method" className="text-xs font-semibold">
                  Forma de Pagamento
                </Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(val: PaymentMethod) =>
                    setFormData({ ...formData, paymentMethod: val })
                  }
                >
                  <SelectTrigger id="fin-method" className="h-9 text-xs">
                    <SelectValue placeholder="Forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DINHEIRO">Dinheiro (Caixa)</SelectItem>
                    <SelectItem value="PIX">PIX Bancário</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                    <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                    <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fin-status" className="text-xs font-semibold">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: EntryStatus) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="fin-status" className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAGO">Pago / Liquidado</SelectItem>
                    <SelectItem value="PENDENTE">Pendente (A Pagar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="fin-entity" className="text-xs font-semibold">
                Favorecido / Fornecedor / Cliente (Opcional)
              </Label>
              <Input
                id="fin-entity"
                value={formData.entityName || ""}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                placeholder="Ex: Enel, Distribuidora Paulista..."
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Salvar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
