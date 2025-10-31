import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RegraFiscalDialog } from '@/components/dialogs/RegraFiscalDialog';
import { NotaFiscalDialog } from '@/components/dialogs/NotaFiscalDialog';

export default function Fiscal() {
  const [regrasFiscais, setRegrasFiscais] = useState<any[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<any[]>([]);
  const [regraDialogOpen, setRegraDialogOpen] = useState(false);
  const [notaDialogOpen, setNotaDialogOpen] = useState(false);
  const [selectedRegra, setSelectedRegra] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRegrasFiscais();
    loadNotasFiscais();
  }, []);

  const loadRegrasFiscais = async () => {
    const { data, error } = await supabase
      .from('regras_fiscais')
      .select('*')
      .order('nome');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar regras fiscais', variant: 'destructive' });
    } else {
      setRegrasFiscais(data || []);
    }
  };

  const loadNotasFiscais = async () => {
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar notas fiscais', variant: 'destructive' });
    } else {
      setNotasFiscais(data || []);
    }
  };

  const handleSaveRegra = async () => {
    await loadRegrasFiscais();
    setSelectedRegra(null);
  };

  const handleSaveNota = async () => {
    await loadNotasFiscais();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Fiscal</h1>
          <p className="text-muted-foreground mt-1">Regras fiscais e emissão de notas</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setRegraDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Nova Regra Fiscal
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => setNotaDialogOpen(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Emitir Nota Fiscal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Regras Ativas</p>
          <p className="text-2xl font-bold">{regrasFiscais.filter(r => r.ativo).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Notas Emitidas</p>
          <p className="text-2xl font-bold">{notasFiscais.filter(n => n.status === 'emitida').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-warning">{notasFiscais.filter(n => n.status === 'pendente').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Com Erro</p>
          <p className="text-2xl font-bold text-destructive">{notasFiscais.filter(n => n.status === 'erro').length}</p>
        </Card>
      </div>

      {/* Content */}
      <Card className="p-6">
        <Tabs defaultValue="regras" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="regras">Regras Fiscais</TabsTrigger>
            <TabsTrigger value="notas">Notas Fiscais</TabsTrigger>
          </TabsList>

          <TabsContent value="regras" className="mt-6">
            <div className="space-y-4">
              {regrasFiscais.map((regra) => (
                <Card key={regra.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{regra.nome}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{regra.tipo}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Alíquota: {regra.aliquota}%
                        </span>
                        {regra.ativo ? (
                          <Badge className="bg-success/10 text-success">Ativa</Badge>
                        ) : (
                          <Badge variant="outline">Inativa</Badge>
                        )}
                      </div>
                      {regra.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{regra.descricao}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notas" className="mt-6">
            <div className="space-y-4">
              {notasFiscais.map((nota) => (
                <Card key={nota.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {nota.tipo.toUpperCase()} - {nota.cliente_nome}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{nota.numero || 'Sem número'}</Badge>
                        <Badge className={
                          nota.status === 'emitida' 
                            ? 'bg-success/10 text-success' 
                            : nota.status === 'erro'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning'
                        }>
                          {nota.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(nota.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        CPF/CNPJ: {nota.cliente_cpf_cnpj}
                      </p>
                      {nota.mensagem_erro && (
                        <p className="text-sm text-destructive mt-1">{nota.mensagem_erro}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        R$ {parseFloat(nota.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {nota.chave_acesso && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Chave: {nota.chave_acesso.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <RegraFiscalDialog
        open={regraDialogOpen}
        onOpenChange={setRegraDialogOpen}
        regra={selectedRegra}
        onSave={handleSaveRegra}
      />

      <NotaFiscalDialog
        open={notaDialogOpen}
        onOpenChange={setNotaDialogOpen}
        onSave={handleSaveNota}
      />
    </div>
  );
}
