import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

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

export function SchemaViewer() {
  return (
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
  );
}