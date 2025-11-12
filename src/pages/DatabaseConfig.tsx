import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseStatus } from '@/components/database/DatabaseStatus';
import { CredentialsForm } from '@/components/database/CredentialsForm';
import { SchemaManager } from '@/components/database/SchemaManager';
import { SchemaViewer } from '@/components/database/SchemaViewer';

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

  const handleSaveCredentials = (url: string, key: string) => {
    localStorage.setItem('SUPABASE_URL', url);
    localStorage.setItem('SUPABASE_KEY', key);
    setSupabaseUrl(url);
    setSupabaseKey(key);
    
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
      
      // Definição do esquema das tabelas
      const TABLE_DEFINITIONS = {
        agentes: 'agentes',
        whatsapp_instances: 'whatsapp_instances',
        stages: 'stages',
        leads: 'leads',
        config_fiscal: 'config_fiscal',
        contas_pagar: 'contas_pagar',
        contas_receber: 'contas_receber',
        fluxo_caixa: 'fluxo_caixa',
        notas_fiscais: 'notas_fiscais',
        regras_fiscais: 'regras_fiscais'
      };
      
      for (const tableName of Object.values(TABLE_DEFINITIONS)) {
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

      <DatabaseStatus 
        connectionStatus={connectionStatus}
        schemaStatus={schemaStatus}
        currentSchemaVersion={currentSchemaVersion}
      />

      <CredentialsForm
        initialUrl={supabaseUrl}
        initialKey={supabaseKey}
        connectionStatus={connectionStatus}
        onSave={handleSaveCredentials}
        onCheckConnection={checkConnection}
      />

      <SchemaManager
        isConnected={isConnected}
        schemaStatus={schemaStatus}
        missingTables={missingTables}
        schemaLog={schemaLog}
        onCheckSchema={checkSchema}
        onUpdateSchema={updateSchema}
      />

      <SchemaViewer />
    </div>
  );
}