import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MessageSquare, 
  Bot, 
  Bell, 
  Settings, 
  Trash2,
  Plus,
  Save,
  Plug,
  Check,
  X,
  QrCode,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WhatsAppInstanceDialog } from '@/components/dialogs/WhatsAppInstanceDialog';
import { supabase } from '@/integrations/supabase/client';
import { CreateTestNotification } from '@/components/notifications/CreateTestNotification';

export default function Configuracoes() {
  const [orgName, setOrgName] = useState('Tomik CRM');
  const [orgEmail, setOrgEmail] = useState('contato@tomikcrm.com');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [instances, setInstances] = useState<any[]>([]); // Fetch from DB
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [n8nUrl, setN8nUrl] = useState('');
  const [n8nApiKey, setN8nApiKey] = useState('');
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [loadingQr, setLoadingQr] = useState<string | null>(null); // Stores instance ID being loaded

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    const { data, error } = await supabase.from('whatsapp_instances').select('*');
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar instâncias', variant: 'destructive' });
    } else {
      setInstances(data || []);
    }
  };

  const handleSaveInstance = async (instance: any) => {
    let result;
    if (selectedInstance) {
      result = await supabase.from('whatsapp_instances').update(instance).eq('id', instance.id);
    } else {
      result = await supabase.from('whatsapp_instances').insert([instance]);
    }

    if (result.error) {
      toast({
        title: 'Erro',
        description: `Erro ao salvar instância: ${result.error.message}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: `Instância ${selectedInstance ? 'atualizada' : 'criada'} com sucesso.`,
      });
      loadInstances();
      setInstanceDialogOpen(false);
      setSelectedInstance(null);
    }
  };

  const handleEditInstance = (instance: any) => {
    setSelectedInstance(instance);
    setInstanceDialogOpen(true);
  };

  const handleDeleteInstance = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta instância?')) {
      const { error } = await supabase.from('whatsapp_instances').delete().eq('id', id);
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao excluir instância', variant: 'destructive' });
      } else {
        toast({ title: 'Sucesso', description: 'Instância excluída com sucesso.' });
        loadInstances();
      }
    }
  };

  const handleConnectEvolutionAPI = async (instance: any) => {
    setLoadingQr(instance.id);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-connect', {
        body: {
          instanceId: instance.id,
          evolutionApiUrl: instance.evolution_api_url,
          evolutionApiKey: instance.evolution_api_key,
          action: 'connect',
        },
      });

      if (error) throw error;
      if (!data.sucesso) throw new Error(data.erro || 'Falha ao conectar Evolution API.');

      toast({ title: 'Sucesso', description: 'QR Code gerado. Escaneie para conectar.' });
      loadInstances(); // Refresh to show QR code
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: `Erro ao conectar Evolution API: ${error.message || error}`,
        variant: 'destructive',
      });
    } finally {
      setLoadingQr(null);
    }
  };

  const handleDisconnectEvolutionAPI = async (instance: any) => {
    if (!confirm('Tem certeza que deseja desconectar esta instância?')) return;

    setLoadingQr(instance.id);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-connect', {
        body: {
          instanceId: instance.id,
          evolutionApiUrl: instance.evolution_api_url,
          evolutionApiKey: instance.evolution_api_key,
          action: 'disconnect',
        },
      });

      if (error) throw error;
      if (!data.sucesso) throw new Error(data.erro || 'Falha ao desconectar Evolution API.');

      toast({ title: 'Sucesso', description: 'Instância desconectada com sucesso.' });
      loadInstances();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: `Erro ao desconectar Evolution API: ${error.message || error}`,
        variant: 'destructive',
      });
    } finally {
      setLoadingQr(null);
    }
  };

  const handleCheckStatusEvolutionAPI = async (instance: any) => {
    setLoadingQr(instance.id); // Use loading state for status check too
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api-connect', {
        body: {
          instanceId: instance.id,
          evolutionApiUrl: instance.evolution_api_url,
          evolutionApiKey: instance.evolution_api_key,
          action: 'check_status',
        },
      });

      if (error) throw error;
      if (!data.sucesso) throw new Error(data.erro || 'Falha ao verificar status da Evolution API.');

      toast({ title: 'Status Verificado', description: `Status da instância: ${data.status}` });
      loadInstances();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: `Erro ao verificar status Evolution API: ${error.message || error}`,
        variant: 'destructive',
      });
    } finally {
      setLoadingQr(null);
    }
  };

  const handleSaveIntegrations = () => {
    toast({
      title: "Integrações salvas",
      description: "As configurações de integração foram salvas com sucesso.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu sistema</p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="organization">
            <Building2 className="w-4 h-4 mr-2" />
            Organização
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="w-4 h-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="w-4 h-4 mr-2" />
            IA
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="w-4 h-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Organização */}
        <TabsContent value="organization" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Dados da Organização</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nome da Organização</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgEmail">E-mail Corporativo</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgPhone">Telefone</Label>
                <Input
                  id="orgPhone"
                  placeholder="+55 (11) 98765-4321"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgAddress">Endereço</Label>
                <Textarea
                  id="orgAddress"
                  placeholder="Endereço completo da organização"
                  rows={3}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Instâncias WhatsApp</h2>
              <Button onClick={() => {
                setSelectedInstance(null);
                setInstanceDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Instância
              </Button>
            </div>
            <div className="space-y-3">
              {instances.map((instance) => (
                <div key={instance.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 mb-3 md:mb-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-foreground">{instance.name}</h3>
                      <Badge variant={instance.status === 'connected' ? 'default' : 'destructive'}>
                        {instance.status === 'connected' ? 'Conectado' : instance.status === 'qr_pending' ? 'Aguardando QR' : 'Desconectado'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {instance.type === 'evolution_api' ? 'Evolution API' : 'WhatsApp Cloud'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{instance.phone}</p>
                  </div>
                  
                  {instance.type === 'evolution_api' && instance.status === 'qr_pending' && instance.qr_code_data && (
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50 mb-3 md:mb-0 md:mr-4">
                      <img src={instance.qr_code_data} alt="QR Code" className="w-32 h-32 object-contain" />
                      <p className="text-xs text-muted-foreground mt-2">Escaneie com seu celular</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {instance.type === 'evolution_api' && instance.status !== 'connected' && (
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => handleConnectEvolutionAPI(instance)}
                        disabled={loadingQr === instance.id}
                      >
                        {loadingQr === instance.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <QrCode className="w-4 h-4 mr-2" />
                        )}
                        Conectar
                      </Button>
                    )}
                    {instance.type === 'evolution_api' && instance.status === 'connected' && (
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnectEvolutionAPI(instance)}
                        disabled={loadingQr === instance.id}
                      >
                        {loadingQr === instance.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        Desconectar
                      </Button>
                    )}
                    {instance.type === 'evolution_api' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckStatusEvolutionAPI(instance)}
                        disabled={loadingQr === instance.id}
                      >
                        {loadingQr === instance.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Status
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditInstance(instance)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteInstance(instance.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <WhatsAppInstanceDialog
            open={instanceDialogOpen}
            onOpenChange={setInstanceDialogOpen}
            instance={selectedInstance}
            onSave={handleSaveInstance}
          />
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integrations" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">n8n Integration</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="n8n-url">URL do n8n</Label>
                <Input
                  id="n8n-url"
                  value={n8nUrl}
                  onChange={(e) => setN8nUrl(e.target.value)}
                  placeholder="https://seu-n8n.com"
                />
                <p className="text-xs text-muted-foreground">
                  URL base da sua instância n8n
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="n8n-api-key">API Key do n8n</Label>
                <Input
                  id="n8n-api-key"
                  type="password"
                  value={n8nApiKey}
                  onChange={(e) => setN8nApiKey(e.target.value)}
                  placeholder="Sua API Key do n8n"
                />
                <p className="text-xs text-muted-foreground">
                  Encontre sua API key nas configurações do n8n
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Evolution API (Global)</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evolution-url">URL da Evolution API</Label>
                <Input
                  id="evolution-url"
                  value={evolutionApiUrl}
                  onChange={(e) => setEvolutionApiUrl(e.target.value)}
                  placeholder="https://sua-evolution-api.com"
                />
                <p className="text-xs text-muted-foreground">
                  URL base da sua Evolution API (para criar novas instâncias)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evolution-api-key">API Key da Evolution</Label>
                <Input
                  id="evolution-api-key"
                  type="password"
                  value={evolutionApiKey}
                  onChange={(e) => setEvolutionApiKey(e.target.value)}
                  placeholder="Sua API Key da Evolution"
                />
                <p className="text-xs text-muted-foreground">
                  API key para autenticação na Evolution API (para criar novas instâncias)
                </p>
              </div>
            </div>
          </Card>

          <Button onClick={handleSaveIntegrations} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salvar Integrações
          </Button>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Configurações de IA</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">Habilitar IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative o assistente de IA para responder automaticamente
                  </p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={aiEnabled}
                  onCheckedChange={setAiEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-model">Modelo de IA</Label>
                <Select defaultValue="gemini-flash">
                  <SelectTrigger id="ai-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-flash">Gemini 2.5 Flash (Padrão)</SelectItem>
                    <SelectItem value="gemini-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="gpt-5">GPT-5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Prompt do Sistema</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="Defina como a IA deve se comportar..."
                  rows={6}
                  defaultValue="Você é um assistente de vendas inteligente para um sistema CRM. Responda de forma profissional, amigável e objetiva."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-temperature">Temperatura (Criatividade)</Label>
                <Input
                  id="ai-temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                />
                <p className="text-xs text-muted-foreground">
                  0 = Mais preciso e determinístico | 1 = Mais criativo e variado
                </p>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações de IA
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-4">
          <CreateTestNotification />
          
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Preferências de Notificação</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-enabled">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações de eventos importantes
                  </p>
                </div>
                <Switch
                  id="notif-enabled"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-leads">Novos Leads</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando um novo lead for criado
                  </p>
                </div>
                <Switch id="notif-leads" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-messages">Novas Mensagens</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando receber novas mensagens
                  </p>
                </div>
                <Switch id="notif-messages" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-appointments">Agendamentos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre agendamentos próximos
                  </p>
                </div>
                <Switch id="notif-appointments" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-finance">Movimentações Financeiras</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novas transações e vencimentos
                  </p>
                </div>
                <Switch id="notif-finance" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-approvals">Aprovações Pendentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre itens que precisam de aprovação
                  </p>
                </div>
                <Switch id="notif-approvals" defaultChecked />
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Configurações do Sistema</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select defaultValue="america-sao-paulo">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao-paulo">América/São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="america-new-york">América/Nova York (GMT-5)</SelectItem>
                    <SelectItem value="europe-london">Europa/Londres (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="pt-br">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select defaultValue="brl">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brl">Real (BRL)</SelectItem>
                    <SelectItem value="usd">Dólar (USD)</SelectItem>
                    <SelectItem value="eur">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Alterna entre tema claro e escuro
                  </p>
                </div>
                <Switch id="dark-mode" />
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-destructive">
            <h2 className="text-xl font-bold text-destructive mb-4">Zona de Perigo</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Exportar Dados</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Exporte todos os dados da sua organização em formato JSON
                </p>
                <Button variant="outline">Exportar Dados</Button>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-destructive mb-2">Excluir Organização</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Esta ação é irreversível. Todos os dados serão permanentemente excluídos.
                </p>
                <Button variant="destructive">Excluir Organização</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}