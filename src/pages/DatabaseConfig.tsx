import { useState } from 'react';
import { Card, Button } from '@/components/ui';  // Changed to use the alias
import { useToast } from '@/hooks/use-toast';

export default function DatabaseConfig() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
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
      description: 'Configurações salvas',
    });
  };

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold mb-6">Configuração do Supabase</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">URL do Supabase</label>
          <input
            type="text"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://your-project.supabase.co"
          />
        </div>
        <div>
          <label className="block mb-2">Chave API do Supabase</label>
          <input
            type="password"
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Sua chave API"
          />
        </div>
        <Button onClick={handleSave} className="mt-4">
          Salvar Configurações
        </Button>
      </div>
    </Card>
  );
}