import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Bot, 
  Settings,
  Package,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Agentes IA', href: '/agentes', icon: Bot },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border bg-gradient-to-r from-primary to-accent px-4">
          <h1 className="text-xl font-bold text-white">Tomik CRM</h1>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
