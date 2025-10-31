import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { notaId } = await req.json();

    if (!notaId) {
      throw new Error('notaId é obrigatório');
    }

    console.log('Processando emissão de nota:', notaId);

    // Buscar nota fiscal
    const { data: nota, error: notaError } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('id', notaId)
      .single();

    if (notaError || !nota) {
      throw new Error('Nota fiscal não encontrada');
    }

    // Simular integração com SEFAZ
    // Em produção, aqui você faria a integração real com a SEFAZ
    const simulacaoSefaz = await simularEmissaoSefaz(nota);

    // Atualizar nota com resultado
    const updateData: any = {
      status: simulacaoSefaz.sucesso ? 'emitida' : 'erro',
      numero: simulacaoSefaz.numero,
      serie: simulacaoSefaz.serie,
      chave_acesso: simulacaoSefaz.chave_acesso,
      protocolo_sefaz: simulacaoSefaz.protocolo,
      xml_nfe: simulacaoSefaz.xml,
      data_emissao: new Date().toISOString(),
      mensagem_erro: simulacaoSefaz.erro || null
    };

    const { error: updateError } = await supabase
      .from('notas_fiscais')
      .update(updateData)
      .eq('id', notaId);

    if (updateError) {
      throw updateError;
    }

    // Registrar no fluxo de caixa se emitida com sucesso
    if (simulacaoSefaz.sucesso) {
      await supabase.from('fluxo_caixa').insert([{
        data: new Date().toISOString().split('T')[0],
        tipo: 'entrada',
        categoria: 'Vendas',
        descricao: `Nota Fiscal ${nota.tipo.toUpperCase()} - ${nota.cliente_nome}`,
        valor: nota.valor_total,
        origem_id: notaId,
        origem_tipo: 'nota_fiscal'
      }]);
    }

    console.log('Nota processada com sucesso:', simulacaoSefaz);

    return new Response(
      JSON.stringify({ 
        sucesso: simulacaoSefaz.sucesso,
        mensagem: simulacaoSefaz.sucesso ? 'Nota emitida com sucesso' : simulacaoSefaz.erro,
        dados: simulacaoSefaz
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Erro ao emitir nota fiscal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        sucesso: false,
        erro: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

// Simula a integração com SEFAZ
async function simularEmissaoSefaz(nota: any) {
  // Em produção, aqui você implementaria a integração real com a SEFAZ
  // usando bibliotecas específicas e certificados digitais

  // Simular processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simular sucesso (90% das vezes)
  const sucesso = Math.random() > 0.1;

  if (!sucesso) {
    return {
      sucesso: false,
      erro: 'Erro na comunicação com SEFAZ. Tente novamente.'
    };
  }

  // Gerar dados simulados
  const numero = Math.floor(Math.random() * 900000) + 100000;
  const serie = '1';
  const chaveAcesso = Array.from({ length: 44 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  const protocolo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // XML simulado (em produção seria gerado corretamente)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe>
  <infNFe>
    <ide>
      <nNF>${numero}</nNF>
      <serie>${serie}</serie>
    </ide>
    <emit>
      <xNome>Empresa Exemplo</xNome>
    </emit>
    <dest>
      <xNome>${nota.cliente_nome}</xNome>
      <CNPJCPF>${nota.cliente_cpf_cnpj}</CNPJCPF>
    </dest>
  </infNFe>
</NFe>`;

  return {
    sucesso: true,
    numero: numero.toString(),
    serie,
    chave_acesso: chaveAcesso,
    protocolo,
    xml
  };
}
