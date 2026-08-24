import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Boxes,
  Camera,
  CheckCircle2,
  DollarSign,
  Edit2,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
  PackageCheck,
  PackagePlus,
  Percent,
  Plus,
  Scale,
  Search,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
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

async function compressImage(file: File, maxWidth = 500, maxHeight = 500, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  imageUrl: "",
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

  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB.");
      return;
    }

    try {
      toast.loading("Otimizando foto do produto...", { id: "img-upload" });
      const compressedBase64 = await compressImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      toast.success("Foto do produto carregada e otimizada!", { id: "img-upload" });
    } catch (err) {
      toast.error("Erro ao processar imagem.", { id: "img-upload" });
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setFormData((prev) => ({ ...prev, imageUrl: urlInput.trim() }));
    setUrlInput("");
    toast.success("URL da foto aplicada com sucesso!");
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setUrlInput("");
    setFormData({
      ...DEFAULT_FORM_PRODUCT,
      code: `7891000${Math.floor(100000 + Math.random() * 900000)}`,
      internalCode: `PRD-${products.length + 1}`,
      imageUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setUrlInput("");
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
      imageUrl: prod.imageUrl ?? "",
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
                  <th className="w-12 px-3 py-3 text-center">Foto</th>
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
                    <td colSpan={11} className="py-8 text-center text-muted-foreground">
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
                        <td className="px-3 py-2 text-center">
                          <div className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40 shadow-2xs">
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="size-full object-cover transition-transform duration-200 hover:scale-125"
                                loading="lazy"
                              />
                            ) : (
                              <ImageIcon className="size-4 text-muted-foreground/40" />
                            )}
                          </div>
                        </td>
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

            {/* Product Image Upload Section */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Camera className="size-4 text-primary" />
                  Foto do Produto
                </Label>
                {formData.imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    className="h-6 px-2 text-[11px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 gap-1"
                  >
                    <Trash2 className="size-3" />
                    Remover foto
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-center">
                {/* Preview / Trigger */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative size-24 shrink-0 rounded-lg border-2 border-dashed border-border hover:border-primary bg-card flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all shadow-xs"
                  title="Clique para escolher uma imagem"
                >
                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                        <Camera className="size-4 mb-0.5" />
                        <span className="text-[9px] font-semibold">Trocar</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                      <UploadCloud className="size-6 mb-1" />
                      <span className="text-[10px] font-semibold leading-tight">Enviar Foto</span>
                      <span className="text-[8px] opacity-70">PNG/JPG</span>
                    </div>
                  )}
                </div>

                {/* Dropzone & URL Input */}
                <div className="space-y-2">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border border-dashed border-border hover:border-primary bg-background/50 p-2.5 text-center cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground">
                      Arraste uma foto aqui ou <span className="text-primary font-semibold underline">clique para selecionar</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Otimização e compressão automática no navegador (máx. 10MB)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Ou cole a URL direta da imagem..."
                        className="h-8 pl-8 text-xs font-mono"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyUrl();
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyUrl}
                      className="h-8 text-xs shrink-0"
                    >
                      Aplicar URL
                    </Button>
                  </div>
                </div>
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
