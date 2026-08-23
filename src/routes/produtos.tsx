import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  DollarSign,
  Edit2,
  Package,
  PackageCheck,
  PackagePlus,
  Percent,
  Plus,
  Scale,
  Search,
  SlidersHorizontal,
  Trash2,
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
  getStoredProducts,
  saveStoredProducts,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from "@/data/mock-products";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Cadastro de Produtos — MeuPDV" },
      { name: "description", content: "Cadastro, edição e controle de preços e estoque de produtos." },
    ],
  }),
  component: ProdutosPage,
});

const DEFAULT_FORM_PRODUCT: Omit<Product, "id"> = {
  name: "",
  code: "",
  internalCode: "",
  category: "Alimentos Básicos",
  unit: "UN",
  costPrice: 0,
  price: 0,
  stock: 0,
  minStock: 5,
  soldByWeight: false,
  quickAdd: false,
  active: true,
};

function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<string>("ALL");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "id">>(DEFAULT_FORM_PRODUCT);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadProducts = () => {
    setProducts(getStoredProducts());
  };

  useEffect(() => {
    loadProducts();
    window.addEventListener("meupdv_products_updated", loadProducts);
    return () => window.removeEventListener("meupdv_products_updated", loadProducts);
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.includes(searchTerm) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" && p.stock <= p.minStock) ||
        (stockFilter === "OUT" && p.stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  // KPIs
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active !== false).length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  // Profit Margin calculation
  const calculatedMargin =
    formData.costPrice > 0
      ? (((formData.price - formData.costPrice) / formData.costPrice) * 100).toFixed(1)
      : "0.0";

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      ...DEFAULT_FORM_PRODUCT,
      code: `7891000${Math.floor(100000 + Math.random() * 900000)}`,
      internalCode: `PRD-${products.length + 1}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      code: prod.code,
      internalCode: prod.internalCode ?? "",
      category: prod.category,
      unit: prod.unit,
      costPrice: prod.costPrice ?? 0,
      price: prod.price,
      stock: prod.stock,
      minStock: prod.minStock ?? 5,
      soldByWeight: !!prod.soldByWeight,
      quickAdd: !!prod.quickAdd,
      active: prod.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("O nome do produto é obrigatório.");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("O código de barras é obrigatório.");
      return;
    }
    if (formData.price <= 0) {
      toast.error("O preço de venda deve ser maior que zero.");
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : p,
      );
      saveStoredProducts(updated);
      toast.success(`Produto "${formData.name}" atualizado com sucesso.`);
    } else {
      const newProd: Product = {
        id: `p${Date.now()}`,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      saveStoredProducts([...products, newProd]);
      toast.success(`Produto "${formData.name}" cadastrado com sucesso.`);
    }

    setIsModalOpen(false);
  };

  const handleOpenDelete = (prod: Product) => {
    setProductToDelete(prod);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const updated = products.filter((p) => p.id !== productToDelete.id);
    saveStoredProducts(updated);
    setIsDeleteOpen(false);
    toast.success(`Produto "${productToDelete.name}" excluído.`);
  };

  return (
    <AppLayout
      title="Cadastro de Produtos"
      subtitle="Gerenciamento do catálogo de produtos, preços, códigos de barras e estoque"
      actions={
        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 font-medium">
          <Plus className="size-4" />
          Novo Produto
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total de Itens
              </CardTitle>
              <Package className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {totalProducts}
              </div>
              <p className="text-[11px] text-muted-foreground">{activeProducts} produtos ativos</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Valor em Estoque
              </CardTitle>
              <DollarSign className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-emerald-600 sm:text-2xl">
                {brl(totalInventoryValue)}
              </div>
              <p className="text-[11px] text-muted-foreground">A preço de venda</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Estoque Baixo
              </CardTitle>
              <AlertTriangle className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-amber-600 sm:text-2xl">
                {lowStockCount}
              </div>
              <p className="text-[11px] text-muted-foreground">Abaixo do mínimo</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Venda por Peso
              </CardTitle>
              <Scale className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-blue-600 sm:text-2xl">
                {products.filter((p) => p.soldByWeight).length}
              </div>
              <p className="text-[11px] text-muted-foreground">Integrados com balança</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, código de barras EAN ou código interno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Categorias</SelectItem>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="Estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todo Estoque</SelectItem>
                <SelectItem value="LOW">Estoque Baixo</SelectItem>
                <SelectItem value="OUT">Esgotados</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || categoryFilter !== "ALL" || stockFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("ALL");
                  setStockFilter("ALL");
                }}
              >
                <X className="mr-1 size-3.5" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-center">Unidade</th>
                  <th className="px-4 py-3 text-right">Custo</th>
                  <th className="px-4 py-3 text-right">Preço Venda</th>
                  <th className="px-4 py-3 text-center">Margem</th>
                  <th className="px-4 py-3 text-right">Estoque</th>
                  <th className="px-4 py-3 text-center">Atalhos</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-muted-foreground">
                      Nenhum produto encontrado com os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLowStock = prod.stock <= prod.minStock;
                    const margin =
                      prod.costPrice > 0
                        ? (((prod.price - prod.costPrice) / prod.costPrice) * 100).toFixed(0)
                        : "—";

                    return (
                      <tr
                        key={prod.id}
                        className={`transition-colors hover:bg-muted/30 ${
                          prod.active === false ? "opacity-60" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-mono">
                          <span className="font-semibold text-foreground">{prod.code}</span>
                          {prod.internalCode && (
                            <span className="block text-[10px] text-muted-foreground">
                              {prod.internalCode}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{prod.name}</div>
                          {prod.active === false && (
                            <span className="text-[10px] text-rose-500 font-semibold">(Inativo)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">
                            {prod.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold">
                          {prod.unit}
                        </td>
                        <td className="num px-4 py-3 text-right font-mono text-muted-foreground">
                          {brl(prod.costPrice)}
                        </td>
                        <td className="num px-4 py-3 text-right font-display text-sm font-bold text-foreground">
                          {brl(prod.price)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 font-mono text-[10px]"
                          >
                            +{margin}%
                          </Badge>
                        </td>
                        <td className="num px-4 py-3 text-right font-display text-sm font-bold">
                          <span
                            className={
                              isLowStock
                                ? "text-rose-600"
                                : "text-foreground"
                            }
                          >
                            {prod.stock} {prod.unit}
                          </span>
                          {isLowStock && (
                            <span className="block text-[9px] font-medium text-rose-500">
                              Mín: {prod.minStock}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {prod.quickAdd && (
                              <Badge className="bg-primary/10 text-primary text-[9px] px-1">
                                Rápido
                              </Badge>
                            )}
                            {prod.soldByWeight && (
                              <Badge className="bg-blue-500/10 text-blue-600 text-[9px] px-1">
                                Balança
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-primary hover:bg-primary/10"
                              title="Editar Produto"
                              onClick={() => handleOpenEdit(prod)}
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Excluir Produto"
                              onClick={() => handleOpenDelete(prod)}
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

      {/* Create / Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? `Editar Produto: ${editingProduct.name}` : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados cadastrais, fiscais, preços e controle de estoque do item.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="prod-name" className="text-xs font-semibold">
                  Nome do Produto *
                </Label>
                <Input
                  id="prod-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  placeholder="Ex: REFRIGERANTE COCA-COLA 2L"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-code" className="text-xs font-semibold">
                  Código de Barras (EAN-13) *
                </Label>
                <Input
                  id="prod-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: 7891000100101"
                  className="h-9 font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-internal" className="text-xs font-semibold">
                  Código Interno / SKU
                </Label>
                <Input
                  id="prod-internal"
                  value={formData.internalCode}
                  onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                  placeholder="Ex: REF-001"
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-cat" className="text-xs font-semibold">
                  Categoria *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val: ProductCategory) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger id="prod-cat" className="h-9 text-xs">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-unit" className="text-xs font-semibold">
                  Unidade de Medida *
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(val) => setFormData({ ...formData, unit: val })}
                >
                  <SelectTrigger id="prod-unit" className="h-9 text-xs font-mono">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">UN - Unidade</SelectItem>
                    <SelectItem value="KG">KG - Quilograma</SelectItem>
                    <SelectItem value="PC">PC - Pacote</SelectItem>
                    <SelectItem value="FD">FD - Fardo</SelectItem>
                    <SelectItem value="CX">CX - Caixa</SelectItem>
                    <SelectItem value="LT">LT - Litro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Precificação & Lucratividade
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="prod-cost" className="text-xs font-semibold">
                    Preço de Custo (R$)
                  </Label>
                  <Input
                    id="prod-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="h-9 font-mono text-xs"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prod-price" className="text-xs font-semibold">
                    Preço de Venda (R$) *
                  </Label>
                  <Input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="h-9 font-mono text-xs font-bold text-primary"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Margem Estimada</Label>
                  <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 font-mono text-xs font-bold text-emerald-600">
                    +{calculatedMargin}%
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Control */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="prod-stock" className="text-xs font-semibold">
                  Estoque Atual
                </Label>
                <Input
                  id="prod-stock"
                  type="number"
                  step="any"
                  value={formData.stock || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })
                  }
                  className="h-9 font-mono text-xs"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-min-stock" className="text-xs font-semibold">
                  Estoque Mínimo (Alerta)
                </Label>
                <Input
                  id="prod-min-stock"
                  type="number"
                  step="any"
                  value={formData.minStock || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })
                  }
                  className="h-9 font-mono text-xs"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="quick-add" className="text-xs font-semibold">
                    Adição Rápida no PDV (QuickAdd)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Exibir botão de atalho na grade da frente de caixa
                  </p>
                </div>
                <Switch
                  id="quick-add"
                  checked={formData.quickAdd}
                  onCheckedChange={(val) => setFormData({ ...formData, quickAdd: val })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2">
                <div>
                  <Label htmlFor="weight-item" className="text-xs font-semibold">
                    Venda por Peso (Balança)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Solicita leitura de balança ou digitação de peso em KG
                  </p>
                </div>
                <Switch
                  id="weight-item"
                  checked={formData.soldByWeight}
                  onCheckedChange={(val) => setFormData({ ...formData, soldByWeight: val })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2">
                <div>
                  <Label htmlFor="active-item" className="text-xs font-semibold">
                    Produto Ativo no Catálogo
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Permite localizar e vender o produto no PDV
                  </p>
                </div>
                <Switch
                  id="active-item"
                  checked={formData.active}
                  onCheckedChange={(val) => setFormData({ ...formData, active: val })}
                />
              </div>
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
                Salvar Produto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Excluir Produto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto{" "}
              <strong className="text-foreground">{productToDelete?.name}</strong>? Esta ação removerá
              o item do catálogo.
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
