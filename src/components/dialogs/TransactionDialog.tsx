import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'entrada' | 'saida';
  transaction?: any;
  onSave: (transaction: any) => void;
}

export function TransactionDialog({ open, onOpenChange, type, transaction, onSave }: TransactionDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(transaction || {
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    category: type === 'entrada' ? 'Consulta' : 'Compras',
    status: type === 'entrada' ? 'Confirmado' : 'Pago',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.value || !formData.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.'));
    onSave({ 
      ...formData, 
      value,
      id: transaction?.id || Date.now() 
    });
    
    toast({
      title: "Sucesso",
      description: `${type === 'entrada' ? 'Receita' : 'Despesa'} ${transaction ? 'atualizada' : 'criada'} com sucesso.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar' : 'Nova'} {type === 'entrada' ? 'Receita' : 'Despesa'}
          </DialogTitle>
          <DialogDescription>
            {transaction 
              ? `Atualize as informações da ${type === 'entrada' ? 'receita' : 'despesa'}` 
              : `Adicione uma nova ${type === 'entrada' ? 'receita' : 'despesa'}`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={`Descrição da ${type === 'entrada' ? 'receita' : 'despesa'}`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="R$ 1.000,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {type === 'entrada' ? (
                  <>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Produto">Produto</SelectItem>
                    <SelectItem value="Serviço">Serviço</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Compras">Compras</SelectItem>
                    <SelectItem value="Despesas Fixas">Despesas Fixas</SelectItem>
                    <SelectItem value="Salários">Salários</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </>
                )}
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
                {type === 'entrada' ? (
                  <>
                    <SelectItem value="Confirmado">Confirmado</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {transaction ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
