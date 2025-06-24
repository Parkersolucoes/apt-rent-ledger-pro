
export interface Contrato {
  id: string;
  titulo: string;
  conteudo: string;
  proprietario_nome: string;
  apartamento_numero?: string;
  data_criacao: string;
  data_assinatura?: string;
  data_vencimento?: string;
  status: 'rascunho' | 'enviado' | 'assinado' | 'vencido' | 'cancelado';
  percentual_comissao?: number;
  valor_mensal?: number;
  variaveis?: Record<string, string>;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateContrato {
  id: string;
  nome: string;
  titulo: string;
  conteudo: string;
  variaveis?: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
