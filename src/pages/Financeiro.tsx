import { useState, useEffect } from 'react';
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
  Plus,
  FileText,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContaDialog } from '@/components/dialogs/ContaDialog';
import { RelatoriosFinanceiros } from '@/components/finance/RelatoriosFinanceiros';
import { FluxoCaixa } from '@/components/finance/FluxoCaixa';

export default function Financeiro() {
  const [contasReceber, setContasReceber] = useState<any[]>([]);
  const [contasPagar, setContasPagar] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'receber' | 'pagar'>('receber');
  const [selectedConta, setSelectedConta] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('contas');
  const { toast } = useToast();

  useEffect(() => {
    loadContasReceber();
    loadContasPagar();
  }, []);

  const loadContasReceber = async () => {
    const { data, error } = await supabase
      .from('contas_receber')
      .select('*')
      .order('data_vencimento', { ascending: true });
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar contas a receber', variant: 'destructive' });
    } else {
      setContasReceber(data || []);
    }
  };

  const loadContasPagar = async () => {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .order('data_vencimento', { ascending: true });
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar contas a pagar', variant: 'destructive' });
    } else {
      setContasPagar(data || []);
    }
  };

  const totalReceber = contasReceber
    .filter(c => c.status !== 'recebido')
    .reduce((sum, c) => sum + parseFloat(c.valor || 0), 0);
  
  const totalPagar = contasPagar
    .filter(c => c.status !== 'pago')
    .reduce((sum, c) => sum + parseFloat(c.valor || 0), 0);
  
  const saldo = totalReceber - totalPagar;

  const handleSaveConta = async () => {
    await loadContasReceber();
    await loadContasPagar();
    setSelectedConta(null);
  };

  const openDialog = (type: 'receber' | 'pagar') => {
    setDialogType(type);
    setSelectedConta(null);
    setDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Gerencie receitas e despesas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => openDialog('pagar')}>
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => openDialog('receber')}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-success to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white/80">A Receber</div>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">
            R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-white/80 mt-2">{contasReceber.filter(c => c.status === 'pendente').length} pendentes</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-destructive to-red-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white/80">A Pagar</div>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">
            R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-white/80 mt-2">{contasPagar.filter(c => c.status === 'pendente').length} pendentes</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary to-accent text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white/80">Saldo Previsto</div>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-white/80 mt-2">
            {saldo >= 0 ? 'Positivo' : 'Atenção'}
          </div>
        </Card>
      </div>

      {/* Content Tabs */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="contas">Contas</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="contas" className="mt-6">
            <Tabs defaultValue="receber" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="receber">A Receber</TabsTrigger>
                <TabsTrigger value="pagar">A Pagar</TabsTrigger>
              </TabsList>

              <TabsContent value="receber" className="mt-6">
                <div className="space-y-4">
                  {contasReceber.map((conta) => (
                    <Card key={conta.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{conta.descricao}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{conta.categoria}</Badge>
                            <Badge className={
                              conta.status === 'recebido' 
                                ? 'bg-success/10 text-success' 
                                : conta.status === 'vencido'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-warning/10 text-warning'
                            }>
                              {conta.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Venc: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {conta.cliente && (
                            <p className="text-sm text-muted-foreground mt-1">Cliente: {conta.cliente}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-success">
                            R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pagar" className="mt-6">
                <div className="space-y-4">
                  {contasPagar.map((conta) => (
                    <Card key={conta.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{conta.descricao}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{conta.categoria}</Badge>
                            <Badge className={
                              conta.status === 'pago' 
                                ? 'bg-success/10 text-success' 
                                : conta.status === 'vencido'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-warning/10 text-warning'
                            }>
                              {conta.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Venc: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {conta.fornecedor && (
                            <p className="text-sm text-muted-foreground mt-1">Fornecedor: {conta.fornecedor}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-destructive">
                            R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="fluxo" className="mt-6">
            <FluxoCaixa />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <RelatoriosFinanceiros />
          </TabsContent>
        </Tabs>
      </Card>

      <ContaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        conta={selectedConta}
        onSave={handleSaveConta}
      />
    </div>
  );
}
