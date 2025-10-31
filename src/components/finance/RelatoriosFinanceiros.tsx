import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download } from 'lucide-react';

export function RelatoriosFinanceiros() {
  const [dreData, setDreData] = useState<any>(null);
  const [balanceteData, setBalanceteData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDRE();
    loadBalancete();
  }, []);

  const loadDRE = async () => {
    const { data: receber } = await supabase
      .from('contas_receber')
      .select('valor, status');
    
    const { data: pagar } = await supabase
      .from('contas_pagar')
      .select('valor, status');

    const receitaTotal = receber
      ?.filter(r => r.status === 'recebido')
      .reduce((sum, r) => sum + (typeof r.valor === 'string' ? parseFloat(r.valor) : (r.valor || 0)), 0) || 0;

    const despesaTotal = pagar
      ?.filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + (typeof p.valor === 'string' ? parseFloat(p.valor) : (p.valor || 0)), 0) || 0;

    const lucroLiquido = receitaTotal - despesaTotal;
    const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    setDreData({
      receitaTotal,
      despesaTotal,
      lucroLiquido,
      margemLucro
    });
  };

  const loadBalancete = async () => {
    const { data: receber } = await supabase
      .from('contas_receber')
      .select('categoria, valor, status');
    
    const { data: pagar } = await supabase
      .from('contas_pagar')
      .select('categoria, valor, status');

    const categorias = new Map();

    receber?.forEach(r => {
      if (r.status === 'recebido') {
        const atual = categorias.get(r.categoria) || { categoria: r.categoria, receitas: 0, despesas: 0 };
        atual.receitas += parseFloat(r.valor?.toString() || '0');
        categorias.set(r.categoria, atual);
      }
    });

    pagar?.forEach(p => {
      if (p.status === 'pago') {
        const atual = categorias.get(p.categoria) || { categoria: p.categoria, receitas: 0, despesas: 0 };
        atual.despesas += parseFloat(p.valor?.toString() || '0');
        categorias.set(p.categoria, atual);
      }
    });

    setBalanceteData(Array.from(categorias.values()));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dre" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="balancete">Balancete</TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Demonstração do Resultado do Exercício</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>

            {dreData && (
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold">Receita Total</span>
                  <span className="text-success font-bold">
                    R$ {dreData.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b">
                  <span className="font-semibold">(-) Despesas Totais</span>
                  <span className="text-destructive font-bold">
                    R$ {dreData.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-2">
                  <span className="font-bold text-lg">(=) Lucro Líquido</span>
                  <span className={`font-bold text-lg ${dreData.lucroLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>
                    R$ {dreData.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="font-semibold">Margem de Lucro</span>
                  <span className={`font-bold ${dreData.margemLucro >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {dreData.margemLucro.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="balancete" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Balancete por Categoria</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 py-3 border-b font-semibold">
                <span>Categoria</span>
                <span className="text-right">Receitas</span>
                <span className="text-right">Despesas</span>
              </div>

              {balanceteData.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span>{item.categoria}</span>
                  <span className="text-right text-success">
                    R$ {item.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-right text-destructive">
                    R$ {item.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
