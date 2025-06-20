
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
    <Sidebar className="bg-blue-900 border-blue-800">
      <SidebarHeader className="p-4 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <Logo size="md" showFallback={false} />
          <div>
            <h1 className="text-xl font-bold text-white">Happy Caldas</h1>
            <p className="text-xs text-blue-200">Sistema de Locações</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2 bg-blue-900">
        <SidebarGroup className="bg-blue-900">
          <SidebarGroupContent className="bg-blue-900">
            <SidebarMenu className="bg-blue-900">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="bg-blue-900">
                  {item.items ? (
                    <Collapsible defaultOpen={item.items.some(subItem => subItem.url === location.pathname)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full text-white hover:text-white hover:bg-blue-800 bg-blue-900">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="bg-blue-900">
                        <SidebarMenuSub className="bg-blue-900">
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title} className="bg-blue-900">
                              <SidebarMenuSubButton 
                                asChild
                                isActive={location.pathname === subItem.url}
                                className="text-blue-200 hover:text-white hover:bg-blue-800 bg-blue-900"
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
                      className="text-white hover:text-white hover:bg-blue-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white bg-blue-900"
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
