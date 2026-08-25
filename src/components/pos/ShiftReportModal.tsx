import { useMemo } from "react";
import { toast } from "sonner";
import { FileText, Printer, Receipt, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import { useSettings } from "@/hooks/useSettings";
import type { CashShift } from "@/data/mock-cash-shift";
import { getStoredSalesHistory, type CompletedSale } from "@/data/mock-sales-history";
import { getShiftSalesList, openShiftReportPreview } from "@/lib/shift-report";

function Line({
  label,
  value,
  bold,
  className,
}: {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? "font-bold" : ""} ${className ?? ""}`}>
      <span>{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}

const Dashed = () => <div className="my-1.5 border-t border-dashed border-foreground/30" />;

export function ShiftReportModal({
  open,
  onOpenChange,
  shift,
  sales,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: CashShift | null;
  sales?: CompletedSale[];
}) {
  const { settings } = useSettings();

  const shiftSales = useMemo(() => {
    if (!shift) return [];
    return getShiftSalesList(shift, sales ?? getStoredSalesHistory());
  }, [shift, sales]);

  if (!shift) return null;

  const diff = shift.difference ?? 0;
  const diffTone =
    Math.abs(diff) <= 0.01 ? "text-emerald-600" : diff < 0 ? "text-rose-600" : "text-amber-600";

  const time = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "-";

  const handleFullReport = () => {
    const ok = openShiftReportPreview(shift, shiftSales, {
      tradeName: settings.tradeName,
      companyName: settings.companyName,
      cnpj: settings.cnpj,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      phone: settings.phone,
    });
    if (!ok) {
      toast.error("Não foi possível abrir a nova aba. Libere os pop-ups deste site.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-0 print:max-w-none print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Receipt className="size-4" />
            </span>
            <div>
              <DialogTitle className="font-display text-base font-bold">
                Relatório do Turno
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                Conferência de fechamento de caixa
              </p>
            </div>
          </div>
        </div>

        {/* Cupom */}
        <div className="bg-muted/30 p-4 print:bg-transparent print:p-0">
          <div
            id="shift-receipt-print"
            className="print-receipt mx-auto w-full max-w-[19rem] rounded-md border border-border bg-card p-4 font-mono text-[11px] leading-relaxed text-foreground shadow-sm"
          >
            <div className="text-center">
              <p className="font-display text-sm font-bold uppercase">{settings.tradeName}</p>
              <p className="text-[10px]">{settings.companyName}</p>
              <p className="text-[10px]">CNPJ {settings.cnpj}</p>
              <p className="text-[10px]">
                {settings.address} — {settings.city}/{settings.state}
              </p>
            </div>

            <Dashed />
            <p className="text-center text-[11px] font-bold uppercase tracking-wide">
              Fechamento de Caixa
            </p>
            <Dashed />

            <Line label="TURNO:" value={shift.id.slice(-8).toUpperCase()} />
            <Line label="OPERADOR:" value={shift.operatorName} />
            <Line label="ABERTURA:" value={time(shift.openedAt)} />
            <Line label="ENCERRAMENTO:" value={shift.closedAt ? time(shift.closedAt) : "Agora"} />
            <Line label="CUPONS:" value={String(shiftSales.length)} />

            <Dashed />
            <Line label="FUNDO INICIAL:" value={brl(shift.initialFloat)} />
            <Line label="VENDAS DINHEIRO:" value={brl(shift.cashSalesTotal)} />
            <Line label="VENDAS PIX:" value={brl(shift.pixSalesTotal)} />
            <Line label="CARTÃO DÉBITO:" value={brl(shift.cardDebitSalesTotal)} />
            <Line label="CARTÃO CRÉDITO:" value={brl(shift.cardCreditSalesTotal)} />
            <Line label="TOTAL VENDAS:" value={brl(shift.totalSales)} bold />

            <Dashed />
            <Line label="SALDO ESPERADO:" value={brl(shift.expectedCash ?? 0)} bold />
            <Line label="VALOR CONTADO:" value={brl(shift.countedCash ?? 0)} bold />
            <Line
              label="DIFERENÇA:"
              value={brl(diff)}
              bold
              className={`text-xs ${diffTone} print:text-foreground`}
            />

            {shift.differenceReason && (
              <>
                <Dashed />
                <p className="font-bold">JUSTIFICATIVA:</p>
                <p className="italic">{shift.differenceReason}</p>
                <p className="text-[10px]">Autorizado por: {shift.adminAuthorizedBy ?? "-"}</p>
              </>
            )}

            <Dashed />
            <p className="text-center text-[10px]">
              Emitido em{" "}
              {new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </p>
            <p className="text-center text-[10px] uppercase">
              Documento não fiscal · Conferência interna
            </p>
            {settings.receiptFooterMessage && (
              <p className="mt-1 text-center text-[10px]">{settings.receiptFooterMessage}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-1.5 text-xs">
            <X className="size-4" />
            Fechar
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5 text-xs font-semibold"
          >
            <Printer className="size-4" />
            Imprimir cupom (resumido)
          </Button>
          <Button onClick={handleFullReport} className="gap-1.5 text-xs font-bold">
            <FileText className="size-4" />
            Relatório completo (A4)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
