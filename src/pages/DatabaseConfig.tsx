import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Play,
  FileText,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

// Definição do esquema das tabelas
const TABLE_DEFINITIONS = {
  agentes: `
    CREATE TABLE IF NOT EXISTS agentes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Ativo',
      model TEXT DEFAULT 'gemini-flash',
      prompt TEXT,
      n8n_webhook TEXT,
      n8n_connected BOOLEAN DEFAULT false,
      audio_enabled BOOLEAN DEFAULT false,
      image_enabled BOOLEAN DEFAULT false,
      file_enabled BOOLEAN DEFAULT false,
      conversations INTEGER DEFAULT 0,
      resolution NUMERIC(5,2) DEFAULT 0,
      avg_response NUMERIC(5,2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  whatsapp_instances: `
    CREATE TABLE IF NOT EXISTS whatsapp_instances (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'disconnected',
      type TEXT DEFAULT 'whatsapp_cloud',
      qr_code_data TEXT,
      evolution_api_url TEXT,
      evolution_api_key TEXT,
      session_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  stages: `
    CREATE TABLE IF NOT EXISTS stages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT 'bg-gray-100 text-gray-800',
      "order" INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  leads: `
    CREATE TABLE IF NOT EXISTS leads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      stage_id UUID REFERENCES stages(id),
      value NUMERIC(10,2),
      source TEXT,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  config_fiscal: `
    CREATE TABLE IF NOT EXISTS config_fiscal (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      item_id UUID NOT NULL,
      item_tipo TEXT NOT NULL,
      cfop TEXT NOT NULL,
      cst TEXT,
      ncm TEXT,
      regras_fiscais_ids UUID[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  contas_pagar: `
    CREATE TABLE IF NOT EXISTS contas_pagar (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      descricao TEXT NOT NULL,
      valor NUMERIC(10,2) NOT NULL,
      data_vencimento DATE NOT NULL,
      data_pagamento DATE,
      categoria TEXT,
      fornecedor TEXT,
      status TEXT DEFAULT 'pendente',
      observacoes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  contas_receber: `
    CREATE TABLE IF NOT EXISTS contas_receber (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      descricao TEXT NOT NULL,
      valor NUMERIC(10,2) NOT NULL,
      data_vencimento DATE NOT NULL,
      data_recebimento DATE,
      categoria TEXT,
      cliente TEXT,
      status TEXT DEFAULT 'pendente',
      observacoes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  fluxo_caixa: `
    CREATE TABLE IF NOT EXISTS fluxo_caixa (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      data DATE NOT NULL,
      tipo TEXT NOT NULL, -- entrada/saida
      categoria TEXT NOT NULL,
      descricao TEXT NOT NULL,
      valor NUMERIC(10,2) NOT NULL,
      origem_id UUID,
      origem_tipo TEXT,
      saldo_acumulado NUMERIC(10,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  notas_fiscais: `
    CREATE TABLE IF NOT EXISTS notas_fiscais (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      tipo TEXT NOT NULL, -- nfse/nfe
      cliente_nome TEXT NOT NULL,
      cliente_cpf_cnpj TEXT NOT NULL,
      valor_total NUMERIC(10,2) NOT NULL,
      itens JSONB NOT NULL,
      status TEXT DEFAULT 'pendente',
      numero TEXT,
      serie TEXT,
      chave_acesso TEXT,
      protocolo_sefaz TEXT,
      data_emissao TIMESTAMP WITH TIME ZONE,
      xml_nfe TEXT,
      mensagem_erro TEXT,
      impostos JSONB,
      valor_impostos NUMERIC(10,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  regras_fiscais: `
    CREATE TABLE IF NOT EXISTS regras_fiscais (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL, -- ISS/ICMS/PIS/COFINS
      aliquota NUMERIC(5,2) NOT NULL,
      descricao TEXT,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
};

// Versão do esquema para rastreamento de atualizações
const SCHEMA_VERSION = '1.0.0';

export default function DatabaseConfig() {
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('SUPABASE_KEY') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [schemaStatus, setSchemaStatus] = useState<'idle' | 'checking' | 'updating' | 'updated' | 'error'>('idle');
  const [schemaLog, setSchemaLog] = useState<string[]>([]);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [currentSchemaVersion, setCurrentSchemaVersion] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar versão do esquema
  const checkSchemaVersion = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('schema_migrations')
        .select('version')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== '42P01') {
        throw error;
      }

      if (data) {
        setCurrentSchemaVersion(data.version);
        return data.version;
      }
      return null;
    } catch (error) {
      console.warn('Erro ao verificar versão do esquema:', error);
      return null;
    }
  }, []);

  // Atualizar versão do esquema
  const updateSchemaVersion = useCallback(async (version: string) => {
    try {
      // Criar tabela de migrações se não existir
      await (supabase as any).rpc('execute_sql', { 
        sql: `
          CREATE TABLE IF NOT EXISTS schema_migrations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            version TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        ` 
      });

      // Inserir nova versão
      await (supabase as any)
        .from('schema_migrations')
        .insert({
          version,
          description: `Atualização automática para versão ${version}`
        });
    } catch (error) {
      console.error('Erro ao atualizar versão do esquema:', error);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (!supabaseUrl || !supabaseKey) {
      setIsConnected(false);
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('connecting');
    try {
      // Testar conexão com uma query simples
      const { data, error } = await (supabase as any)
        .from('stages')
        .select('id')
        .limit(1);

      if (error && error.code !== '42P01') { // 42P01 = tabela não existe
        throw new Error(error.message);
      }

      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Verificar versão do esquema após conexão
      await checkSchemaVersion();
      
      toast({
        title: 'Conectado',
        description: 'Conexão com o banco de dados estabelecida com sucesso.',
      });
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('error');
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao banco de dados.',
        variant: 'destructive',
      });
    }
  }, [supabaseUrl, supabaseKey, checkSchemaVersion, toast]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleSaveCredentials = () => {
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
      title: 'Credenciais salvas',
      description: 'As credenciais foram salvas com sucesso.',
    });
    checkConnection();
  };

  const checkSchema = useCallback(async () => {
    if (!isConnected) return;

    setSchemaStatus('checking');
    setSchemaLog(['Verificando esquema do banco de dados...']);
    
    try {
      const missing: string[] = [];
      
      for (const tableName of Object.keys(TABLE_DEFINITIONS)) {
        const { error } = await (supabase as any)
          .from(tableName)
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') { // Tabela não existe
          missing.push(tableName);
          setSchemaLog(prev => [...prev, `Tabela "${tableName}" não encontrada`]);
        } else {
          setSchemaLog(prev => [...prev, `Tabela "${tableName}" OK`]);
        }
      }
      
      setMissingTables(missing);
      
      if (missing.length === 0) {
        setSchemaStatus('updated');
        setSchemaLog(prev => [...prev, 'Todos os esquemas estão atualizados']);
        toast({
          title: 'Esquema atualizado',
          description: 'Todas as tabelas estão presentes no banco de dados.',
        });
      } else {
        setSchemaStatus('idle');
        setSchemaLog(prev => [...prev, `Encontradas ${missing.length} tabelas faltando`]);
      }
    } catch (error) {
      setSchemaStatus('error');
      setSchemaLog(prev => [...prev, `Erro ao verificar esquema: ${error.message}`]);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar o esquema do banco de dados.',
        variant: 'destructive',
      });
    }
  }, [isConnected, toast]);

  const updateSchema = useCallback(async () => {
    if (!isConnected || missingTables.length === 0) return;

    setSchemaStatus('updating');
    setSchemaLog(['Atualizando esquema do banco de dados...']);
    
    try {
      for (const tableName of missingTables) {
        const definition = TABLE_DEFINITIONS[tableName as keyof typeof TABLE_DEFINITIONS];
        setSchemaLog(prev => [...prev, `Criando tabela "${tableName}"...`]);
        
        const { error } = await (supabase as any).rpc('execute_sql', { sql: definition });
        
        if (error) {
          throw new Error(`Erro ao criar tabela "${tableName}": ${error.message}`);
        }
        
        setSchemaLog(prev => [...prev, `Tabela "${tableName}" criada com sucesso`]);
      }
      
      // Atualizar versão do esquema
      await updateSchemaVersion(SCHEMA_VERSION);
      
      setSchemaStatus('updated');
      setSchemaLog(prev => [...prev, 'Esquema atualizado com sucesso!']);
      setMissingTables([]);
      setCurrentSchemaVersion(SCHEMA_VERSION);
      
      toast({
        title: 'Sucesso',
        description: 'Esquema do banco de dados atualizado com sucesso.',
      });
    } catch (error) {
      setSchemaStatus('error');
      setSchemaLog(prev => [...prev, `Erro ao atualizar esquema: ${error.message}`]);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar o esquema do banco de dados.',
        variant: 'destructive',
      });
    }
  }, [isConnected, missingTables, updateSchemaVersion, toast]);

  // Verificação automática de esquema ao carregar
  useEffect(() => {
    if (isConnected) {
      checkSchema();
    }
  }, [isConnected, checkSchema]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuração do Banco de Dados</h1>
        <p className="text-muted-foreground mt-2">
          Configure as credenciais e gerencie o esquema do banco de dados
        </p>
      </div>

      {/* Status do Sistema */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Status do Sistema</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            {connectionStatus === 'connected' ? (
              <ShieldCheck className="w-5 h-5 text-success" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-warning" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">Conexão</p>
              <p className="font-semibold">
                {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            {schemaStatus === 'updated' ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-warning" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">Esquema</p>
              <p className="font-semibold">
                {schemaStatus === 'updated' ? 'Atualizado' : 'Pendente'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="font-semibold">
                {currentSchemaVersion || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Configuração de Credenciais */}
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
            <Button onClick={handleSaveCredentials}>
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

      {/* Gerenciamento de Esquema */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Gerenciamento de Esquema</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={checkSchema}
              disabled={!isConnected || schemaStatus === 'checking' || schemaStatus === 'updating'}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Verificar Esquema
            </Button>
            
            <Button 
              onClick={updateSchema}
              disabled={!isConnected || missingTables.length === 0 || schemaStatus === 'updating'}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Play className="w-4 h-4 mr-2" />
              Atualizar Esquema
            </Button>
          </div>
          
          {schemaLog.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Log de Operações:</h3>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                {schemaLog.map((log, index) => (
                  <div key={index} className="text-sm py-1 border-b border-muted-foreground/10 last:border-0">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {missingTables.length > 0 && (
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <h3 className="font-medium text-warning mb-2">Tabelas Faltando:</h3>
              <div className="flex flex-wrap gap-2">
                {missingTables.map((table) => (
                  <span 
                    key={table} 
                    className="px-2 py-1 bg-warning text-warning-foreground text-xs rounded"
                  >
                    {table}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {schemaStatus === 'updated' && (
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium text-success">Esquema Atualizado</span>
              </div>
              <p className="text-sm text-success/80 mt-1">
                Todas as tabelas necessárias estão presentes no banco de dados.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Visualização do Esquema */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Definição das Tabelas</h2>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(TABLE_DEFINITIONS).map(([tableName, definition]) => (
            <div key={tableName} className="border rounded-lg">
              <div className="p-3 bg-muted border-b">
                <h3 className="font-mono font-semibold">{tableName}</h3>
              </div>
              <div className="p-3">
                <pre className="text-xs overflow-x-auto">
                  {definition.trim()}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}