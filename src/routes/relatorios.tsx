import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  Download,
  FileSpreadsheet,
  Layers,
  PieChart as PieIcon,
  Printer,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios & Análise — MeuPDV" },
      { name: "description", content: "Painel analítico de faturamento, vendas por produto e métodos de pagamento." },
    ],
  }),
  component: RelatoriosPage,
});

// Mock Analytical Data
const DAILY_SALES_DATA = [
  { day: "Seg (17)", vendas: 42, faturamento: 1240.5 },
  { day: "Ter (18)", vendas: 55, faturamento: 1890.0 },
  { day: "Qua (19)", vendas: 61, faturamento: 2150.8 },
  { day: "Qui (20)", vendas: 48, faturamento: 1680.0 },
  { day: "Sex (21)", vendas: 78, faturamento: 3420.0 },
  { day: "Sáb (22)", vendas: 92, faturamento: 4580.5 },
  { day: "Dom (23)", vendas: 38, faturamento: 1530.2 },
];

const PAYMENT_METHODS_DATA = [
  { name: "PIX", value: 6840.0, color: "#10b981", percent: "41.5%" },
  { name: "Cartão Débito", value: 4210.0, color: "#3b82f6", percent: "25.5%" },
  { name: "Dinheiro", value: 3120.0, color: "#f59e0b", percent: "18.9%" },
  { name: "Cartão Crédito", value: 2322.0, color: "#8b5cf6", percent: "14.1%" },
];

const TOP_PRODUCTS_DATA = [
  { name: "Refrigerante 2L", qtd: 142, total: 2840.0 },
  { name: "Cerveja Lata 350ml", qtd: 320, total: 1440.0 },
  { name: "Arroz Tipo 1 5kg", qtd: 48, total: 1339.2 },
  { name: "Feijão Carioca 1kg", qtd: 85, total: 743.75 },
  { name: "Banana Prata (Kg)", qtd: 64, total: 569.6 },
  { name: "Leite Integral 1L", qtd: 98, total: 508.62 },
];

const CATEGORY_BREAKDOWN = [
  { category: "Bebidas", total: 4280.0, share: 26.0, itemsSold: 462 },
  { category: "Alimentos Básicos", total: 5120.0, share: 31.0, itemsSold: 315 },
  { category: "Hortifruti & Açougue", total: 3240.0, share: 19.6, itemsSold: 180 },
  { category: "Laticínios & Frios", total: 2150.0, share: 13.0, itemsSold: 195 },
  { category: "Limpeza & Padaria", total: 1702.0, share: 10.4, itemsSold: 140 },
];

function RelatoriosPage() {
  const [period, setPeriod] = useState("7d");

  const totalPeriodRevenue = useMemo(
    () => DAILY_SALES_DATA.reduce((acc, d) => acc + d.faturamento, 0),
    [],
  );
  const totalPeriodSales = useMemo(
    () => DAILY_SALES_DATA.reduce((acc, d) => acc + d.vendas, 0),
    [],
  );
  const averageTicket = totalPeriodRevenue / totalPeriodSales;
  const estimatedProfit = totalPeriodRevenue * 0.34; // 34% estimated margin

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Dia,Vendas,Faturamento\n" +
      DAILY_SALES_DATA.map((e) => `${e.day},${e.vendas},${e.faturamento}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_vendas_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório exportado em CSV com sucesso!");
  };

  const handlePrint = () => {
    toast.success("Enviado para impressão gerencial!");
  };

  return (
    <AppLayout
      title="Relatórios & Inteligência de Vendas"
      subtitle="Métricas de faturamento, desempenho por categoria e formas de recebimento"
      actions={
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <Download className="size-3.5" />
            Exportar CSV
          </Button>

          <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="size-3.5" />
            Imprimir
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Faturamento Total
              </CardTitle>
              <TrendingUp className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {brl(totalPeriodRevenue)}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">+14.2% vs período anterior</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Atendimentos / Vendas
              </CardTitle>
              <ShoppingBag className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-foreground sm:text-2xl">
                {totalPeriodSales}
              </div>
              <p className="text-[11px] text-muted-foreground">Cupons emitidos</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Ticket Médio
              </CardTitle>
              <DollarSign className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-blue-600 sm:text-2xl">
                {brl(averageTicket)}
              </div>
              <p className="text-[11px] text-muted-foreground">Por cliente atendido</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Lucro Bruto Estimado
              </CardTitle>
              <ArrowUpRight className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="num font-display text-xl font-bold text-purple-600 sm:text-2xl">
                {brl(estimatedProfit)}
              </div>
              <p className="text-[11px] text-muted-foreground">Margem média 34.0%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Area Chart: Evolução de Vendas */}
          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Faturamento Diário no Período (R$)
              </CardTitle>
              <CardDescription className="text-xs">
                Acompanhamento das vendas e movimentação financeira diária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DAILY_SALES_DATA}>
                    <defs>
                      <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                    <Tooltip
                      formatter={(val: number) => [brl(val), "Faturamento"]}
                      contentStyle={{
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="faturamento"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorFaturamento)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Donut Chart */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Formas de Pagamento</CardTitle>
              <CardDescription className="text-xs">
                Distribuição dos recebimentos por modalidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PAYMENT_METHODS_DATA}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {PAYMENT_METHODS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [brl(val), "Valor"]}
                      contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5">
                {PAYMENT_METHODS_DATA.map((pm) => (
                  <div key={pm.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: pm.color }}
                      />
                      <span className="text-muted-foreground">{pm.name}</span>
                    </div>
                    <div className="font-mono font-semibold text-foreground">
                      {brl(pm.value)}{" "}
                      <span className="text-[10px] text-muted-foreground">({pm.percent})</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Top Products and Categories */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Selling Products */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top Produtos Mais Vendidos</CardTitle>
              <CardDescription className="text-xs">
                Ranking por faturamento e unidades vendidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Produto</th>
                      <th className="p-2.5 text-center">Unidades</th>
                      <th className="p-2.5 text-right">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TOP_PRODUCTS_DATA.map((prod, idx) => (
                      <tr key={prod.name} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium flex items-center gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span className="truncate">{prod.name}</span>
                        </td>
                        <td className="num p-2.5 text-center font-mono">{prod.qtd} un</td>
                        <td className="num p-2.5 text-right font-display font-bold text-foreground">
                          {brl(prod.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Category Share Breakdown */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Desempenho por Categoria</CardTitle>
              <CardDescription className="text-xs">
                Participação de cada departamento no faturamento total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-1">
                {CATEGORY_BREAKDOWN.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{cat.category}</span>
                      <span className="font-mono text-muted-foreground">
                        {brl(cat.total)} ({cat.share}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${cat.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
