
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
  segundoPagamento: number;
  valorFaltando: number;
  taxaLimpeza: number;
  comissao: number; // 20% do total
  dataPagamentoProprietario?: Date;
  observacoes?: string;
  createdAt: Date;
}

export interface FiltrosLocacao {
  apartamento?: string;
  ano?: number;
  mes?: number;
}
