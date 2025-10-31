import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function FluxoCaixa() {
  const [fluxo, setFluxo] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFluxoCaixa();
  }, []);

  const loadFluxoCaixa = async () => {
    const { data, error } = await supabase
      .from('fluxo_caixa')
      .select('*')
      .order('data', { ascending: false })
      .limit(50);
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar fluxo de caixa', variant: 'destructive' });
    } else {
      setFluxo(data || []);
    }
  };

  const totalEntradas = fluxo
    .filter(f => f.tipo === 'entrada')
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

  const totalSaidas = fluxo
    .filter(f => f.tipo === 'saida')
    .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

  const saldoFinal = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-success/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entradas</p>
              <p className="text-2xl font-bold text-success">
                R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="p-4 bg-destructive/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Saídas</p>
              <p className="text-2xl font-bold text-destructive">
                R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-4 bg-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${saldoFinal >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        {fluxo.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{item.descricao}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{item.categoria}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${item.tipo === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                  {item.tipo === 'entrada' ? '+' : '-'} R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {item.saldo_acumulado && (
                  <p className="text-sm text-muted-foreground">
                    Saldo: R$ {parseFloat(item.saldo_acumulado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
