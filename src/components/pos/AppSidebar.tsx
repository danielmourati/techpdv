import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  ClipboardList,
  Landmark,
  LayoutGrid,
  LogIn,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_USERS } from "@/data/mock-auth";
import { useSettings } from "@/hooks/useSettings";

type Item = { title: string; icon: typeof LayoutGrid; to: string };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Operação",
    items: [
      { title: "Caixa", icon: LayoutGrid, to: "/" },
      { title: "Vendas", icon: ShoppingCart, to: "/vendas" },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { title: "Produtos", icon: Package, to: "/produtos" },
      { title: "Clientes", icon: Users, to: "/clientes" },
      { title: "Fornecedores", icon: Truck, to: "/fornecedores" },
      { title: "Estoque", icon: Boxes, to: "/estoque" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Financeiro", icon: Landmark, to: "/financeiro" },
      { title: "Relatórios", icon: ClipboardList, to: "/relatorios" },
    ],
  },
  {
    label: "Sistema",
    items: [{ title: "Configurações", icon: Settings, to: "/configuracoes" }],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout, switchUser } = useAuth();
  const { saved: settings } = useSettings();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
    toast.success("Sessão encerrada com sucesso.");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/30 bg-primary text-primary-foreground">
      <SidebarHeader className="border-b border-white/15 bg-primary p-3">
        <Link
          to="/"
          className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 px-1 py-0.5 transition-opacity hover:opacity-90"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white font-display text-base font-black text-primary shadow-md">
            PD
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-extrabold leading-tight tracking-wide text-white">
                MeuPDV
              </span>
              <span className="block truncate text-xs text-white/80">
                {settings.companyName}
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-primary p-2">
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-white/75 px-2 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const isActive =
                    item.to === "/" ? currentPath === "/" : currentPath.startsWith(item.to);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="h-10">
                        <Link
                          to={item.to}
                          className={`flex items-center gap-3 px-3 py-2 text-sm transition-all rounded-lg ${
                            isActive
                              ? "bg-white font-bold text-primary shadow-sm"
                              : "text-white/90 hover:bg-white/15 hover:text-white font-medium"
                          }`}
                        >
                          <item.icon
                            className={`size-4.5 shrink-0 ${
                              isActive ? "text-primary" : "text-white/80"
                            }`}
                          />
                          <span className="truncate text-sm font-semibold">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/15 bg-primary p-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-lg border border-white/20 bg-black/15 p-2 text-left transition-colors hover:bg-black/25 focus:outline-none"
            >
              <span
                className={`grid size-8.5 shrink-0 place-items-center rounded-md font-display text-xs font-bold bg-white text-primary shadow-xs`}
              >
                {user ? user.avatarText : <UserRound className="size-4" />}
              </span>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-display text-xs font-bold uppercase leading-tight text-white">
                      {user?.name.split(" ")[0] ?? "Usuário"}
                    </span>
                    <span className="shrink-0 rounded bg-white/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white">
                      {user?.role === "admin" ? "ADM" : "OP"}
                    </span>
                  </div>
                  <span className="block truncate text-xs text-white/80">
                    {user?.roleLabel ?? "Desconectado"}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.name ?? "Visitante"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? "Não logado"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
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
                <span className="text-xs font-medium">Tela de Login</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span className="text-xs font-medium">Encerrar Sessão</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
