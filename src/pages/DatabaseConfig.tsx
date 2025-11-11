import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function DatabaseConfig() {
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('SUPABASE_KEY') || '');
  const { toast } = useToast();

  const handleSave = () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('SUPABASE_URL', supabaseUrl);
    localStorage.setItem('SUPABASE_KEY', supabaseKey);
    toast({
      title: 'Sucesso',
      description: 'Configurações salvas! Recarregue a página para aplicar as mudanças.',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configuração do Banco de Dados</h1>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl">URL do Supabase</Label>
            <Input
              id="supabaseUrl"
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://seu-projeto.supabase.co"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseKey">Chave API do Supabase</Label>
            <Input
              id="supabaseKey"
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="Sua chave API"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Salvar Configurações
          </Button>
        </div>
      </Card>
    </div>
  );
}