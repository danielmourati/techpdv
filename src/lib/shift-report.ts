import type { CashShift } from "@/data/mock-cash-shift";
import type { CompletedSale } from "@/data/mock-sales-history";
import { brl } from "@/lib/format";

export type ReportStore = {
  tradeName: string;
  companyName: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
};

export const PAYMENT_LABELS: Record<CompletedSale["paymentMethod"], string> = {
  DINHEIRO: "Dinheiro",
  PIX: "PIX",
  CARTAO_DEBITO: "Cartão Débito",
  CARTAO_CREDITO: "Cartão Crédito",
  MULTIPLO: "Múltiplo",
};

/** Vendas pertencentes ao turno (mesma janela usada no cálculo do fechamento). */
export function getShiftSalesList(shift: CashShift, allSales: CompletedSale[]): CompletedSale[] {
  const start = new Date(shift.openedAt).getTime();
  const end = shift.closedAt ? new Date(shift.closedAt).getTime() : Date.now();
  return allSales.filter((s) => {
    if (s.status === "CANCELADA") return false;
    const t = new Date(`${s.date}T${s.time}`).getTime();
    if (isNaN(t)) return true;
    return t >= start - 60000 && t <= end + 60000;
  });
}

const dt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "-";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildShiftReportHtml(
  shift: CashShift,
  sales: CompletedSale[],
  store: ReportStore,
): string {
  const cardTotal = shift.cardDebitSalesTotal + shift.cardCreditSalesTotal;
  const diff = shift.difference ?? 0;
  const diffColor = Math.abs(diff) <= 0.01 ? "#059669" : diff < 0 ? "#e11d48" : "#d97706";

  const rows = sales.length
    ? sales
        .map(
          (s) => `<tr>
      <td>${esc(s.code)}</td>
      <td>${esc(s.time)}</td>
      <td>${esc(s.customerName ?? "Consumidor final")}</td>
      <td>${esc(PAYMENT_LABELS[s.paymentMethod] ?? s.paymentMethod)}</td>
      <td class="r">${esc(brl(s.total))}</td>
      <td>${esc(s.status)}</td>
    </tr>`,
        )
        .join("")
    : `<tr><td colspan="6" class="c muted">Nenhuma venda registrada neste turno.</td></tr>`;

  const totalsBlock = [
    ["Fundo inicial (troco)", shift.initialFloat],
    ["Vendas em dinheiro", shift.cashSalesTotal],
    ["Vendas em PIX", shift.pixSalesTotal],
    ["Vendas em cartão de débito", shift.cardDebitSalesTotal],
    ["Vendas em cartão de crédito", shift.cardCreditSalesTotal],
    ["Total em cartões", cardTotal],
    ["Total geral de vendas", shift.totalSales],
  ]
    .map(
      ([label, value]) =>
        `<div class="row"><span>${esc(String(label))}</span><b>${esc(brl(Number(value)))}</b></div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Relatório de Fechamento de Caixa — ${esc(store.tradeName)}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; color: #111827; margin: 0; font-size: 12px; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; margin: 18px 0 6px; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 10px; }
  .muted { color: #6b7280; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e5e7eb; }
  .box { border: 1px solid #d1d5db; border-radius: 6px; padding: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th, td { border-bottom: 1px solid #e5e7eb; padding: 5px 6px; text-align: left; }
  th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
  .r { text-align: right; } .c { text-align: center; }
  .sign { display: flex; gap: 40px; margin-top: 48px; }
  .sign div { flex: 1; border-top: 1px solid #111827; padding-top: 4px; text-align: center; font-size: 11px; }
  .big { font-size: 15px; font-weight: 700; }
  @media print { .noprint { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      <h1>${esc(store.tradeName)}</h1>
      <div class="muted">${esc(store.companyName)}</div>
      <div class="muted">CNPJ: ${esc(store.cnpj)} &nbsp;·&nbsp; ${esc(store.phone)}</div>
      <div class="muted">${esc(store.address)} — ${esc(store.city)}/${esc(store.state)}</div>
    </div>
    <div style="text-align:right">
      <div class="big">Relatório de Fechamento de Caixa</div>
      <div class="muted">Turno: ${esc(shift.id)}</div>
      <div class="muted">Emitido em ${esc(dt(new Date().toISOString()))}</div>
    </div>
  </div>

  <h2>Identificação do turno</h2>
  <div class="grid">
    <div class="row"><span>Operador responsável</span><b>${esc(shift.operatorName)}</b></div>
    <div class="row"><span>Status</span><b>${shift.status === "CLOSED" ? "Encerrado" : "Aberto"}</b></div>
    <div class="row"><span>Abertura</span><b>${esc(dt(shift.openedAt))}</b></div>
    <div class="row"><span>Encerramento</span><b>${esc(dt(shift.closedAt))}</b></div>
    <div class="row"><span>Cupons emitidos</span><b>${sales.length}</b></div>
    <div class="row"><span>Ticket médio</span><b>${esc(brl(sales.length ? shift.totalSales / sales.length : 0))}</b></div>
  </div>

  <h2>Totais por forma de pagamento</h2>
  <div class="box">${totalsBlock}</div>

  <h2>Conferência da gaveta</h2>
  <div class="box">
    <div class="row"><span>Saldo esperado em dinheiro</span><b>${esc(brl(shift.expectedCash ?? 0))}</b></div>
    <div class="row"><span>Valor contado pelo operador</span><b>${esc(brl(shift.countedCash ?? 0))}</b></div>
    <div class="row"><span class="big">Diferença</span><b class="big" style="color:${diffColor}">${esc(brl(diff))}</b></div>
    ${
      shift.differenceReason
        ? `<div style="margin-top:8px"><b>Justificativa:</b> ${esc(shift.differenceReason)}<br/><span class="muted">Autorizado por: ${esc(shift.adminAuthorizedBy ?? "-")}</span></div>`
        : ""
    }
  </div>

  <h2>Vendas do turno</h2>
  <table>
    <thead><tr><th>Cupom</th><th>Hora</th><th>Cliente</th><th>Pagamento</th><th class="r">Valor</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="sign">
    <div>Operador de caixa — ${esc(shift.operatorName)}</div>
    <div>Responsável / Supervisão</div>
  </div>

  <p class="muted" style="margin-top:24px">Documento gerencial de conferência interna. Não possui valor fiscal.</p>
</body>
</html>`;
}

/** Abre o relatório A4 em nova aba e dispara o preview de impressão. */
export function openShiftReportPreview(
  shift: CashShift,
  sales: CompletedSale[],
  store: ReportStore,
): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(buildShiftReportHtml(shift, sales, store));
  win.document.close();
  win.focus();
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* usuário pode imprimir manualmente */
    }
  }, 400);
  return true;
}
