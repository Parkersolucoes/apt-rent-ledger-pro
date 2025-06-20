
import {
  Calendar,
  Home,
  Building,
  Receipt,
  DollarSign,
  Settings,
  ChevronRight,
  Plus,
  List,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Logo } from "./Logo";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Apartamentos",
    url: "/apartamentos",
    icon: Building,
  },
  {
    title: "Locações",
    icon: Calendar,
    items: [
      {
        title: "Nova Locação",
        url: "/locacoes/novo",
        icon: Plus,
      },
      {
        title: "Lista de Locações",
        url: "/locacoes",
        icon: List,
      },
    ],
  },
  {
    title: "Despesas",
    icon: DollarSign,
    items: [
      {
        title: "Nova Despesa",
        url: "/despesas/novo",
        icon: Plus,
      },
      {
        title: "Lista de Despesas",
        url: "/despesas",
        icon: List,
      },
    ],
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-slate-900 border-slate-700">
      <SidebarHeader className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Logo size="md" showFallback={false} />
          <div>
            <h1 className="text-xl font-bold text-white">Happy Caldas</h1>
            <p className="text-xs text-slate-400">Sistema de Locações</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen={item.items.some(subItem => subItem.url === location.pathname)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full text-slate-300 hover:text-white hover:bg-slate-800">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild
                                isActive={location.pathname === subItem.url}
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Link to={subItem.url}>
                                  <subItem.icon className="h-3 w-3" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                      className="text-slate-300 hover:text-white hover:bg-slate-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                    >
                      <Link to={item.url!}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
