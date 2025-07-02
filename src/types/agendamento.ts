export interface Agendamento {
  id: string;
  nome: string;
  frequencia: 'diario' | 'semanal' | 'mensal';
  horario: string;
  numero_whatsapp: string;
  tipo_informacao: 'entradas_saidas' | 'proximas_entradas' | 'proximas_saidas' | 'relatorio_semanal';
  status: boolean;
  proximo_envio?: Date;
  configuracoes_extras?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface LogAgendamento {
  id: string;
  agendamento_id: string;
  data_envio: Date;
  sucesso: boolean;
  mensagem_enviada?: string;
  erro?: string;
  detalhes?: Record<string, any>;
  created_at: Date;
}

export interface FiltrosAgendamento {
  status?: boolean;
  frequencia?: string;
  tipo_informacao?: string;
}