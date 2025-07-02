export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agendamentos: {
        Row: {
          configuracoes_extras: Json | null
          created_at: string
          frequencia: string
          horario: string
          id: string
          nome: string
          numero_whatsapp: string
          proximo_envio: string | null
          status: boolean
          tipo_informacao: string
          updated_at: string
        }
        Insert: {
          configuracoes_extras?: Json | null
          created_at?: string
          frequencia: string
          horario: string
          id?: string
          nome: string
          numero_whatsapp: string
          proximo_envio?: string | null
          status?: boolean
          tipo_informacao?: string
          updated_at?: string
        }
        Update: {
          configuracoes_extras?: Json | null
          created_at?: string
          frequencia?: string
          horario?: string
          id?: string
          nome?: string
          numero_whatsapp?: string
          proximo_envio?: string | null
          status?: boolean
          tipo_informacao?: string
          updated_at?: string
        }
        Relationships: []
      }
      apartamentos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          endereco: string | null
          id: string
          numero: string
          proprietario: string | null
          telefone_proprietario: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          numero: string
          proprietario?: string | null
          telefone_proprietario?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          numero?: string
          proprietario?: string | null
          telefone_proprietario?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes_sistema: {
        Row: {
          chave: string
          created_at: string
          id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          created_at?: string
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          created_at?: string
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          apartamento_numero: string | null
          conteudo: string
          created_at: string
          data_assinatura: string | null
          data_criacao: string
          data_vencimento: string | null
          id: string
          observacoes: string | null
          percentual_comissao: number | null
          proprietario_nome: string
          status: string
          titulo: string
          updated_at: string
          valor_mensal: number | null
          variaveis: Json | null
        }
        Insert: {
          apartamento_numero?: string | null
          conteudo: string
          created_at?: string
          data_assinatura?: string | null
          data_criacao?: string
          data_vencimento?: string | null
          id?: string
          observacoes?: string | null
          percentual_comissao?: number | null
          proprietario_nome: string
          status?: string
          titulo: string
          updated_at?: string
          valor_mensal?: number | null
          variaveis?: Json | null
        }
        Update: {
          apartamento_numero?: string | null
          conteudo?: string
          created_at?: string
          data_assinatura?: string | null
          data_criacao?: string
          data_vencimento?: string | null
          id?: string
          observacoes?: string | null
          percentual_comissao?: number | null
          proprietario_nome?: string
          status?: string
          titulo?: string
          updated_at?: string
          valor_mensal?: number | null
          variaveis?: Json | null
        }
        Relationships: []
      }
      despesas: {
        Row: {
          apartamento: string
          created_at: string
          data: string
          descricao: string
          id: string
          updated_at: string
          valor: number
        }
        Insert: {
          apartamento: string
          created_at?: string
          data: string
          descricao: string
          id?: string
          updated_at?: string
          valor: number
        }
        Update: {
          apartamento?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      disponibilidade: {
        Row: {
          apartamento_numero: string
          created_at: string
          data_fim: string
          data_inicio: string
          hospede: string | null
          id: string
          observacoes: string | null
          status: string
          updated_at: string
          valor_diaria: number | null
        }
        Insert: {
          apartamento_numero: string
          created_at?: string
          data_fim: string
          data_inicio: string
          hospede?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_diaria?: number | null
        }
        Update: {
          apartamento_numero?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          hospede?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_diaria?: number | null
        }
        Relationships: []
      }
      empresa: {
        Row: {
          ativo: boolean
          cargo_responsavel: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          responsavel: string | null
          site: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo_responsavel?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          responsavel?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo_responsavel?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      locacoes: {
        Row: {
          ano: number | null
          apartamento: string
          comissao: number
          created_at: string
          data_entrada: string
          data_pagamento_proprietario: string | null
          data_saida: string
          hospede: string
          id: string
          mes: number | null
          observacoes: string | null
          primeiro_pagamento: number
          primeiro_pagamento_forma: string | null
          primeiro_pagamento_pago: boolean | null
          segundo_pagamento: number
          segundo_pagamento_forma: string | null
          segundo_pagamento_pago: boolean | null
          taxa_limpeza: number
          telefone: string | null
          valor_faltando: number
          valor_locacao: number
          valor_proprietario: number | null
        }
        Insert: {
          ano?: number | null
          apartamento: string
          comissao?: number
          created_at?: string
          data_entrada: string
          data_pagamento_proprietario?: string | null
          data_saida: string
          hospede: string
          id?: string
          mes?: number | null
          observacoes?: string | null
          primeiro_pagamento?: number
          primeiro_pagamento_forma?: string | null
          primeiro_pagamento_pago?: boolean | null
          segundo_pagamento?: number
          segundo_pagamento_forma?: string | null
          segundo_pagamento_pago?: boolean | null
          taxa_limpeza?: number
          telefone?: string | null
          valor_faltando?: number
          valor_locacao: number
          valor_proprietario?: number | null
        }
        Update: {
          ano?: number | null
          apartamento?: string
          comissao?: number
          created_at?: string
          data_entrada?: string
          data_pagamento_proprietario?: string | null
          data_saida?: string
          hospede?: string
          id?: string
          mes?: number | null
          observacoes?: string | null
          primeiro_pagamento?: number
          primeiro_pagamento_forma?: string | null
          primeiro_pagamento_pago?: boolean | null
          segundo_pagamento?: number
          segundo_pagamento_forma?: string | null
          segundo_pagamento_pago?: boolean | null
          taxa_limpeza?: number
          telefone?: string | null
          valor_faltando?: number
          valor_locacao?: number
          valor_proprietario?: number | null
        }
        Relationships: []
      }
      logs_agendamentos: {
        Row: {
          agendamento_id: string
          created_at: string
          data_envio: string
          detalhes: Json | null
          erro: string | null
          id: string
          mensagem_enviada: string | null
          sucesso: boolean
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          data_envio?: string
          detalhes?: Json | null
          erro?: string | null
          id?: string
          mensagem_enviada?: string | null
          sucesso: boolean
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          data_envio?: string
          detalhes?: Json | null
          erro?: string | null
          id?: string
          mensagem_enviada?: string | null
          sucesso?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "logs_agendamentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_mensagem: {
        Row: {
          ativo: boolean
          conteudo: string
          created_at: string
          id: string
          nome: string
          titulo: string
          updated_at: string
          variaveis: string[] | null
        }
        Insert: {
          ativo?: boolean
          conteudo: string
          created_at?: string
          id?: string
          nome: string
          titulo: string
          updated_at?: string
          variaveis?: string[] | null
        }
        Update: {
          ativo?: boolean
          conteudo?: string
          created_at?: string
          id?: string
          nome?: string
          titulo?: string
          updated_at?: string
          variaveis?: string[] | null
        }
        Relationships: []
      }
      templates_contrato: {
        Row: {
          ativo: boolean
          conteudo: string
          created_at: string
          id: string
          nome: string
          titulo: string
          updated_at: string
          variaveis: string[] | null
        }
        Insert: {
          ativo?: boolean
          conteudo: string
          created_at?: string
          id?: string
          nome: string
          titulo: string
          updated_at?: string
          variaveis?: string[] | null
        }
        Update: {
          ativo?: boolean
          conteudo?: string
          created_at?: string
          id?: string
          nome?: string
          titulo?: string
          updated_at?: string
          variaveis?: string[] | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
