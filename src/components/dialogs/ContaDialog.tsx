import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'receber' | 'pagar';
  conta?: any;
  onSave: () => void;
}

export function ContaDialog({ open, onOpenChange, type, conta, onSave }: ContaDialogProps) {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data_vencimento: '',
    categoria: '',
    cliente: '',
    fornecedor: '',
    status: 'pendente',
    observacoes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (conta) {
      setFormData({
        descricao: conta.descricao || '',
        valor: conta.valor || '',
        data_vencimento: conta.data_vencimento || '',
        categoria: conta.categoria || '',
        cliente: conta.cliente || '',
        fornecedor: conta.fornecedor || '',
        status: conta.status || 'pendente',
        observacoes: conta.observacoes || ''
      });
    } else {
      setFormData({
        descricao: '',
        valor: '',
        data_vencimento: '',
        categoria: '',
        cliente: '',
        fornecedor: '',
        status: 'pendente',
        observacoes: ''
      });
    }
  }, [conta, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descricao || !formData.valor || !formData.data_vencimento || !formData.categoria) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const tableName = type === 'receber' ? 'contas_receber' : 'contas_pagar';
    const data = {
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data_vencimento: formData.data_vencimento,
      categoria: formData.categoria,
      status: formData.status,
      observacoes: formData.observacoes || null,
      ...(type === 'receber' ? { cliente: formData.cliente || null } : { fornecedor: formData.fornecedor || null })
    };

    let result;
    if (conta) {
      result = await supabase.from(tableName).update(data).eq('id', conta.id);
    } else {
      result = await supabase.from(tableName).insert([data]);
    }

    if (result.error) {
      toast({
        title: 'Erro',
        description: `Erro ao salvar conta: ${result.error.message}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: `Conta ${conta ? 'atualizada' : 'criada'} com sucesso!`,
      });
      onSave();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {conta ? 'Editar' : 'Nova'} Conta a {type === 'receber' ? 'Receber' : 'Pagar'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Pagamento de cliente"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento *</Label>
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {type === 'receber' ? (
                    <>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Produtos">Produtos</SelectItem>
                      <SelectItem value="Consultas">Consultas</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="Salários">Salários</SelectItem>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Impostos">Impostos</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {type === 'receber' ? (
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  placeholder="Nome do fornecedor"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value={type === 'receber' ? 'recebido' : 'pago'}>
                    {type === 'receber' ? 'Recebido' : 'Pago'}
                  </SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {conta ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
