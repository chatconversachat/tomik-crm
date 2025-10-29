import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

const mockRelatorios = [
  {
    id: 1,
    titulo: 'Relatório de Vendas - Outubro',
    tipo: 'Vendas',
    periodo: 'Outubro 2025',
    gerado: '2025-10-25',
    formato: 'PDF',
  },
  {
    id: 2,
    titulo: 'Performance de Agentes IA',
    tipo: 'Agentes',
    periodo: 'Últimos 30 dias',
    gerado: '2025-10-24',
    formato: 'Excel',
  },
  {
    id: 3,
    titulo: 'Análise Financeira - Trimestre',
    tipo: 'Financeiro',
    periodo: 'Q4 2025',
    gerado: '2025-10-23',
    formato: 'PDF',
  },
  {
    id: 4,
    titulo: 'Conversões CRM',
    tipo: 'CRM',
    periodo: 'Outubro 2025',
    gerado: '2025-10-22',
    formato: 'Excel',
  },
];

const quickStats = [
  {
    title: 'Receita Total',
    value: 'R$ 142.3k',
    change: '+15.2%',
    icon: DollarSign,
    color: 'text-success',
  },
  {
    title: 'Novos Clientes',
    value: '342',
    change: '+23.1%',
    icon: Users,
    color: 'text-primary',
  },
  {
    title: 'Taxa de Conversão',
    value: '28.5%',
    change: '+5.3%',
    icon: TrendingUp,
    color: 'text-accent',
  },
  {
    title: 'Atendimentos',
    value: '1,243',
    change: '+12.8%',
    icon: BarChart3,
    color: 'text-warning',
  },
];

export default function Relatorios() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e Análises</h1>
          <p className="text-muted-foreground mt-1">Visualize insights e gere relatórios</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <FileText className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className={`text-sm font-semibold mt-2 ${stat.color}`}>
                    {stat.change} vs mês anterior
                  </p>
                </div>
                <Icon className={`w-10 h-10 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Vendas por Período</h3>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Gráfico de vendas será exibido aqui</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Distribuição por Categoria</h3>
            <PieChart className="w-5 h-5 text-accent" />
          </div>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Gráfico de pizza será exibido aqui</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Período
          </Button>
          <Button variant="outline">Vendas</Button>
          <Button variant="outline">CRM</Button>
          <Button variant="outline">Financeiro</Button>
          <Button variant="outline">Agentes IA</Button>
        </div>
      </Card>

      {/* Reports List */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">Relatórios Gerados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-semibold text-foreground">Relatório</th>
                <th className="text-left p-4 font-semibold text-foreground">Tipo</th>
                <th className="text-left p-4 font-semibold text-foreground">Período</th>
                <th className="text-left p-4 font-semibold text-foreground">Data de Geração</th>
                <th className="text-left p-4 font-semibold text-foreground">Formato</th>
                <th className="text-right p-4 font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockRelatorios.map((relatorio) => (
                <tr key={relatorio.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{relatorio.titulo}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{relatorio.tipo}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{relatorio.periodo}</td>
                  <td className="p-4 text-muted-foreground">{relatorio.gerado}</td>
                  <td className="p-4">
                    <Badge className="bg-primary text-primary-foreground">
                      {relatorio.formato}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
