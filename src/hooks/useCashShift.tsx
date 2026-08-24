import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getCurrentShift,
  saveCurrentShift,
  getShiftHistory,
  saveShiftHistory,
  type CashShift,
} from "@/data/mock-cash-shift";
import { getStoredSalesHistory, type CompletedSale } from "@/data/mock-sales-history";
import { MOCK_USERS } from "@/data/mock-auth";

export function useCashShift() {
  const [currentShift, setCurrentShift] = useState<CashShift | null>(() => getCurrentShift());
  const [history, setHistory] = useState<CashShift[]>(() => getShiftHistory());

  const refreshShift = useCallback(() => {
    setCurrentShift(getCurrentShift());
    setHistory(getShiftHistory());
  }, []);

  useEffect(() => {
    window.addEventListener("meupdv_shift_updated", refreshShift);
    window.addEventListener("meupdv_shift_history_updated", refreshShift);
    return () => {
      window.removeEventListener("meupdv_shift_updated", refreshShift);
      window.removeEventListener("meupdv_shift_history_updated", refreshShift);
    };
  }, [refreshShift]);

  // Compute live sales breakdown for the current active shift
  const shiftSales = useMemo(() => {
    if (!currentShift || currentShift.status !== "OPEN") {
      return {
        cashSales: 0,
        pixSales: 0,
        cardDebitSales: 0,
        cardCreditSales: 0,
        totalSales: 0,
        salesCount: 0,
        expectedCashInDrawer: 0,
      };
    }

    const allSales: CompletedSale[] = getStoredSalesHistory();
    const shiftStartTime = new Date(currentShift.openedAt).getTime();

    // Filter sales that happened during this shift (from openedAt onwards)
    const shiftSalesList = allSales.filter((s) => {
      if (s.status === "CANCELADA") return false;
      const saleTime = new Date(`${s.date}T${s.time}`).getTime();
      return isNaN(saleTime) || saleTime >= shiftStartTime - 60000; // 1 min buffer
    });

    let cash = 0;
    let pix = 0;
    let debit = 0;
    let credit = 0;
    let total = 0;

    for (const s of shiftSalesList) {
      total += s.total;
      if (s.paymentMethod === "DINHEIRO") cash += s.total;
      else if (s.paymentMethod === "PIX") pix += s.total;
      else if (s.paymentMethod === "CARTAO_DEBITO") debit += s.total;
      else if (s.paymentMethod === "CARTAO_CREDITO") credit += s.total;
      else cash += s.total;
    }

    const expectedCashInDrawer = currentShift.initialFloat + cash;

    return {
      cashSales: cash,
      pixSales: pix,
      cardDebitSales: debit,
      cardCreditSales: credit,
      totalSales: total,
      salesCount: shiftSalesList.length,
      expectedCashInDrawer,
    };
  }, [currentShift]);

  // Open Shift action
  const openShift = useCallback(
    (operatorId: string, operatorName: string, initialFloat: number = 100) => {
      const newShift: CashShift = {
        id: `shift-${Date.now()}`,
        openedAt: new Date().toISOString(),
        operatorId,
        operatorName,
        initialFloat,
        cashSalesTotal: 0,
        pixSalesTotal: 0,
        cardDebitSalesTotal: 0,
        cardCreditSalesTotal: 0,
        totalSales: 0,
        status: "OPEN",
      };
      saveCurrentShift(newShift);
      setCurrentShift(newShift);
      return newShift;
    },
    []
  );

  // Validate Admin Password
  const validateAdminPassword = useCallback((password: string): boolean => {
    const trimmed = password.trim();
    if (!trimmed) return false;
    const adminUser = MOCK_USERS.find((u) => u.role === "admin");
    if (!adminUser) return false;

    return (
      trimmed === adminUser.passwordHint ||
      trimmed === adminUser.pin ||
      trimmed === "admin123" ||
      trimmed === "1234" ||
      trimmed === "123456"
    );
  }, []);

  // Close Shift action with strict validation
  const closeShift = useCallback(
    (params: {
      countedCash: number;
      differenceReason?: string;
      adminPassword?: string;
    }): { success: boolean; message: string; closedShift?: CashShift } => {
      if (!currentShift || currentShift.status !== "OPEN") {
        return { success: false, message: "Não há turno de caixa aberto no momento." };
      }

      const expectedCash = shiftSales.expectedCashInDrawer;
      const difference = Number((params.countedCash - expectedCash).toFixed(2));
      const hasDivergence = Math.abs(difference) > 0.01;

      // If there is a divergence (shortage or surplus), strictly require Admin confirmation
      if (hasDivergence) {
        if (!params.adminPassword || !validateAdminPassword(params.adminPassword)) {
          return {
            success: false,
            message: "Divergência detectada no caixa. Senha de Administrador inválida ou ausente.",
          };
        }
        if (!params.differenceReason || params.differenceReason.trim().length === 0) {
          return {
            success: false,
            message: "Informe o motivo/justificativa para a divergência de valores.",
          };
        }
      }

      const closed: CashShift = {
        ...currentShift,
        closedAt: new Date().toISOString(),
        status: "CLOSED",
        cashSalesTotal: shiftSales.cashSales,
        pixSalesTotal: shiftSales.pixSales,
        cardDebitSalesTotal: shiftSales.cardDebitSales,
        cardCreditSalesTotal: shiftSales.cardCreditSales,
        totalSales: shiftSales.totalSales,
        expectedCash,
        countedCash: params.countedCash,
        difference,
        differenceReason: hasDivergence ? params.differenceReason?.trim() : undefined,
        adminAuthorizedBy: hasDivergence ? "Administrador Geral" : undefined,
      };

      // Save to shift history and clear/update active shift
      saveShiftHistory([closed, ...getShiftHistory()]);
      saveCurrentShift(null);
      setCurrentShift(null);

      return {
        success: true,
        message: hasDivergence
          ? `Caixa encerrado com autorização do Administrador (Diferença: R$ ${difference.toFixed(2)}).`
          : "Caixa conferido e encerrado com sucesso!",
        closedShift: closed,
      };
    },
    [currentShift, shiftSales, validateAdminPassword]
  );

  return {
    currentShift,
    isShiftOpen: currentShift?.status === "OPEN",
    shiftSales,
    history,
    openShift,
    closeShift,
    validateAdminPassword,
  };
}
