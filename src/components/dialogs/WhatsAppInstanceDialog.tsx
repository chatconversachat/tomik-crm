import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave({ ...formData, id: instance?.id || Date.now() });
    toast({
      title: "Sucesso",
      description: `Instância ${instance ? 'atualizada' : 'criada'} com sucesso.`,
    });
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
