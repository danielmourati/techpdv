import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BadgeDollarSign,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Edit2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { brl } from "@/lib/format";
import {
  getStoredCustomers,
  saveStoredCustomers,
  type Customer,
  type CustomerType,
} from "@/data/mock-customers";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Cadastro de Clientes — MeuPDV" },
      { name: "description", content: "Gerenciamento de clientes, limites de crédito e histórico de compras." },
    ],
  }),
  component: ClientesPage,
});

const DEFAULT_CUSTOMER: Omit<Customer, "id"> = {
  type: "PF",
  name: "",
  document: "",
  email: "",
  phone: "",
  address: "",
  neighborhood: "",
  city: "São Paulo",
  state: "SP",
  zipCode: "",
  creditLimit: 500,
  currentDebt: 0,
  totalPurchased: 0,
  active: true,
  notes: "",
  createdAt: new Date().toISOString().slice(0, 10),
};

function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [debtFilter, setDebtFilter] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, "id">>(DEFAULT_CUSTOMER);

  const loadCustomers = () => {
    setCustomers(getStoredCustomers());
  };

  useEffect(() => {
    loadCustomers();
    window.addEventListener("meupdv_customers_updated", loadCustomers);
    return () => window.removeEventListener("meupdv_customers_updated", loadCustomers);
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.document.includes(searchTerm) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "ALL" || c.type === typeFilter;
      const matchesDebt =
        debtFilter === "ALL" ||
        (debtFilter === "HAS_DEBT" && c.currentDebt > 0) ||
        (debtFilter === "NO_DEBT" && c.currentDebt <= 0);

      return matchesSearch && matchesType && matchesDebt;
    });
  }, [customers, searchTerm, typeFilter, debtFilter]);

  // KPIs
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.active).length;
  const debtorsCount = customers.filter((c) => c.currentDebt > 0).length;
  const totalOutstandingDebt = customers.reduce((acc, c) => acc + c.currentDebt, 0);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData(DEFAULT_CUSTOMER);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      type: cust.type,
      name: cust.name,
      document: cust.document,
      email: cust.email,
      phone: cust.phone,
      address: cust.address,
      neighborhood: cust.neighborhood,
      city: cust.city,
      state: cust.state,
      zipCode: cust.zipCode,
      creditLimit: cust.creditLimit,
      currentDebt: cust.currentDebt,
      totalPurchased: cust.totalPurchased,
      ...(cust.lastPurchaseDate ? { lastPurchaseDate: cust.lastPurchaseDate } : {}),
      active: cust.active,
      notes: cust.notes ?? "",
      createdAt: cust.createdAt,
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("O nome do cliente é obrigatório.");
      return;
    }
    if (!formData.document.trim()) {
      toast.error("O CPF ou CNPJ é obrigatório.");
      return;
    }

    if (editingCustomer) {
      const updated = customers.map((c) =>
        c.id === editingCustomer.id ? { ...c, ...formData } : c,
      );
      saveStoredCustomers(updated);
      toast.success(`Cliente "${formData.name}" atualizado.`);
    } else {
      const newCust: Customer = {
        id: `c${Date.now()}`,
        ...formData,
      };
      saveStoredCustomers([...customers, newCust]);
      toast.success(`Cliente "${formData.name}" cadastrado com sucesso.`);
    }

    setIsModalOpen(false);
  };

  const handleOpenDelete = (cust: Customer) => {
    setCustomerToDelete(cust);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    const updated = customers.filter((c) => c.id !== customerToDelete.id);
    saveStoredCustomers(updated);
    setIsDeleteOpen(false);
    toast.success(`Cliente "${customerToDelete.name}" removido.`);
  };

  const handleOpenHistory = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsHistoryOpen(true);
  };

  const handlePayDebt = (cust: Customer) => {
    const updated = customers.map((c) => (c.id === cust.id ? { ...c, currentDebt: 0 } : c));
    saveStoredCustomers(updated);
    if (selectedCustomer?.id === cust.id) {
      setSelectedCustomer({ ...cust, currentDebt: 0 });
    }
    toast.success(`Débito do cliente ${cust.name} quitado integralmente.`);
  };

  return (
    <AppLayout
      title="Cadastro de Clientes"
      subtitle="Gerenciamento de clientes, controle de fiado/saldo devedor e limites"
      actions={
        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 font-medium">
          <UserPlus className="size-4" />
          Novo Cliente
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total de Clientes
              </CardTitle>
              <Users className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {totalCustomers}
              </div>
              <p className="text-[11px] text-muted-foreground">{activeCustomers} ativos no sistema</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total a Receber (Fiado)
              </CardTitle>
              <DollarSign className="size-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-rose-600 sm:text-2xl">
                {brl(totalOutstandingDebt)}
              </div>
              <p className="text-[11px] text-muted-foreground">{debtorsCount} clientes em débito</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Pessoa Física (PF)
              </CardTitle>
              <User className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {customers.filter((c) => c.type === "PF").length}
              </div>
              <p className="text-[11px] text-muted-foreground">Consumidores finais</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Empresas (PJ)
              </CardTitle>
              <Building2 className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {customers.filter((c) => c.type === "PJ").length}
              </div>
              <p className="text-[11px] text-muted-foreground">Contas corporativas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, CPF/CNPJ, telefone ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">PF e PJ</SelectItem>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>

            <Select value={debtFilter} onValueChange={setDebtFilter}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="Situação Fiado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Débitos</SelectItem>
                <SelectItem value="HAS_DEBT">Com Débito</SelectItem>
                <SelectItem value="NO_DEBT">Em Dia</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || typeFilter !== "ALL" || debtFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("ALL");
                  setDebtFilter("ALL");
                }}
              >
                <X className="mr-1 size-3.5" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo / Doc</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Cidade / Bairro</th>
                  <th className="px-4 py-3 text-right">Limite</th>
                  <th className="px-4 py-3 text-right">Saldo Devedor</th>
                  <th className="px-4 py-3 text-right">Total Comprado</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      Nenhum cliente encontrado com os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const hasDebt = cust.currentDebt > 0;

                    return (
                      <tr
                        key={cust.id}
                        className={`transition-colors hover:bg-muted/30 ${
                          !cust.active ? "opacity-60" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{cust.name}</div>
                          {cust.notes && (
                            <span className="block truncate max-w-[200px] text-[10px] text-muted-foreground">
                              {cust.notes}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <Badge variant="outline" className="text-[10px] mb-0.5">
                            {cust.type}
                          </Badge>
                          <span className="block text-[11px] text-foreground">{cust.document}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">{cust.phone}</div>
                          <div className="text-[10px] text-muted-foreground">{cust.email}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {cust.neighborhood ? `${cust.neighborhood}, ` : ""}
                          {cust.city}-{cust.state}
                        </td>
                        <td className="num px-4 py-3 text-right font-mono text-muted-foreground">
                          {brl(cust.creditLimit)}
                        </td>
                        <td className="num px-4 py-3 text-right font-display text-sm font-bold">
                          <span className={hasDebt ? "text-rose-600" : "text-emerald-600"}>
                            {brl(cust.currentDebt)}
                          </span>
                        </td>
                        <td className="num px-4 py-3 text-right font-display text-sm font-bold text-foreground">
                          {brl(cust.totalPurchased)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {cust.active ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-primary hover:bg-primary/10"
                              title="Ver Ficha / Histórico"
                              onClick={() => handleOpenHistory(cust)}
                            >
                              <FileText className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              title="Editar Cliente"
                              onClick={() => handleOpenEdit(cust)}
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Excluir Cliente"
                              onClick={() => handleOpenDelete(cust)}
                            >
                              <Trash2 className="size-3.5" />
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
      </div>

      {/* Create / Edit Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? `Editar Cliente: ${editingCustomer.name}` : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              Cadastre as informações pessoais, dados de contato e limites comerciais.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCustomer} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="cust-type" className="text-xs font-semibold">
                  Tipo de Pessoa *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: CustomerType) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger id="cust-type" className="h-9 text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física (PF)</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica (PJ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="cust-name" className="text-xs font-semibold">
                  Nome Completo / Razão Social *
                </Label>
                <Input
                  id="cust-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João da Silva ou Padaria Central Ltda"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust-doc" className="text-xs font-semibold">
                  {formData.type === "PF" ? "CPF *" : "CNPJ *"}
                </Label>
                <Input
                  id="cust-doc"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  placeholder={formData.type === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
                  className="h-9 font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust-phone" className="text-xs font-semibold">
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="cust-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 90000-0000"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust-email" className="text-xs font-semibold">
                  E-mail
                </Label>
                <Input
                  id="cust-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Address */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Endereço & Localização
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="cust-addr" className="text-xs font-semibold">
                    Logradouro / Número
                  </Label>
                  <Input
                    id="cust-addr"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua das Flores, 120"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cust-neigh" className="text-xs font-semibold">
                    Bairro
                  </Label>
                  <Input
                    id="cust-neigh"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Centro"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="cust-city" className="text-xs font-semibold">
                    Cidade
                  </Label>
                  <Input
                    id="cust-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cust-state" className="text-xs font-semibold">
                    UF
                  </Label>
                  <Input
                    id="cust-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="SP"
                    maxLength={2}
                    className="h-9 text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Financial Credit Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cust-limit" className="text-xs font-semibold">
                  Limite de Crédito (Fiado) R$
                </Label>
                <Input
                  id="cust-limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.creditLimit || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="h-9 font-mono text-xs font-bold text-primary"
                  placeholder="500.00"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust-debt" className="text-xs font-semibold">
                  Saldo Devedor Atual R$
                </Label>
                <Input
                  id="cust-debt"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentDebt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, currentDebt: parseFloat(e.target.value) || 0 })
                  }
                  className="h-9 font-mono text-xs text-rose-600 font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cust-notes" className="text-xs font-semibold">
                Observações
              </Label>
              <textarea
                id="cust-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Preferências, dias de pagamento, observações adicionais..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:border-primary focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="active-cust" className="text-xs font-semibold">
                  Cadastro Ativo
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Permite lançar compras no caixa para este cliente
                </p>
              </div>
              <Switch
                id="active-cust"
                checked={formData.active}
                onCheckedChange={(val) => setFormData({ ...formData, active: val })}
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
                Salvar Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Record / History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ficha do Cliente: {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.document} · {selectedCustomer?.phone}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/20 p-3">
                <div>
                  <span className="text-muted-foreground">Limite Disponível:</span>
                  <p className="font-mono font-bold text-foreground">
                    {brl(Math.max(0, selectedCustomer.creditLimit - selectedCustomer.currentDebt))}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Débito Atual:</span>
                  <p className="font-mono font-bold text-rose-600">
                    {brl(selectedCustomer.currentDebt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Comprado:</span>
                  <p className="font-mono font-bold text-emerald-600">
                    {brl(selectedCustomer.totalPurchased)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Última Compra:</span>
                  <p className="font-medium text-foreground">
                    {selectedCustomer.lastPurchaseDate ?? "Sem registro"}
                  </p>
                </div>
              </div>

              {selectedCustomer.currentDebt > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/30">
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      Saldo Devedor Pendente
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      {brl(selectedCustomer.currentDebt)} em aberto
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs"
                    onClick={() => handlePayDebt(selectedCustomer)}
                  >
                    Dar Baixa / Quitar
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setIsHistoryOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Excluir Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cliente{" "}
              <strong className="text-foreground">{customerToDelete?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
