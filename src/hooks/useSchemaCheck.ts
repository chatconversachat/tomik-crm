import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Versão do esquema para rastreamento de atualizações
const SCHEMA_VERSION = '1.0.0';

export const useSchemaCheck = () => {
  const { toast } = useToast();

  useEffect(() => {
    const checkSchema = async () => {
      try {
        // Verificar se há tabelas faltando
        const requiredTables = [
          'agentes',
          'whatsapp_instances',
          'stages',
          'leads',
          'config_fiscal',
          'contas_pagar',
          'contas_receber',
          'fluxo_caixa',
          'notas_fiscais',
          'regras_fiscais'
        ];

        const missingTables = [];
        
        for (const tableName of requiredTables) {
          const { error } = await (supabase as any)
            .from(tableName)
            .select('id')
            .limit(1);
          
          if (error && error.code === '42P01') { // Tabela não existe
            missingTables.push(tableName);
          }
        }

        if (missingTables.length > 0) {
          toast({
            title: 'Atualização Necessária',
            description: `Detectadas ${missingTables.length} tabelas faltando. Acesse Configurações > Banco de Dados para atualizar.`,
            variant: 'destructive', // Corrigido para um valor válido
          });
        }
      } catch (error) {
        console.error('Erro na verificação automática de esquema:', error);
      }
    };

    // Verificar esquema quando o app é carregado
    checkSchema();
  }, [toast]);
};