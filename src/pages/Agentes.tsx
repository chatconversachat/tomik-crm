import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare, TrendingUp, Clock, Plus, Settings2, Cpu, Link, Check, X } from 'lucide-react';
import { AgentDialog } from '@/components/dialogs/AgentDialog';
import { useToast } from '@/hooks/use-toast';
import { AgentConfigModal } from '@/components/AgentConfigModal';  // Fixed import path

const mockAgents = [
  {
    id: 1,
    name: 'Agente de Vendas',
    description: 'Atende consultas sobre produtos e serviços',
    status: 'Ativo',
    conversations: 142,
    resolution: 87,
    avgResponse: 2.3,
  },
  {
    id: 2,
    name: 'Agente de Suporte',
    description: 'Ajuda com problemas técnicos e dúvidas',
    status: 'Ativo',
    conversations: 89,
    resolution: 92,
    avgResponse: 1.5,
  },
  {
    id: 3,
    name: 'Agente de Agendamento',
    description: 'Gerencia agendamentos e calendário',
    status: 'Pausado',
    conversations: 56,
    resolution: 95,
    avgResponse: 1.2,
  },
];

export default function Agentes() {
  const [agents, setAgents] = useState(mockAgents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedAgentConfig, setSelectedAgentConfig] = useState<any>(null);
  const { toast } = useToast();

  const handleSaveAgent = (agent: any) => {
    if (selectedAgent) {
      setAgents(agents.map(a => a.id === agent.id ? agent : a));
    } else {
      setAgents([...agents, agent]);
    }
    setSelectedAgent(null);
  };

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleOpenConfig = (agent: any) => {
    setSelectedAgentConfig(agent);
    setConfigOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agentes IA</h1>
          <p className="text-muted-foreground mt-1">Configure e monitore seus agentes inteligentes</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => {
            setSelectedAgent(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary to-accent text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white/80">Total de Conversas</div>
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">1,429</div>
          <div className="text-sm text-white/80 mt-2">Hoje</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-muted-foreground">Taxa de Resolução</div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-3xl font-bold text-foreground">89%</div>
          <div className="text-sm text-success mt-2">+5% vs semana anterior</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-muted-foreground">Tempo Médio</div>
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold text-foreground">2.1s</div>
          <div className="text-sm text-muted-foreground mt-2">Por resposta</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-muted-foreground">Agentes Ativos</div>
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">2/3</div>
          <div className="text-sm text-muted-foreground mt-2">Em operação</div>
        </Card>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={
                  agent.status === 'Ativo' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-warning/10 text-warning'
                }>
                  {agent.status}
                </Badge>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditAgent(agent)}
                >
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleOpenConfig(agent)}
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Conversas</div>
                <div className="text-2xl font-bold text-foreground">{agent.conversations}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Resolução</div>
                <div className="text-2xl font-bold text-success">{agent.resolution}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tempo Médio</div>
                <div className="text-2xl font-bold text-foreground">{agent.avgResponse}s</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AgentConfigModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        agent={selectedAgentConfig}
        onSave={handleSaveAgent}
      />

      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        onSave={handleSaveAgent}
      />
    </div>
  );
}