
export interface Despesa {
  id: string;
  apartamento: string;
  valor: number;
  descricao: string;
  data: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiltrosDespesa {
  apartamento?: string;
  dataInicio?: Date;
  dataFim?: Date;
}
