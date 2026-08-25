import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  KeyRound,
  Lock,
  Printer,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
  Wallet,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCashShift } from "@/hooks/useCashShift";
import { brl } from "@/lib/format";
import { type CashShift } from "@/data/mock-cash-shift";

interface CashShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "OPENING" | "CLOSING";
}

export function CashShiftModal({ open, onOpenChange, initialMode }: CashShiftModalProps) {
  const { user } = useAuth();
  const { currentShift, isShiftOpen, shiftSales, openShift, closeShift, validateAdminPassword } =
    useCashShift();

  const [mode, setMode] = useState<"OPENING" | "CLOSING" | "RECEIPT">("OPENING");
  const [openingFloatInput, setOpeningFloatInput] = useState("100.00");

  // Closing fields
  const [countedCashInput, setCountedCashInput] = useState("");
  const [differenceReason, setDifferenceReason] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closedSummary, setClosedSummary] = useState<CashShift | null>(null);

  // Sync mode with current shift state
  useEffect(() => {
    if (open) {
      if (initialMode) {
        setMode(initialMode);
      } else {
        setMode(isShiftOpen ? "CLOSING" : "OPENING");
      }
      setCountedCashInput("");
      setDifferenceReason("");
      setAdminPassword("");
      setClosedSummary(null);
    }
  }, [open, isShiftOpen, initialMode]);

  const parsedCountedCash = parseFloat(countedCashInput.replace(",", ".")) || 0;
  const expectedCash = shiftSales.expectedCashInDrawer;
  const hasCountedInput = countedCashInput.trim().length > 0;
  const rawDifference = parsedCountedCash - expectedCash;
  const difference = Number(rawDifference.toFixed(2));
  const isExactMatch = hasCountedInput && Math.abs(difference) <= 0.01;
  const hasDivergence = hasCountedInput && !isExactMatch;
  const isCashShortage = difference < -0.01;
  const isCashSurplus = difference > 0.01;

  // Handle Shift Opening
  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const floatAmount = parseFloat(openingFloatInput.replace(",", ".")) || 0;
    if (!user) {
      toast.error("Nenhum operador logado.");
      return;
    }
    openShift(user.id, user.name, floatAmount);
    toast.success(`Caixa aberto com sucesso! Fundo inicial: ${brl(floatAmount)}`);
    onOpenChange(false);
  };

  // Handle Shift Closing
  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCountedInput) {
      toast.error("Informe o valor total de dinheiro contado na gaveta.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = closeShift({
        countedCash: parsedCountedCash,
        ...(hasDivergence ? { differenceReason, adminPassword } : {}),
      });

      setIsSubmitting(false);

      if (result.success && result.closedShift) {
        setClosedSummary(result.closedShift);
        setMode("RECEIPT");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }, 300);
  };

  return (
    <>
      <Dialog open={open && mode !== "RECEIPT"} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto p-5 sm:max-w-2xl">
        {/* ========================================================================= */}
        {/* 1. MODO: ABERTURA DE CAIXA */}
        {/* ========================================================================= */}
        {mode === "OPENING" && (
          <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Wallet className="size-5" />
                </span>
                <div>
                  <DialogTitle className="font-display text-xl font-bold">
                    Abertura de Caixa (Suprimento Inicial)
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Defina o fundo de troco para iniciar o turno de vendas no PDV.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Operador Responsável
                  </span>
                  <p className="mt-0.5 font-display text-sm font-bold text-foreground">
                    {user?.name ?? "Operador"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{user?.roleLabel}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Data e Hora do Turno
                  </span>
                  <p className="mt-0.5 font-display text-sm font-bold text-foreground">
                    {new Date().toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Fundo de Troco */}
              <div className="space-y-2">
                <Label htmlFor="opening-float" className="text-sm font-bold text-foreground">
                  Valor do Fundo de Troco (R$)
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="opening-float"
                    type="number"
                    step="0.01"
                    min="0"
                    value={openingFloatInput}
                    onChange={(e) => setOpeningFloatInput(e.target.value)}
                    placeholder="100.00"
                    className="h-12 pl-10 font-mono text-lg font-bold"
                    required
                    autoFocus
                  />
                </div>

                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[50, 100, 150, 200, 300].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOpeningFloatInput(val.toFixed(2))}
                      className="rounded-md border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 font-bold shadow-md shadow-primary/20">
                <CheckCircle2 className="size-4" />
                Confirmar Abertura de Caixa
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 2. MODO: FECHAMENTO DE CAIXA COM CONFERÊNCIA DE VALORES */}
        {/* ========================================================================= */}
        {mode === "CLOSING" && (
          <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Banknote className="size-5" />
                </span>
                <div>
                  <DialogTitle className="font-display text-xl font-bold">
                    Fechamento de Caixa · Conferência de Turno
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Realize a contagem física das cédulas e moedas na gaveta para encerrar o caixa.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Operator and time bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span className="font-bold text-foreground">
                  {currentShift?.operatorName ?? user?.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                <Clock className="size-3.5 text-primary" />
                Aberto em:{" "}
                {currentShift?.openedAt
                  ? new Date(currentShift.openedAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Hoje"}
              </div>
            </div>

            {/* Sales & Movement Summary Cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Fundo Inicial
                </p>
                <p className="num mt-0.5 font-display text-sm font-bold text-foreground">
                  {brl(currentShift?.initialFloat ?? 0)}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Vendas Dinheiro
                </p>
                <p className="num mt-0.5 font-display text-sm font-bold text-emerald-600">
                  {brl(shiftSales.cashSales)}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Vendas PIX
                </p>
                <p className="num mt-0.5 font-display text-sm font-bold text-blue-600">
                  {brl(shiftSales.pixSales)}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Vendas Cartão
                </p>
                <p className="num mt-0.5 font-display text-sm font-bold text-purple-600">
                  {brl(shiftSales.cardDebitSales + shiftSales.cardCreditSales)}
                </p>
              </div>
            </div>

            {/* Saldo Esperado em Dinheiro na Gaveta */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Saldo Esperado em Dinheiro na Gaveta
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Fundo de Troco ({brl(currentShift?.initialFloat ?? 0)}) + Vendas em Dinheiro (
                    {brl(shiftSales.cashSales)})
                  </p>
                </div>
                <span className="num font-display text-2xl font-extrabold text-primary">
                  {brl(expectedCash)}
                </span>
              </div>
            </div>

            {/* Input de Contagem Física de Dinheiro */}
            <div className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <Label htmlFor="counted-cash" className="text-sm font-bold text-foreground">
                  Informe o Valor Contado em Dinheiro na Gaveta (R$) *
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  (Cédulas + Moedas em espécie)
                </span>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-muted-foreground">
                  R$
                </span>
                <Input
                  id="counted-cash"
                  type="number"
                  step="0.01"
                  min="0"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  placeholder={expectedCash.toFixed(2)}
                  className="h-12 pl-11 font-mono text-xl font-bold"
                  required
                  autoFocus
                />
              </div>

              {/* Botão rápido para preencher com o valor esperado para teste */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCountedCashInput(expectedCash.toFixed(2))}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Preencher valor exato ({brl(expectedCash)})
                </button>
              </div>
            </div>

            {/* Status da Conferência de Valores */}
            {hasCountedInput && (
              <div>
                {isExactMatch ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-emerald-600">
                    <CheckCircle2 className="size-6 shrink-0" />
                    <div>
                      <p className="font-display text-sm font-bold uppercase tracking-wide">
                        ✓ Caixa Bateu Perfeitamente!
                      </p>
                      <p className="text-xs text-emerald-600/90">
                        O valor contado na gaveta confere exatamente com o saldo esperado (Diferença: R$ 0,00).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                        isCashShortage
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-600"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-display text-sm font-bold uppercase tracking-wide">
                            {isCashShortage
                              ? `⚠️ ATENÇÃO: Falta no Caixa de ${brl(Math.abs(difference))}`
                              : `⚠️ ATENÇÃO: Sobra no Caixa de ${brl(Math.abs(difference))}`}
                          </p>
                          <span className="font-mono text-sm font-extrabold">
                            {difference > 0 ? `+${brl(difference)}` : brl(difference)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs opacity-90">
                          O valor contado ({brl(parsedCountedCash)}) não confere com o esperado ({brl(expectedCash)}).
                          O fechamento regular está bloqueado.
                        </p>
                      </div>
                    </div>

                    {/* Exigência de Confirmação com Senha de Admin */}
                    <div className="space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                      <div className="flex items-center gap-2 text-rose-600">
                        <ShieldAlert className="size-5" />
                        <h4 className="font-display text-sm font-bold uppercase tracking-wide">
                          Autorização Obrigatória do Administrador
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Para encerrar o turno com divergência de valores, é obrigatório registrar a justificativa do operador e a validação da senha do Administrador.
                      </p>

                      <div className="space-y-1.5">
                        <Label htmlFor="diff-reason" className="text-xs font-semibold text-foreground">
                          Motivo / Justificativa da Divergência *
                        </Label>
                        <Textarea
                          id="diff-reason"
                          value={differenceReason}
                          onChange={(e) => setDifferenceReason(e.target.value)}
                          placeholder="Ex: Diferença de troco concedido / Sangria manual não lançada..."
                          className="h-16 text-xs"
                          required={hasDivergence}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="admin-pass" className="text-xs font-semibold text-foreground">
                            Senha do Administrador *
                          </Label>
                          <button
                            type="button"
                            onClick={() => setAdminPassword("admin123")}
                            className="text-[10px] font-medium text-primary hover:underline"
                          >
                            Usar senha demo (admin123)
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="admin-pass"
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Digite a senha do admin..."
                            className="h-10 pl-9 font-mono text-sm"
                            required={hasDivergence}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Voltar
              </Button>

              {isExactMatch ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="size-4" />
                  {isSubmitting ? "Fechando..." : "Confirmar e Fechar Caixa"}
                </Button>
              ) : hasDivergence ? (
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    differenceReason.trim().length === 0 ||
                    adminPassword.trim().length === 0
                  }
                  variant="destructive"
                  className="gap-2 font-bold shadow-md shadow-rose-600/20"
                >
                  <ShieldCheck className="size-4" />
                  {isSubmitting ? "Validando..." : "Autorizar e Fechar com Divergência"}
                </Button>
              ) : (
                <Button type="button" disabled className="gap-2 opacity-50">
                  Informe o valor para conferir
                </Button>
              )}
            </DialogFooter>
          </form>
        )}

      </DialogContent>
      </Dialog>

      {/* 3. MODO: RELATÓRIO / COMPROVANTE DE FECHAMENTO (estilo cupom) */}
      <ShiftReportModal
        open={open && mode === "RECEIPT" && !!closedSummary}
        onOpenChange={(next) => {
          if (!next) onOpenChange(false);
        }}
        shift={closedSummary}
      />
    </>
  );
}
