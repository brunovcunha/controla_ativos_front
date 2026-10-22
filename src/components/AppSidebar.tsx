import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Laptop, Building2, Users, ArrowLeftRight, MapPin, Wrench, Boxes } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { usingMock } from "@/lib/api";

const main = [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] as const;
const ops = [
  { title: "Empréstimos", url: "/emprestimos", icon: ArrowLeftRight },
  { title: "Manutenções", url: "/manutencoes", icon: Wrench },
] as const;
const cad = [
  { title: "Ativos", url: "/ativos", icon: Laptop },
  { title: "Colaboradores", url: "/colaboradores", icon: Users },
  { title: "Departamentos", url: "/departamentos", icon: Building2 },
  { title: "Localizações", url: "/localizacoes", icon: MapPin },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const group = (label: string, items: readonly { title: string; url: string; icon: typeof Laptop }[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((i) => (
            <SidebarMenuItem key={i.url}>
              <SidebarMenuButton asChild isActive={path === i.url} tooltip={i.title}>
                <Link to={i.url}>
                  <i.icon />
                  <span>{i.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-gradient-primary text-primary-foreground">
            <Boxes className="size-4" />
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="font-display text-sm font-semibold text-sidebar-accent-foreground">Controla Ativos</p>
            <p className="text-xs text-sidebar-foreground/60">Gestão de TI</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {group("Visão geral", main)}
        {group("Operação", ops)}
        {group("Cadastros", cad)}
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <p className="px-2 text-xs text-sidebar-foreground/50">
          {usingMock ? "Modo demonstração (dados locais)" : "Conectado à API"}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
