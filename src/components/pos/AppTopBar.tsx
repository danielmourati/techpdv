import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, ShieldCheck, UserCheck, UserRound } from "lucide-react";
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
import { MOCK_USERS } from "@/data/mock-auth";
import { useSettings } from "@/hooks/useSettings";

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
  const { saved: settings } = useSettings();
  const storeLabel = store ?? settings.tradeName;

  return (
    <header className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-3 py-2 shadow-xs">
      <SidebarTrigger className="size-9 shrink-0 rounded-md border border-border transition-colors hover:bg-accent" />

      <div className="min-w-0">
        <h1 className="truncate font-display text-lg font-bold leading-tight text-foreground">
          {title}
        </h1>
        <p className="truncate text-[11px] text-muted-foreground">{storeLabel}</p>
      </div>

      <div className="flex items-center gap-2">
        {showCashPill && (
          <div className="hidden shrink-0 rounded-md border border-success/40 bg-success/10 px-3 py-1 text-right sm:block">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-success">
              Caixa aberto
            </p>
            <p className="num font-display text-sm font-bold leading-tight text-success">
              {brl(cashTotal)}
            </p>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-left transition-colors hover:bg-accent focus:outline-none"
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${
                  user?.role === "admin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {user ? user.avatarText : <UserRound className="size-3.5" />}
              </span>
              <div className="hidden text-left sm:block">
                <p className="max-w-[120px] truncate text-xs font-semibold leading-tight">
                  {user?.name ?? "Visitante"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {user?.role === "admin" ? "Administrador" : "Operador"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2 py-1">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-md font-display text-xs font-bold ${
                    user?.role === "admin"
                      ? "bg-primary text-primary-foreground"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {user?.avatarText ?? "US"}
                </span>
                <div className="flex flex-col space-y-0.5 overflow-hidden">
                  <p className="truncate text-sm font-semibold">{user?.name ?? "Visitante"}</p>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="size-3 text-primary" />
                    {user?.roleLabel ?? "Sem perfil"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Trocar de Usuário
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
              onClick={() => logout()}
              className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span className="text-xs font-medium">Sair da Conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
