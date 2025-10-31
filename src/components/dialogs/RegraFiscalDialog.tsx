import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RegraFiscalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regra?: any;
  onSave: () => void;
}

export function RegraFiscalDialog({ open, onOpenChange, regra, onSave }: RegraFiscalDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'ISS',
    aliquota: '',
    descricao: '',
    ativo: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (regra) {
      setFormData({
        nome: regra.nome || '',
        tipo: regra.tipo || 'ISS',
        aliquota: regra.aliquota?.toString() || '',
        descricao: regra.descricao || '',
        ativo: regra.ativo ?? true
      });
    } else {
      setFormData({
        nome: '',
        tipo: 'ISS',
        aliquota: '',
        descricao: '',
        ativo: true
      });
    }
  }, [regra, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.aliquota) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const data = {
      nome: formData.nome,
      tipo: formData.tipo,
      aliquota: parseFloat(formData.aliquota),
      descricao: formData.descricao || null,
      ativo: formData.ativo
    };

    let result;
    if (regra) {
      result = await supabase.from('regras_fiscais').update(data).eq('id', regra.id);
    } else {
      result = await supabase.from('regras_fiscais').insert([data]);
    }

    if (result.error) {
      toast({
        title: 'Erro',
        description: `Erro ao salvar regra: ${result.error.message}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: `Regra fiscal ${regra ? 'atualizada' : 'criada'} com sucesso!`,
      });
      onSave();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {regra ? 'Editar' : 'Nova'} Regra Fiscal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: ISS Serviços"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISS">ISS</SelectItem>
                  <SelectItem value="ICMS">ICMS</SelectItem>
                  <SelectItem value="PIS">PIS</SelectItem>
                  <SelectItem value="COFINS">COFINS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alíquota (%) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.aliquota}
                onChange={(e) => setFormData({ ...formData, aliquota: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2 flex items-center space-x-2 pt-6">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label>Regra Ativa</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição da regra fiscal"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {regra ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
