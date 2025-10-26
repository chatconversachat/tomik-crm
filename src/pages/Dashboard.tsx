import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign,
  Calendar,
  Bot
} from 'lucide-react';

const stats = [
  {
    name: 'Leads Ativos',
    value: '248',
    change: '+12.5%',
    icon: Users,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    name: 'Mensagens Hoje',
    value: '1,429',
    change: '+8.2%',
    icon: MessageSquare,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    name: 'Receita Mensal',
    value: 'R$ 45.2K',
    change: '+23.1%',
    icon: DollarSign,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    name: 'Agendamentos',
    value: '32',
    change: '+4.3%',
    icon: Calendar,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
];

const recentActivities = [
  { id: 1, type: 'lead', message: 'Novo lead: João Silva', time: '5 min atrás' },
  { id: 2, type: 'message', message: 'Nova mensagem de Maria Santos', time: '12 min atrás' },
  { id: 3, type: 'payment', message: 'Pagamento recebido: R$ 1.200', time: '1 hora atrás' },
  { id: 4, type: 'appointment', message: 'Agendamento confirmado', time: '2 horas atrás' },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className={`text-sm font-medium mt-1 ${
                    stat.change.startsWith('+') ? 'text-success' : 'text-destructive'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Atividades Recentes</h2>
            <button className="text-sm text-primary hover:text-primary-glow font-medium">
              Ver tudo
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary to-accent text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Agente IA Ativo</h3>
              <p className="text-sm text-white/80">
                Atendendo conversas automaticamente
              </p>
            </div>
            <Bot className="w-8 h-8 text-white/90" />
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Conversas atendidas hoje</span>
              <span className="text-lg font-bold">142</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Taxa de resolução</span>
              <span className="text-lg font-bold">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Tempo médio de resposta</span>
              <span className="text-lg font-bold">2.3s</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Métricas de Conversão</h2>
        <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Gráfico de métricas em breve</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
