
export interface ModeloMensagem {
  id: string;
  nome: string;
  titulo: string;
  conteudo: string;
  variaveis: string[];
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NovoModeloMensagem {
  nome: string;
  titulo: string;
  conteudo: string;
  variaveis: string[];
  ativo: boolean;
}

export interface VariaveisTemplate {
  nome_proprietario?: string;
  apartamento?: string;
  valor_total?: string;
  comissao_total?: string;
  limpeza_total?: string;
  valor_proprietario?: string;
  total_locacoes?: string;
  periodo?: string;
}
