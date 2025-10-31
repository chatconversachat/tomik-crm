import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotaFiscalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function NotaFiscalDialog({ open, onOpenChange, onSave }: NotaFiscalDialogProps) {
  const [formData, setFormData] = useState({
    tipo: 'nfse',
    cliente_nome: '',
    cliente_cpf_cnpj: '',
    descricao_item: '',
    quantidade: '1',
    valor_unitario: '',
    cfop: '',
    ncm: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cliente_nome || !formData.cliente_cpf_cnpj || !formData.descricao_item || !formData.valor_unitario) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const valorTotal = parseFloat(formData.valor_unitario) * parseInt(formData.quantidade);
    
    const itens = [{
      descricao: formData.descricao_item,
      quantidade: parseInt(formData.quantidade),
      valor_unitario: parseFloat(formData.valor_unitario),
      valor_total: valorTotal
    }];

    const notaData = {
      tipo: formData.tipo,
      cliente_nome: formData.cliente_nome,
      cliente_cpf_cnpj: formData.cliente_cpf_cnpj,
      valor_total: valorTotal,
      itens: itens,
      status: 'pendente'
    };

    const { data: nota, error: insertError } = await supabase
      .from('notas_fiscais')
      .insert([notaData])
      .select()
      .single();

    if (insertError) {
      toast({
        title: 'Erro',
        description: `Erro ao criar nota: ${insertError.message}`,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Call edge function to emit the invoice
    const { data: emitResult, error: emitError } = await supabase.functions.invoke('emitir-nota-fiscal', {
      body: { notaId: nota.id }
    });

    if (emitError) {
      toast({
        title: 'Erro na Emissão',
        description: 'Nota criada mas houve erro na emissão. Tente reemitir.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal emitida com sucesso!',
      });
    }

    setIsSubmitting(false);
    onSave();
    onOpenChange(false);

    // Reset form
    setFormData({
      tipo: 'nfse',
      cliente_nome: '',
      cliente_cpf_cnpj: '',
      descricao_item: '',
      quantidade: '1',
      valor_unitario: '',
      cfop: '',
      ncm: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir Nota Fiscal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Nota *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nfse">NFS-e (Serviços)</SelectItem>
                  <SelectItem value="nfe">NF-e (Produtos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>CPF/CNPJ do Cliente *</Label>
              <Input
                value={formData.cliente_cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cliente_cpf_cnpj: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Nome do Cliente *</Label>
              <Input
                value={formData.cliente_nome}
                onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                placeholder="Nome completo ou razão social"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Descrição do Item/Serviço *</Label>
              <Input
                value={formData.descricao_item}
                onChange={(e) => setFormData({ ...formData, descricao_item: e.target.value })}
                placeholder="Descrição detalhada"
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Unitário *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_unitario}
                onChange={(e) => setFormData({ ...formData, valor_unitario: e.target.value })}
                placeholder="0.00"
              />
            </div>

            {formData.tipo === 'nfe' && (
              <>
                <div className="space-y-2">
                  <Label>CFOP</Label>
                  <Input
                    value={formData.cfop}
                    onChange={(e) => setFormData({ ...formData, cfop: e.target.value })}
                    placeholder="Ex: 5102"
                  />
                </div>

                <div className="space-y-2">
                  <Label>NCM</Label>
                  <Input
                    value={formData.ncm}
                    onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    placeholder="Ex: 85371091"
                  />
                </div>
              </>
            )}
          </div>

          {formData.quantidade && formData.valor_unitario && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Valor Total:</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {(parseFloat(formData.valor_unitario) * parseInt(formData.quantidade)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Emitindo...' : 'Emitir Nota'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
