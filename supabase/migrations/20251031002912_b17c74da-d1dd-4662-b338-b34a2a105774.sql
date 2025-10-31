-- Tabela de Contas a Pagar
CREATE TABLE public.contas_pagar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  categoria TEXT NOT NULL,
  fornecedor TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Contas a Receber
CREATE TABLE public.contas_receber (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  categoria TEXT NOT NULL,
  cliente TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'vencido')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Regras Fiscais
CREATE TABLE public.regras_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ISS', 'ICMS', 'PIS', 'COFINS')),
  aliquota DECIMAL(5,2) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Configuração Fiscal de Produtos/Serviços
CREATE TABLE public.config_fiscal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  item_tipo TEXT NOT NULL CHECK (item_tipo IN ('produto', 'servico')),
  cfop TEXT NOT NULL,
  cst TEXT,
  ncm TEXT,
  regras_fiscais_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Notas Fiscais
CREATE TABLE public.notas_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT,
  serie TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('nfe', 'nfse')),
  chave_acesso TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'emitida', 'cancelada', 'erro')),
  cliente_nome TEXT NOT NULL,
  cliente_cpf_cnpj TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_impostos DECIMAL(10,2),
  itens JSONB NOT NULL,
  impostos JSONB,
  xml_nfe TEXT,
  protocolo_sefaz TEXT,
  mensagem_erro TEXT,
  data_emissao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Fluxo de Caixa
CREATE TABLE public.fluxo_caixa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  saldo_acumulado DECIMAL(10,2),
  origem_id UUID,
  origem_tipo TEXT CHECK (origem_tipo IN ('conta_pagar', 'conta_receber', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_fiscal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;

-- Policies (public access for now - adjust based on auth requirements)
CREATE POLICY "Allow all operations on contas_pagar" ON public.contas_pagar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on contas_receber" ON public.contas_receber FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on regras_fiscais" ON public.regras_fiscais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on config_fiscal" ON public.config_fiscal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on notas_fiscais" ON public.notas_fiscais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on fluxo_caixa" ON public.fluxo_caixa FOR ALL USING (true) WITH CHECK (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON public.contas_pagar
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON public.contas_receber
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regras_fiscais_updated_at BEFORE UPDATE ON public.regras_fiscais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_fiscal_updated_at BEFORE UPDATE ON public.config_fiscal
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notas_fiscais_updated_at BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX idx_contas_receber_status ON public.contas_receber(status);
CREATE INDEX idx_notas_fiscais_status ON public.notas_fiscais(status);
CREATE INDEX idx_fluxo_caixa_data ON public.fluxo_caixa(data);
CREATE INDEX idx_config_fiscal_item ON public.config_fiscal(item_id, item_tipo);