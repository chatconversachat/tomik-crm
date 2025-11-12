import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppInstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance?: any;
  onSave: (instance: any) => void;
}

export function WhatsAppInstanceDialog({ open, onOpenChange, instance, onSave }: WhatsAppInstanceDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(instance || {
    name: '',
    phone: '',
    status: 'disconnected',
    type: 'whatsapp_cloud', // Default type
    evolution_api_url: '',
    evolution_api_key: '',
  });

  useEffect(() => {
    if (instance) {
      setFormData(instance);
    } else {
      setFormData({
        name: '',
        phone: '',
        status: 'disconnected',
        type: 'whatsapp_cloud',
        evolution_api_url: '',
        evolution_api_key: '',
      });
    }
  }, [instance, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'evolution_api' && (!formData.evolution_api_url || !formData.evolution_api_key)) {
      toast({
        title: "Erro",
        description: "Para Evolution API, URL e API Key são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave({ ...formData, id: instance?.id || Date.now().toString() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{instance ? 'Editar Instância' : 'Nova Instância WhatsApp'}</DialogTitle>
          <DialogDescription>
            {instance ? 'Atualize as informações da instância' : 'Configure uma nova instância do WhatsApp'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Instância *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Principal, Vendas, Suporte"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+55 11 98765-4321"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Instância *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp_cloud">WhatsApp Cloud API</SelectItem>
                <SelectItem value="evolution_api">Evolution API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'evolution_api' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="evolution_api_url">URL da Evolution API *</Label>
                <Input
                  id="evolution_api_url"
                  value={formData.evolution_api_url}
                  onChange={(e) => setFormData({ ...formData, evolution_api_url: e.target.value })}
                  placeholder="https://sua-evolution-api.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evolution_api_key">API Key da Evolution *</Label>
                <Input
                  id="evolution_api_key"
                  type="password"
                  value={formData.evolution_api_key}
                  onChange={(e) => setFormData({ ...formData, evolution_api_key: e.target.value })}
                  placeholder="Sua API Key da Evolution"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {instance ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}