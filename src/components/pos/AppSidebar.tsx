import { Link, useRouterState } from "@tanstack/react-router";
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
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          to="/"
          className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-1 py-1 transition-opacity hover:opacity-90"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
            PD
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold leading-tight tracking-wide">
                MeuPDV
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Mercadinho Central
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.to === "/" ? currentPath === "/" : currentPath.startsWith(item.to);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link
                          to={item.to}
                          className={`flex items-center gap-2.5 transition-colors ${
                            isActive
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <item.icon
                            className={`size-4 shrink-0 ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <span className="truncate">{item.title}</span>
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

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-md p-1 text-left transition-colors hover:bg-sidebar-accent"
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-md border font-display text-xs font-bold ${
                  user?.role === "admin"
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-success/40 bg-success/15 text-success"
                }`}
              >
                {user ? user.avatarText : <UserRound className="size-4" />}
              </span>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-display text-xs font-bold uppercase leading-tight">
                      {user?.name.split(" ")[0] ?? "Usuário"}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1 text-[9px] font-bold uppercase ${
                        user?.role === "admin"
                          ? "bg-primary/20 text-primary"
                          : "bg-success/20 text-success"
                      }`}
                    >
                      {user?.role === "admin" ? "ADM" : "OP"}
                    </span>
                  </div>
                  <span className="block truncate text-[11px] text-muted-foreground">
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
                  <span>{u.name}</span>
                </div>
                {user?.id === u.id && <UserCheck className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/login" className="flex items-center gap-2">
                <LogIn className="size-4" />
                <span>Tela de Login</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Encerrar Sessão</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
