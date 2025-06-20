
import { CampoMoeda } from './CampoMoeda';

interface CamposValoresProps {
  valorLocacao: string;
  primeiroPagamento: string;
  segundoPagamento: string;
  taxaLimpeza: string;
  onValorLocacaoChange: (value: string) => void;
  onPrimeiroPagamentoChange: (value: string) => void;
}

export const CamposValores = ({
  valorLocacao,
  primeiroPagamento,
  segundoPagamento,
  taxaLimpeza,
  onValorLocacaoChange,
  onPrimeiroPagamentoChange
}: CamposValoresProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CampoMoeda
        id="valorLocacao"
        label="Valor da Locação"
        value={valorLocacao}
        onChange={onValorLocacaoChange}
        required
      />
      
      <CampoMoeda
        id="primeiroPagamento"
        label="1º Pagamento"
        value={primeiroPagamento}
        onChange={onPrimeiroPagamentoChange}
      />
      
      <CampoMoeda
        id="segundoPagamento"
        label="2º Pagamento (Calculado)"
        value={segundoPagamento}
        readOnly
      />
      
      <CampoMoeda
        id="taxaLimpeza"
        label="Taxa de Limpeza (Fixo)"
        value={taxaLimpeza}
        readOnly
      />
    </div>
  );
};
