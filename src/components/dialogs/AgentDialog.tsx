import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: any;
  onSave: (agent: any) => void;
}

export function AgentDialog({ open, onOpenChange, agent, onSave }: AgentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(agent || {
    name: '',
    description: '',
    status: 'Ativo',
    model: 'gemini-flash',
    prompt: '',
    n8nWebhook: '',
    audioEnabled: false,
    imageEnabled: false,
    fileEnabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave({ 
      ...formData, 
      id: agent?.id || Date.now(),
      conversations: agent?.conversations || 0,
      resolution: agent?.resolution || 0,
      avgResponse: agent?.avgResponse || 0,
    });
    
    toast({
      title: "Sucesso",
      description: `Agente ${agent ? 'atualizado' : 'criado'} com sucesso.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{agent ? 'Editar Agente' : 'Novo Agente IA'}</DialogTitle>
          <DialogDescription>
            {agent ? 'Atualize as configurações do agente' : 'Configure um novo agente inteligente'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Agente de Vendas"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descrição da função do agente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo de IA</Label>
              <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="gemini-pro">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="gemini-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                  <SelectItem value="gpt-5">GPT-5</SelectItem>
                  <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
                  <SelectItem value="gpt-5-nano">GPT-5 Nano</SelectItem>
                  <SelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5</SelectItem>
                  <SelectItem value="claude-opus-4">Claude Opus 4</SelectItem>
                  <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                  <SelectItem value="mistral-large">Mistral Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="n8nWebhook">Webhook n8n</Label>
            <Input
              id="n8nWebhook"
              value={formData.n8nWebhook}
              onChange={(e) => setFormData({ ...formData, n8nWebhook: e.target.value })}
              placeholder="https://seu-n8n.com/webhook/..."
            />
            <p className="text-xs text-muted-foreground">
              URL do webhook n8n para integração
            </p>
          </div>

          <div className="space-y-4">
            <Label>Capacidades do Agente</Label>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="audio" className="flex flex-col space-y-1 cursor-pointer">
                <span>Escutar Áudio</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Processar mensagens de áudio
                </span>
              </Label>
              <Switch
                id="audio"
                checked={formData.audioEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, audioEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="image" className="flex flex-col space-y-1 cursor-pointer">
                <span>Ler Imagens</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Analisar e descrever imagens
                </span>
              </Label>
              <Switch
                id="image"
                checked={formData.imageEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, imageEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="file" className="flex flex-col space-y-1 cursor-pointer">
                <span>Ler Arquivos</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Processar documentos e arquivos
                </span>
              </Label>
              <Switch
                id="file"
                checked={formData.fileEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, fileEnabled: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt do Sistema</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Defina como o agente deve se comportar e responder..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Este prompt define o comportamento e personalidade do agente
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {agent ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
