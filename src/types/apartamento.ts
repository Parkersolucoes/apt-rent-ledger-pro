
export interface Apartamento {
  id: string;
  numero: string;
  descricao?: string;
  endereco?: string;
  proprietario?: string;
  telefoneProprietario?: string;
  cpfProprietario?: string;
  dataNascimentoProprietario?: string;
  enderecoProprietario?: string;
  emailProprietario?: string;
  rgProprietario?: string;
  orgaoExpeditorProprietario?: string;
  nacionalidadeProprietario?: string;
  estadoCivilProprietario?: string;
  profissaoProprietario?: string;
  bancoProprietario?: string;
  agenciaProprietario?: string;
  contaProprietario?: string;
  pixProprietario?: string;
  tipoContaProprietario?: string;
  titularContaProprietario?: string;
  cpfTitularProprietario?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiltrosApartamento {
  ativo?: boolean;
  proprietario?: string;
}
