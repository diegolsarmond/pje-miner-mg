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
      fontes_jornais: {
        Row: {
          ativo: boolean | null
          created_at: string
          formato_data: string | null
          horario_coleta: string | null
          id: string
          metadados_config: Json | null
          nome: string
          periodicidade: string | null
          seletor_conteudo: string | null
          seletor_data: string | null
          seletor_titulo: string | null
          tribunal_id: string
          updated_at: string
          url_base: string
          url_pattern: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          formato_data?: string | null
          horario_coleta?: string | null
          id?: string
          metadados_config?: Json | null
          nome: string
          periodicidade?: string | null
          seletor_conteudo?: string | null
          seletor_data?: string | null
          seletor_titulo?: string | null
          tribunal_id: string
          updated_at?: string
          url_base: string
          url_pattern: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          formato_data?: string | null
          horario_coleta?: string | null
          id?: string
          metadados_config?: Json | null
          nome?: string
          periodicidade?: string | null
          seletor_conteudo?: string | null
          seletor_data?: string | null
          seletor_titulo?: string | null
          tribunal_id?: string
          updated_at?: string
          url_base?: string
          url_pattern?: string
        }
        Relationships: []
      }
      movimentacoes: {
        Row: {
          codigo_movimento: string | null
          created_at: string
          data_movimento: string | null
          descricao_movimento: string
          id: string
          observacoes: string | null
          ordem: number | null
          processo_id: string
        }
        Insert: {
          codigo_movimento?: string | null
          created_at?: string
          data_movimento?: string | null
          descricao_movimento: string
          id?: string
          observacoes?: string | null
          ordem?: number | null
          processo_id: string
        }
        Update: {
          codigo_movimento?: string | null
          created_at?: string
          data_movimento?: string | null
          descricao_movimento?: string
          id?: string
          observacoes?: string | null
          ordem?: number | null
          processo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      partes_publicas: {
        Row: {
          created_at: string
          id: string
          nome_anonimizado: string | null
          processo_id: string
          tipo_parte: string
          tipo_pessoa: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome_anonimizado?: string | null
          processo_id: string
          tipo_parte: string
          tipo_pessoa?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome_anonimizado?: string | null
          processo_id?: string
          tipo_parte?: string
          tipo_pessoa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partes_publicas_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          assunto: string | null
          classe_processual: string | null
          created_at: string
          data_distribuicao: string | null
          id: string
          metadados_raw: Json | null
          numero_processo: string
          origem_coleta: string
          segredo_justica: boolean | null
          situacao: string | null
          tribunal_id: string
          updated_at: string
          url_origem: string | null
          valor_causa: number | null
        }
        Insert: {
          assunto?: string | null
          classe_processual?: string | null
          created_at?: string
          data_distribuicao?: string | null
          id?: string
          metadados_raw?: Json | null
          numero_processo: string
          origem_coleta: string
          segredo_justica?: boolean | null
          situacao?: string | null
          tribunal_id: string
          updated_at?: string
          url_origem?: string | null
          valor_causa?: number | null
        }
        Update: {
          assunto?: string | null
          classe_processual?: string | null
          created_at?: string
          data_distribuicao?: string | null
          id?: string
          metadados_raw?: Json | null
          numero_processo?: string
          origem_coleta?: string
          segredo_justica?: boolean | null
          situacao?: string | null
          tribunal_id?: string
          updated_at?: string
          url_origem?: string | null
          valor_causa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_tribunal_id_fkey"
            columns: ["tribunal_id"]
            isOneToOne: false
            referencedRelation: "tribunais"
            referencedColumns: ["id"]
          },
        ]
      }
      publicacoes_jornais: {
        Row: {
          conteudo: string
          created_at: string
          data_publicacao: string
          fonte_jornal_id: string
          hash_conteudo: string | null
          id: string
          metadados_raw: Json | null
          numero_processo: string | null
          tipo_publicacao: string | null
          titulo: string
          url_origem: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_publicacao: string
          fonte_jornal_id: string
          hash_conteudo?: string | null
          id?: string
          metadados_raw?: Json | null
          numero_processo?: string | null
          tipo_publicacao?: string | null
          titulo: string
          url_origem?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_publicacao?: string
          fonte_jornal_id?: string
          hash_conteudo?: string | null
          id?: string
          metadados_raw?: Json | null
          numero_processo?: string | null
          tipo_publicacao?: string | null
          titulo?: string
          url_origem?: string | null
        }
        Relationships: []
      }
      scraping_logs: {
        Row: {
          created_at: string
          erro_detalhes: string | null
          id: string
          metodo: string
          processos_coletados: number | null
          status_code: number | null
          sucesso: boolean | null
          tempo_resposta_ms: number | null
          tribunal_id: string
          url_acessada: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          erro_detalhes?: string | null
          id?: string
          metodo?: string
          processos_coletados?: number | null
          status_code?: number | null
          sucesso?: boolean | null
          tempo_resposta_ms?: number | null
          tribunal_id: string
          url_acessada: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          erro_detalhes?: string | null
          id?: string
          metodo?: string
          processos_coletados?: number | null
          status_code?: number | null
          sucesso?: boolean | null
          tempo_resposta_ms?: number | null
          tribunal_id?: string
          url_acessada?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraping_logs_tribunal_id_fkey"
            columns: ["tribunal_id"]
            isOneToOne: false
            referencedRelation: "tribunais"
            referencedColumns: ["id"]
          },
        ]
      }
      tribunais: {
        Row: {
          api_disponivel: boolean | null
          ativo: boolean | null
          codigo: string
          created_at: string
          id: string
          nome: string
          tipo: string
          updated_at: string
          url_base: string
        }
        Insert: {
          api_disponivel?: boolean | null
          ativo?: boolean | null
          codigo: string
          created_at?: string
          id?: string
          nome: string
          tipo: string
          updated_at?: string
          url_base: string
        }
        Update: {
          api_disponivel?: boolean | null
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
          url_base?: string
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
