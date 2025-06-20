
export interface Locacao {
  id: string;
  apartamento: string;
  ano: number;
  mes: number;
  hospede: string;
  dataEntrada: Date;
  dataSaida: Date;
  valorLocacao: number;
  primeiroPagamento: number;
  primeiroPagamentoPago: boolean;
  primeiroPagamentoForma: string;
  segundoPagamento: number;
  segundoPagamentoPago: boolean;
  segundoPagamentoForma: string;
  valorFaltando: number;
  taxaLimpeza: number;
  comissao: number; // 20% do total
  valorProprietario: number; // valor total - taxa limpeza - comissão
  dataPagamentoProprietario?: Date;
  observacoes?: string;
  createdAt: Date;
}

export interface FiltrosLocacao {
  apartamento?: string;
  ano?: number;
  mes?: number;
  proprietarioPago?: boolean | 'todos';
}
