import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Cpu, Link, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as Select from '@radix-ui/react-select';
import { Badge } from '@/components/ui/badge';

interface AgentConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: any;
  onSave: (agent: any) => void;
}

export function AgentConfigModal({ open, onOpenChange, agent, onSave }: AgentConfigModalProps) {
  const [activeTab, setActiveTab] = useState('prompt');
  const [n8nConnected, setN8nConnected] = useState(agent?.n8n_connected || false);
  const [prompt, setPrompt] = useState(agent?.prompt || "Você é um assistente de vendas inteligente para um sistema CRM. Responda de forma profissional, amigável e objetiva. Ajude os clientes com informações sobre produtos, agendamentos e qualificação de leads. Seja sempre cortês e eficiente.");
  const [n8nUrl, setN8nUrl] = useState(agent?.n8n_url || '');
  const { toast } = useToast();

  const handleSavePrompt = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Erro',
        description: 'O prompt não pode estar vazio',
        variant: 'destructive',
      });
      return;
    }
    onSave({ ...agent, prompt });
    toast({
      title: 'Sucesso',
      description: 'Prompt atualizado com sucesso!',
    });
  };

  const handleConnectN8n = async () => {
    if (!n8nUrl.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha a URL do n8n',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Using any to bypass type checking until database is defined
      const { data, error } = await supabase
        .from('agentes')
        .update({ n8n_url: n8nUrl, n8n_connected: true })
        .eq('id', agent.id);

      if (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao conectar ao n8n',
          variant: 'destructive',
        });
        return;
      }

      setN8nConnected(true);
      setN8nUrl(n8nUrl);
      onSave({ ...agent, n8n_url: n8nUrl, n8n_connected: true });
      toast({
        title: 'Sucesso',
        description: 'Conectado ao n8n com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao conectar',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnectN8n = () => {
    if (confirm('Tem certeza que deseja desconectar o n8n?')) {
      setN8nConnected(false);
      setN8nUrl('');
      onSave({ ...agent, n8n_connected: false, n8n_url: null });
      toast({
        title: 'Desconectado',
        description: 'Desconectado do n8n',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Agente</DialogTitle>
          <DialogDescription>
            Configure as integrações e o comportamento do seu agente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="agentName">Nome do Agente</Label>
              <Input
                id="agentName"
                value={agent?.name || ''}
                onChange={(e) => onSave({ ...agent, name: e.target.value })}
                placeholder="Nome do agente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentStatus">Status</Label>
              <Select.Root value={agent?.status || 'Ativo'} onValueChange={(value) => onSave({ ...agent, status: value })}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="Ativo">Ativo</Select.Item>
                  <Select.Item value="Pausado">Pausado</Select.Item>
                  <Select.Item value="Inativo">Inativo</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="n8n">Integração n8n</TabsTrigger>
            </TabsList>

            <TabsContent value="prompt" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt do Sistema</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Defina como o agente deve se comportar e responder..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este prompt define o comportamento e personalidade do agente
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPrompt(agent?.prompt || '');
                      setActiveTab('prompt');
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePrompt}>
                    Salvar Prompt
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="n8n" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="n8nUrl">URL do n8n</Label>
                    <Input
                      id="n8nUrl"
                      value={n8nUrl}
                      onChange={(e) => setN8nUrl(e.target.value)}
                      placeholder="https://seun8n.com/webhook"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL da sua instância n8n para integração
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {n8nConnected ? (
                      <Badge className="bg-success text-success-foreground">
                        Conectado
                      </Badge>
                    ) : (
                      <Badge variant="outline">Desconectado</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setN8nConnected(!n8nConnected);
                      if (!n8nConnected) {
                        handleConnectN8n();
                      } else {
                        handleDisconnectN8n();
                      }
                    }}
                  >
                    {n8nConnected ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Desconectar n8n
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Conectar n8n
                      </>
                    )}
                  </Button>
                  <Button variant="default" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Cpu className="w-4 h-4 mr-2" />
                    Testar Conexão
                  </Button>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setN8nUrl('');
                      setN8nConnected(false);
                    }}
                  >
                    Limpar
                  </Button>
                  <Button onClick={handleSavePrompt}>
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}