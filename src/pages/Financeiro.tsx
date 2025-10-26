import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus 
} from 'lucide-react';

const mockEntradas = [
  {
    id: 1,
    description: 'Pagamento - João Silva',
    value: 1200,
    date: '2025-10-25',
    type: 'Consulta',
    status: 'Confirmado',
  },
  {
    id: 2,
    description: 'Pagamento - Maria Santos',
    value: 850,
    date: '2025-10-24',
    type: 'Produto',
    status: 'Confirmado',
  },
];

const mockSaidas = [
  {
    id: 1,
    description: 'Fornecedor - Produtos',
    value: 3500,
    date: '2025-10-23',
    category: 'Compras',
    status: 'Pago',
  },
  {
    id: 2,
    description: 'Aluguel - Escritório',
    value: 2000,
    date: '2025-10-22',
    category: 'Despesas Fixas',
    status: 'Pago',
  },
];

export default function Financeiro() {
  const totalEntradas = mockEntradas.reduce((sum, e) => sum + e.value, 0);
  const totalSaidas = mockSaidas.reduce((sum, s) => sum + s.value, 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Gerencie receitas e despesas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-success to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white/80">Receitas</div>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">
            R$ {totalEntradas.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-white/80 mt-2">+12.5% vs mês anterior</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-destructive to-red-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white/80">Despesas</div>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">
            R$ {totalSaidas.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-white/80 mt-2">+8.3% vs mês anterior</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary to-accent text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white/80">Saldo</div>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">
            R$ {saldo.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-white/80 mt-2">
            {saldo >= 0 ? 'Positivo' : 'Negativo'}
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="p-6">
        <Tabs defaultValue="entradas" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="entradas">Receitas</TabsTrigger>
            <TabsTrigger value="saidas">Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value="entradas" className="mt-6">
            <div className="space-y-4">
              {mockEntradas.map((entrada) => (
                <Card key={entrada.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{entrada.description}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{entrada.type}</Badge>
                        <Badge className="bg-success/10 text-success">{entrada.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entrada.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">
                        +R$ {entrada.value.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saidas" className="mt-6">
            <div className="space-y-4">
              {mockSaidas.map((saida) => (
                <Card key={saida.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{saida.description}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{saida.category}</Badge>
                        <Badge className="bg-destructive/10 text-destructive">{saida.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(saida.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-destructive">
                        -R$ {saida.value.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
