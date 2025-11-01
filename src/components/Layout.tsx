import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Bot, 
  Settings,
  Package,
  BarChart3,
  FileText
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Fiscal', href: '/fiscal', icon: FileText },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Agentes IA', href: '/agentes', icon: Bot },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center justify-center h-16 px-4">
              <h1 className="text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Tomik CRM
              </h1>
              <h1 className="text-xl font-bold text-sidebar-foreground hidden group-data-[collapsible=icon]:block">
                TC
              </h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                          <Link to={item.href}>
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto w-full">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
