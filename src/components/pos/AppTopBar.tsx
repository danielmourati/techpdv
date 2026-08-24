import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Banknote, LogIn, LogOut, ShieldCheck, UserCheck, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brl } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useCashShift } from "@/hooks/useCashShift";
import { MOCK_USERS } from "@/data/mock-auth";
import { useSettings } from "@/hooks/useSettings";
import { CashShiftModal } from "./CashShiftModal";

export function AppTopBar({
  title = "Frente de Caixa",
  store,
  cashTotal = 0,
  showCashPill = true,
}: {
  title?: string;
  store?: string;
  cashTotal?: number;
  showCashPill?: boolean;
}) {
  const { user, logout, switchUser } = useAuth();
  const { isShiftOpen, shiftSales } = useCashShift();
  const { saved: settings } = useSettings();
  const storeLabel = store ?? settings.tradeName;
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
    toast.success("Sessão encerrada com sucesso.");
  };

  return (
    <>
      <header className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-2.5 shadow-2xs">
        <SidebarTrigger className="size-10 shrink-0 rounded-lg border border-border transition-colors hover:bg-accent" />

        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-extrabold leading-tight text-foreground">
            {title}
          </h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{storeLabel}</p>
        </div>

        <div className="flex items-center gap-3">
          {showCashPill && (
            <button
              type="button"
              onClick={() => setCashModalOpen(true)}
              className={`hidden shrink-0 rounded-lg border px-3 py-1.5 text-right transition-all sm:flex sm:items-center sm:gap-2.5 cursor-pointer ${
                isShiftOpen
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-2xs"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 shadow-2xs"
              }`}
              title={isShiftOpen ? "Clique para conferir ou fechar o caixa" : "Clique para abrir o caixa"}
            >
              <div
                className={`flex size-7 items-center justify-center rounded-md ${
                  isShiftOpen ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"
                }`}
              >
                {isShiftOpen ? (
                  <Banknote className="size-4" />
                ) : (
                  <Wallet className="size-4" />
                )}
              </div>
              <div className="text-right">
                <p
                  className={`font-display text-[11px] font-bold uppercase tracking-wider ${
                    isShiftOpen ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {isShiftOpen ? "Caixa Aberto" : "Caixa Fechado"}
                </p>
                <p
                  className={`num font-display text-sm font-extrabold leading-tight ${
                    isShiftOpen ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {isShiftOpen
                    ? brl(shiftSales.expectedCashInDrawer || cashTotal)
                    : "Clique p/ Abrir"}
                </p>
              </div>
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-1.5 text-left transition-colors hover:bg-accent focus:outline-none shadow-2xs"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${
                    user?.role === "admin"
                      ? "bg-primary text-primary-foreground"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {user ? user.avatarText : <UserRound className="size-4" />}
                </span>
                <div className="hidden text-left sm:block">
                  <p className="max-w-[130px] truncate text-xs font-bold leading-tight text-foreground">
                    {user?.name ?? "Visitante"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {user?.role === "admin" ? "Administrador" : "Operador"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2.5 py-1">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${
                      user?.role === "admin"
                        ? "bg-primary text-primary-foreground"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {user?.avatarText ?? "US"}
                  </span>
                  <div className="flex flex-col space-y-0.5 overflow-hidden">
                    <p className="truncate text-sm font-bold">{user?.name ?? "Visitante"}</p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3 text-primary" />
                      {user?.roleLabel ?? "Sem perfil"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Caixa Operations */}
              <DropdownMenuItem
                onClick={() => setCashModalOpen(true)}
                className="flex items-center gap-2 cursor-pointer font-medium text-xs text-primary"
              >
                <Banknote className="size-4" />
                <span>{isShiftOpen ? "Conferência e Fechamento de Caixa" : "Abertura de Caixa"}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Alternar Usuário
              </DropdownMenuLabel>
              {MOCK_USERS.map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${
                        u.role === "admin" ? "bg-primary" : "bg-emerald-500"
                      }`}
                    />
                    <span className="text-xs font-medium">{u.name}</span>
                  </div>
                  {user?.id === u.id && <UserCheck className="size-4 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  <span className="text-xs font-medium">Ir para Tela de Login</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
              >
                <LogOut className="size-4" />
                <span className="text-xs font-medium">Sair da Conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Cash Shift Modal (Opening & Closing) */}
      <CashShiftModal open={cashModalOpen} onOpenChange={setCashModalOpen} />
    </>
  );
}
