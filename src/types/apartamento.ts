
export interface Apartamento {
  id: string;
  numero: string;
  descricao?: string;
  endereco?: string;
  proprietario?: string;
  telefoneProprietario?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiltrosApartamento {
  ativo?: boolean;
  proprietario?: string;
}
