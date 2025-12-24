import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus } from 'lucide-react';

export function CreateTestNotification() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<string>('info');
  const [category, setCategory] = useState<string>('system');
  const [priority, setPriority] = useState<string>('normal');
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title || !message) {
      toast({ title: 'Erro', description: 'Preencha título e mensagem', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Get user's tenant_id from profiles
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ title: 'Erro', description: 'Usuário não autenticado', variant: 'destructive' });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('notifications').insert({
        tenant_id: profile?.tenant_id,
        user_id: user.id,
        title,
        message,
        type,
        category,
        priority,
        action_url: '/configuracoes',
        action_label: 'Ver detalhes',
      });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Notificação criada!' });
      setTitle('');
      setMessage('');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createQuickNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      const notifications = [
        {
          tenant_id: profile?.tenant_id,
          user_id: user.id,
          title: 'Conta a pagar vencendo',
          message: 'A conta "Fornecedor ABC" vence em 2 dias. Valor: R$ 5.000,00',
          type: 'warning',
          category: 'financial',
          priority: 'high',
          action_url: '/financeiro',
          action_label: 'Ver conta',
        },
        {
          tenant_id: profile?.tenant_id,
          user_id: user.id,
          title: 'Aprovação pendente',
          message: 'Ordem de compra #1234 aguarda sua aprovação',
          type: 'approval',
          category: 'purchase',
          priority: 'urgent',
          action_url: '/compras',
          action_label: 'Aprovar',
        },
        {
          tenant_id: profile?.tenant_id,
          user_id: user.id,
          title: 'Medição concluída',
          message: 'A medição da Obra Residencial Alpha foi finalizada com sucesso',
          type: 'success',
          category: 'construction',
          priority: 'normal',
          action_url: '/obras',
          action_label: 'Ver medição',
        },
        {
          tenant_id: profile?.tenant_id,
          user_id: user.id,
          title: 'Contrato expirando',
          message: 'O contrato com Empreiteira XYZ expira em 7 dias',
          type: 'info',
          category: 'contract',
          priority: 'normal',
          action_url: '/contratos',
          action_label: 'Renovar',
        },
      ];

      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;

      toast({ title: 'Sucesso', description: '4 notificações de exemplo criadas!' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Criar Notificação de Teste</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="approval">Aprovação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="purchase">Compras</SelectItem>
                <SelectItem value="construction">Obras</SelectItem>
                <SelectItem value="contract">Contratos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da notificação"
          />
        </div>

        <div className="space-y-2">
          <Label>Mensagem</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensagem da notificação"
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCreate} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Notificação
          </Button>
          <Button variant="outline" onClick={createQuickNotifications} disabled={loading}>
            Criar 4 Exemplos
          </Button>
        </div>
      </div>
    </Card>
  );
}
