import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CredentialsFormProps {
  initialUrl: string;
  initialKey: string;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  onSave: (url: string, key: string) => void;
  onCheckConnection: () => void;
}

export function CredentialsForm({ 
  initialUrl, 
  initialKey, 
  connectionStatus, 
  onSave, 
  onCheckConnection 
}: CredentialsFormProps) {
  const [supabaseUrl, setSupabaseUrl] = useState(initialUrl);
  const [supabaseKey, setSupabaseKey] = useState(initialKey);
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

    onSave(supabaseUrl, supabaseKey);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Credenciais do Supabase</h2>
      </div>
      
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
        
        <div className="flex items-center justify-between">
          <Button onClick={handleSave}>
            Salvar Credenciais
          </Button>
          
          <div className="flex items-center gap-2">
            {connectionStatus === 'connecting' && (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            {connectionStatus === 'connected' && (
              <CheckCircle className="w-4 h-4 text-success" />
            )}
            {connectionStatus === 'error' && (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">
              {connectionStatus === 'idle' && 'Não verificado'}
              {connectionStatus === 'connecting' && 'Conectando...'}
              {connectionStatus === 'connected' && 'Conectado'}
              {connectionStatus === 'error' && 'Erro de conexão'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}