import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: any;
  onSave: (lead: any) => void;
}

export function LeadDialog({ open, onOpenChange, lead, onSave }: LeadDialogProps) {
  const { toast } = useToast();
  const [stages, setStages] = useState<any[]>([]);
  const [formData, setFormData] = useState(lead || {
    name: '',
    email: '',
    phone: '',
    stage_id: '', // Changed to stage_id
    value: '',
    source: '',
    description: '',
  });

  useEffect(() => {
    loadStages();
    if (lead) {
      setFormData({
        ...lead,
        value: lead.value ? lead.value.toString() : '', // Ensure value is string for input
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        stage_id: '',
        value: '',
        source: '',
        description: '',
      });
    }
  }, [lead, open]);

  const loadStages = async () => {
    const { data, error } = await supabase.from('stages').select('*').order('order');
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar etapas', variant: 'destructive' });
    } else {
      setStages(data || []);
      if (!lead && data && data.length > 0) {
        setFormData(prev => ({ ...prev, stage_id: data[0].id })); // Set default stage for new leads
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.stage_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const leadToSave = {
      ...formData,
      value: formData.value ? parseFloat(formData.value) : null,
      id: lead?.id || crypto.randomUUID(), // Generate UUID for new leads
    };

    onSave(leadToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
          <DialogDescription>
            {lead ? 'Atualize as informações do lead' : 'Adicione um novo lead ao sistema'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 98765-4321"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage_id">Estágio *</Label>
            <Select value={formData.stage_id} onValueChange={(value) => setFormData({ ...formData, stage_id: value })}>
              <SelectTrigger id="stage_id">
                <SelectValue placeholder="Selecione o estágio" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor Estimado</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="5000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Origem</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Site">Site</SelectItem>
                <SelectItem value="Indicação">Indicação</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {lead ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}