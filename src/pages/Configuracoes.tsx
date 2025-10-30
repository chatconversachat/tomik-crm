import { useState } from 'react';
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
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WhatsAppInstanceDialog } from '@/components/dialogs/WhatsAppInstanceDialog';

const mockInstances = [
  { id: 1, name: 'Principal', phone: '+55 11 98765-4321', status: 'connected' },
  { id: 2, name: 'Vendas', phone: '+55 21 99876-5432', status: 'connected' },
  { id: 3, name: 'Suporte', phone: '+55 31 97654-3210', status: 'disconnected' },
];

export default function Configuracoes() {
  const [orgName, setOrgName] = useState('Tomik CRM');
  const [orgEmail, setOrgEmail] = useState('contato@tomikcrm.com');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [instances, setInstances] = useState(mockInstances);
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [n8nUrl, setN8nUrl] = useState('');
  const [n8nApiKey, setN8nApiKey] = useState('');
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');

  const handleSaveInstance = (instance: any) => {
    if (selectedInstance) {
      setInstances(instances.map(i => i.id === instance.id ? instance : i));
      toast({
        title: "Instância atualizada",
        description: "A instância foi atualizada com sucesso.",
      });
    } else {
      setInstances([...instances, { ...instance, id: Date.now() }]);
      toast({
        title: "Instância criada",
        description: "Nova instância WhatsApp criada com sucesso.",
      });
    }
    setSelectedInstance(null);
  };

  const handleEditInstance = (instance: any) => {
    setSelectedInstance(instance);
    setInstanceDialogOpen(true);
  };

  const handleDeleteInstance = (id: number) => {
    setInstances(instances.filter(i => i.id !== id));
    toast({
      title: "Instância removida",
      description: "A instância foi removida com sucesso.",
    });
  };

  const handleConnectInstance = (id: number) => {
    setInstances(instances.map(i => 
      i.id === id ? { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected' } : i
    ));
    const instance = instances.find(i => i.id === id);
    toast({
      title: instance?.status === 'connected' ? "Instância desconectada" : "Instância conectada",
      description: instance?.status === 'connected' 
        ? "A instância foi desconectada com sucesso." 
        : "A instância foi conectada com sucesso.",
    });
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
                <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{instance.name}</h3>
                      <Badge variant={instance.status === 'connected' ? 'default' : 'destructive'}>
                        {instance.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{instance.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={instance.status === 'connected' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleConnectInstance(instance.id)}
                    >
                      {instance.status === 'connected' ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Desconectar
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Conectar
                        </>
                      )}
                    </Button>
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
            <h2 className="text-xl font-bold text-foreground mb-4">Evolution API</h2>
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
                  URL base da sua Evolution API
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
                  API key para autenticação na Evolution API
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
                    Notificar sobre novas transações
                  </p>
                </div>
                <Switch id="notif-finance" />
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
