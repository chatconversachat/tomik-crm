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
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTenantModules } from '@/hooks/useTenantModules';
import { Button } from '@/components/ui/button';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navigationMap: Record<string, { name: string; href: string; icon: any; module?: string }> = {
  dashboard: { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  crm: { name: 'CRM', href: '/crm', icon: Users, module: 'crm' },
  whatsapp: { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare, module: 'whatsapp' },
  agendamentos: { name: 'Agendamentos', href: '/agendamentos', icon: Calendar, module: 'agendamentos' },
  financeiro: { name: 'Financeiro', href: '/financeiro', icon: DollarSign, module: 'financeiro' },
  fiscal: { name: 'Fiscal', href: '/fiscal', icon: FileText, module: 'fiscal' },
  produtos: { name: 'Produtos', href: '/produtos', icon: Package, module: 'produtos' },
  agentes: { name: 'Agentes IA', href: '/agentes', icon: Bot, module: 'agentes' },
  relatorios: { name: 'Relatórios', href: '/relatorios', icon: BarChart3, module: 'relatorios' },
  configuracoes: { name: 'Configurações', href: '/configuracoes', icon: Settings },
};

function SidebarContent_({ location }: { location: ReturnType<typeof useLocation> }) {
  const { setOpenMobile, setOpen } = useSidebar();
  const { tenant, signOut } = useAuth();
  const { modules, loading } = useTenantModules();

  const getAvailableNavigation = () => {
    if (loading) return [navigationMap.dashboard, navigationMap.configuracoes];
    
    const available = [navigationMap.dashboard];
    
    Object.values(navigationMap).forEach(item => {
      if (item.module && modules.some(m => m.name === item.module)) {
        available.push(item);
      }
    });
    
    available.push(navigationMap.configuracoes);
    return available;
  };

  const navigation = getAvailableNavigation();

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex flex-col h-auto py-4 px-4">
          <h1 className="text-xl font-bold text-white group-data-[collapsible=icon]:hidden">
            {tenant?.name || 'Tomik CRM'}
          </h1>
          <h1 className="text-xl font-bold text-white hidden group-data-[collapsible=icon]:block">
            {tenant?.name.substring(0, 2).toUpperCase() || 'TC'}
          </h1>
          {tenant && (
            <p className="text-xs text-white/70 mt-1 group-data-[collapsible=icon]:hidden">
              {tenant.slug}
            </p>
          )}
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
      
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </Button>
      </div>
    </Sidebar>
  );
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <SidebarContent_ location={location} />

        <main className="flex-1 overflow-auto w-full">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
