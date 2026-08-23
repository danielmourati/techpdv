import { Link } from "@tanstack/react-router";
import {
  Boxes,
  ClipboardList,
  Landmark,
  LayoutGrid,
  Package,
  Settings,
  ShoppingCart,
  Truck,
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

type Item = { title: string; icon: typeof LayoutGrid; to?: string };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Operação",
    items: [
      { title: "Caixa", icon: LayoutGrid, to: "/" },
      { title: "Vendas", icon: ShoppingCart },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { title: "Produtos", icon: Package },
      { title: "Clientes", icon: Users },
      { title: "Fornecedores", icon: Truck },
      { title: "Estoque", icon: Boxes },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Financeiro", icon: Landmark },
      { title: "Relatórios", icon: ClipboardList },
    ],
  },
  {
    label: "Sistema",
    items: [{ title: "Configurações", icon: Settings }],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-1 py-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
            PD
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold leading-tight">
                MeuPDV
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Mercadinho Central
              </span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.to ? (
                      <SidebarMenuButton asChild isActive tooltip={item.title}>
                        <Link to={item.to} className="flex items-center gap-2">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        tooltip={`${item.title} · em breve`}
                        className="cursor-not-allowed opacity-60"
                        aria-disabled
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        {!collapsed && (
                          <span className="ml-auto rounded-sm bg-muted px-1 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            breve
                          </span>
                        )}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-1 py-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-md border border-success/40 bg-success/10 text-success">
            <UserRound className="size-4" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-xs font-bold uppercase leading-tight">
                Daniel
              </span>
              <span className="block truncate text-[11px] text-success">Caixa aberto</span>
            </span>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
