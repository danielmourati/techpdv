import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Building,
  Clock,
  CreditCard,
  Edit2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
  User,
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
import { Switch } from "@/components/ui/switch";
import {
  getStoredSuppliers,
  saveStoredSuppliers,
  type Supplier,
} from "@/data/mock-suppliers";
import { PRODUCT_CATEGORIES } from "@/data/mock-products";

export const Route = createFileRoute("/fornecedores")({
  head: () => ({
    meta: [
      { title: "Cadastro de Fornecedores — MeuPDV" },
      { name: "description", content: "Gerenciamento de fornecedores, distribuidores e prazos de entrega." },
    ],
  }),
  component: FornecedoresPage,
});

const DEFAULT_SUPPLIER: Omit<Supplier, "id"> = {
  companyName: "",
  tradeName: "",
  cnpj: "",
  stateRegistration: "",
  email: "",
  phone: "",
  contactPerson: "",
  categories: ["Alimentos Básicos"],
  city: "São Paulo",
  state: "SP",
  deliveryDays: 2,
  paymentTerms: "28 DDL (Boleto)",
  active: true,
  notes: "",
  createdAt: new Date().toISOString().split("T")[0],
};

function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Omit<Supplier, "id">>(DEFAULT_SUPPLIER);

  const loadSuppliers = () => {
    setSuppliers(getStoredSuppliers());
  };

  useEffect(() => {
    loadSuppliers();
    window.addEventListener("meupdv_suppliers_updated", loadSuppliers);
    return () => window.removeEventListener("meupdv_suppliers_updated", loadSuppliers);
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cnpj.includes(searchTerm) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && s.active) ||
        (statusFilter === "INACTIVE" && !s.active);

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  // KPIs
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.active).length;
  const avgDeliveryDays =
    suppliers.length > 0
      ? (suppliers.reduce((acc, s) => acc + s.deliveryDays, 0) / suppliers.length).toFixed(1)
      : "0";

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData(DEFAULT_SUPPLIER);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      companyName: sup.companyName,
      tradeName: sup.tradeName,
      cnpj: sup.cnpj,
      stateRegistration: sup.stateRegistration ?? "",
      email: sup.email,
      phone: sup.phone,
      contactPerson: sup.contactPerson,
      categories: sup.categories,
      city: sup.city,
      state: sup.state,
      deliveryDays: sup.deliveryDays,
      paymentTerms: sup.paymentTerms,
      active: sup.active,
      notes: sup.notes ?? "",
      createdAt: sup.createdAt,
    });
    setIsModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error("A Razão Social é obrigatória.");
      return;
    }
    if (!formData.cnpj.trim()) {
      toast.error("O CNPJ é obrigatório.");
      return;
    }

    if (editingSupplier) {
      const updated = suppliers.map((s) =>
        s.id === editingSupplier.id ? { ...s, ...formData } : s,
      );
      saveStoredSuppliers(updated);
      toast.success(`Fornecedor "${formData.tradeName || formData.companyName}" atualizado.`);
    } else {
      const newSup: Supplier = {
        id: `sup${Date.now()}`,
        ...formData,
      };
      saveStoredSuppliers([...suppliers, newSup]);
      toast.success(
        `Fornecedor "${formData.tradeName || formData.companyName}" cadastrado com sucesso.`,
      );
    }

    setIsModalOpen(false);
  };

  const handleOpenDelete = (sup: Supplier) => {
    setSupplierToDelete(sup);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!supplierToDelete) return;
    const updated = suppliers.filter((s) => s.id !== supplierToDelete.id);
    saveStoredSuppliers(updated);
    setIsDeleteOpen(false);
    toast.success(`Fornecedor "${supplierToDelete.tradeName}" removido.`);
  };

  const toggleCategory = (cat: string) => {
    const exists = formData.categories.includes(cat);
    if (exists) {
      setFormData({
        ...formData,
        categories: formData.categories.filter((c) => c !== cat),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, cat],
      });
    }
  };

  return (
    <AppLayout
      title="Cadastro de Fornecedores"
      subtitle="Gerenciamento de fornecedores, distribuidores parceiros e prazos de entrega"
      actions={
        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 font-medium">
          <Plus className="size-4" />
          Novo Fornecedor
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total de Fornecedores
              </CardTitle>
              <Truck className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {totalSuppliers}
              </div>
              <p className="text-[11px] text-muted-foreground">{activeSuppliers} ativos no cadastro</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Prazo Médio de Entrega
              </CardTitle>
              <Clock className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-emerald-600 sm:text-2xl">
                {avgDeliveryDays} dias
              </div>
              <p className="text-[11px] text-muted-foreground">Após emissão do pedido</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Fornecedores Ativos
              </CardTitle>
              <Building className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-blue-600 sm:text-2xl">
                {activeSuppliers}
              </div>
              <p className="text-[11px] text-muted-foreground">Com pedidos regulares</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Condições Médias
              </CardTitle>
              <CreditCard className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-lg font-bold text-foreground sm:text-xl">
                28 DDL / Boleto
              </div>
              <p className="text-[11px] text-muted-foreground">Padrão de faturamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por Razão Social, Nome Fantasia, CNPJ, Contato ou Cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(searchTerm || statusFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
              >
                <X className="mr-1 size-3.5" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Fornecedor / Razão Social</th>
                  <th className="px-4 py-3">CNPJ / IE</th>
                  <th className="px-4 py-3">Contato & Telefone</th>
                  <th className="px-4 py-3">Categorias Fornecidas</th>
                  <th className="px-4 py-3">Cidade / UF</th>
                  <th className="px-4 py-3 text-center">Prazo Entrega</th>
                  <th className="px-4 py-3">Condições</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      Nenhum fornecedor encontrado com os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr
                      key={sup.id}
                      className={`transition-colors hover:bg-muted/30 ${
                        !sup.active ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {sup.tradeName || sup.companyName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{sup.companyName}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="text-foreground">{sup.cnpj}</div>
                        <div className="text-[10px] text-muted-foreground">
                          IE: {sup.stateRegistration || "Isento"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{sup.contactPerson}</div>
                        <div className="text-[10px] text-muted-foreground">{sup.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {sup.categories.map((c) => (
                            <Badge key={c} variant="outline" className="text-[9px] px-1 py-0">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {sup.city}-{sup.state}
                      </td>
                      <td className="num px-4 py-3 text-center font-mono font-bold text-foreground">
                        {sup.deliveryDays} dias
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">
                        {sup.paymentTerms}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {sup.active ? (
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
                            title="Editar Fornecedor"
                            onClick={() => handleOpenEdit(sup)}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Excluir Fornecedor"
                            onClick={() => handleOpenDelete(sup)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
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

      {/* Create / Edit Supplier Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier
                ? `Editar Fornecedor: ${editingSupplier.tradeName || editingSupplier.companyName}`
                : "Novo Fornecedor"}
            </DialogTitle>
            <DialogDescription>
              Dados da empresa distribuidora, dados fiscais, prazos e categorias atendidas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSupplier} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="sup-comp" className="text-xs font-semibold">
                  Razão Social *
                </Label>
                <Input
                  id="sup-comp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Ex: Distribuidora de Alimentos Paulista S/A"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sup-trade" className="text-xs font-semibold">
                  Nome Fantasia
                </Label>
                <Input
                  id="sup-trade"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  placeholder="Ex: Paulista Alimentos"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sup-cnpj" className="text-xs font-semibold">
                  CNPJ *
                </Label>
                <Input
                  id="sup-cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="h-9 font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sup-ie" className="text-xs font-semibold">
                  Inscrição Estadual (IE)
                </Label>
                <Input
                  id="sup-ie"
                  value={formData.stateRegistration}
                  onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                  placeholder="000.000.000.000 ou ISENTO"
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sup-contact" className="text-xs font-semibold">
                  Nome do Representante / Vendedor
                </Label>
                <Input
                  id="sup-contact"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Ex: Marcos Silva (Representante)"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sup-phone" className="text-xs font-semibold">
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="sup-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 3000-0000"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="sup-email" className="text-xs font-semibold">
                  E-mail de Pedidos
                </Label>
                <Input
                  id="sup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="pedidos@fornecedor.com.br"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Location and Logistics */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Logística & Condições Comerciais
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="sup-city" className="text-xs font-semibold">
                    Cidade
                  </Label>
                  <Input
                    id="sup-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sup-state" className="text-xs font-semibold">
                    UF
                  </Label>
                  <Input
                    id="sup-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="SP"
                    maxLength={2}
                    className="h-9 text-xs uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sup-days" className="text-xs font-semibold">
                    Prazo Entrega (dias)
                  </Label>
                  <Input
                    id="sup-days"
                    type="number"
                    min="1"
                    value={formData.deliveryDays || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryDays: parseInt(e.target.value) || 1 })
                    }
                    className="h-9 font-mono text-xs"
                    placeholder="2"
                  />
                </div>

                <div className="space-y-1 sm:col-span-4">
                  <Label htmlFor="sup-terms" className="text-xs font-semibold">
                    Condições de Pagamento Padrão
                  </Label>
                  <Input
                    id="sup-terms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="Ex: 28 DDL (Boleto Bancário), À Vista, 14/28 DDL"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Categorias Fornecidas</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_CATEGORIES.map((cat) => {
                  const selected = formData.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        selected
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-notes" className="text-xs font-semibold">
                Observações Adicionais
              </Label>
              <textarea
                id="sup-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Pedidos até segunda 12h chegam na quarta; valor mínimo de pedido R$ 300,00..."
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:border-primary focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="active-sup" className="text-xs font-semibold">
                  Fornecedor Ativo
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Habilita o lançamento de pedidos de compra e notas fiscais
                </p>
              </div>
              <Switch
                id="active-sup"
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
                Salvar Fornecedor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Excluir Fornecedor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fornecedor{" "}
              <strong className="text-foreground">
                {supplierToDelete?.tradeName || supplierToDelete?.companyName}
              </strong>
              ?
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
