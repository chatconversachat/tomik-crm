export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agentes: { // NEW TABLE FOR AGENTS
        Row: {
          id: string;
          name: string;
          description: string;
          status: string;
          model: string;
          prompt: string;
          n8n_webhook: string | null;
          n8n_connected: boolean;
          audio_enabled: boolean;
          image_enabled: boolean;
          file_enabled: boolean;
          conversations: number;
          resolution: number;
          avg_response: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          status?: string;
          model?: string;
          prompt?: string;
          n8n_webhook?: string | null;
          n8n_connected?: boolean;
          audio_enabled?: boolean;
          image_enabled?: boolean;
          file_enabled?: boolean;
          conversations?: number;
          resolution?: number;
          avg_response?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          status?: string;
          model?: string;
          prompt?: string;
          n8n_webhook?: string | null;
          n8n_connected?: boolean;
          audio_enabled?: boolean;
          image_enabled?: boolean;
          file_enabled?: boolean;
          conversations?: number;
          resolution?: number;
          avg_response?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      config_fiscal: {
        Row: {
          cfop: string
          created_at: string
          cst: string | null
          id: string
          item_id: string
          item_tipo: string
          ncm: string | null
          regras_fiscais_ids: string[] | null
          updated_at: string
        }
        Insert: {
          cfop: string
          created_at?: string
          cst?: string | null
          id?: string
          item_id: string
          item_tipo: string
          ncm?: string | null
          regras_fiscais_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          cfop?: string
          created_at?: string
          cst?: string | null
          id?: string
          item_id?: string
          item_tipo?: string
          ncm?: string | null
          regras_fiscais_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      contas_pagar: {
        Row: {
          categoria: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          fornecedor: string | null
          id: string
          observacoes: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          fornecedor?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          fornecedor?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      contas_receber: {
        Row: {
          categoria: string
          cliente: string | null
          created_at: string
          data_recebimento: string | null
          data_vencimento: string
          descricao: string
          id: string
          observacoes: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          cliente?: string | null
          created_at?: string
          data_recebimento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          cliente?: string | null
          created_at?: string
          data_recebimento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      fluxo_caixa: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          id: string
          origem_id: string | null
          origem_tipo: string | null
          saldo_acumulado: number | null
          tipo: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data: string
          descricao: string
          id?: string
          origem_id?: string | null
          origem_tipo?: string | null
          saldo_acumulado?: number | null
          tipo: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          origem_id?: string | null
          origem_tipo?: string | null
          saldo_acumulado?: number | null
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      leads: { // NEW TABLE FOR CRM LEADS
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          stage_id: string;
          value: number | null;
          source: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          stage_id: string;
          value?: number | null;
          source?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          stage_id?: string;
          value?: number | null;
          source?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
        ];
      };
      notas_fiscais: {
        Row: {
          chave_acesso: string | null
          cliente_cpf_cnpj: string
          cliente_nome: string
          created_at: string
          data_emissao: string | null
          id: string
          impostos: Json | null
          itens: Json
          mensagem_erro: string | null
          numero: string | null
          protocolo_sefaz: string | null
          serie: string | null
          status: string
          tipo: string
          updated_at: string
          valor_impostos: number | null
          valor_total: number
          xml_nfe: string | null
        }
        Insert: {
          chave_acesso?: string | null
          cliente_cpf_cnpj: string
          cliente_nome: string
          created_at?: string
          data_emissao?: string | null
          id?: string
          impostos?: Json | null
          itens: Json
          mensagem_erro?: string | null
          numero?: string | null
          protocolo_sefaz?: string | null
          serie?: string | null
          status?: string
          tipo: string
          updated_at?: string
          valor_impostos?: number | null
          valor_total: number
          xml_nfe?: string | null
        }
        Update: {
          chave_acesso?: string | null
          cliente_cpf_cnpj?: string
          cliente_nome?: string
          created_at?: string
          data_emissao?: string | null
          id?: string
          impostos?: Json | null
          itens?: Json
          mensagem_erro?: string | null
          numero?: string | null
          protocolo_sefaz?: string | null
          serie?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor_impostos?: number | null
          valor_total?: number
          xml_nfe?: string | null
        }
        Relationships: []
      }
      regras_fiscais: {
        Row: {
          aliquota: number
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          aliquota: number
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string
        }
        Update: {
          aliquota?: number
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      stages: { // NEW TABLE FOR CRM STAGES
        Row: {
          id: string;
          name: string;
          color: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      whatsapp_instances: { // UPDATED TABLE FOR EVOLUTION API
        Row: {
          id: string
          name: string
          phone: string
          status: string
          type: string; // 'evolution_api' | 'whatsapp_cloud'
          qr_code_data: string | null; // Base64 image or URL
          evolution_api_url: string | null;
          evolution_api_key: string | null;
          session_data: Json | null;
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          status?: string
          type?: string;
          qr_code_data?: string | null;
          evolution_api_url?: string | null;
          evolution_api_key?: string | null;
          session_data?: Json | null;
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          status?: string
          type?: string;
          qr_code_data?: string | null;
          evolution_api_url?: string | null;
          evolution_api_key?: string | null;
          session_data?: Json | null;
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const