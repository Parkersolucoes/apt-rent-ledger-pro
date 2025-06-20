
import { CampoMoeda } from './CampoMoeda';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Flag } from 'lucide-react';

interface CamposValoresProps {
  valorLocacao: string;
  primeiroPagamento: string;
  primeiroPagamentoPago: boolean;
  segundoPagamento: string;
  segundoPagamentoPago: boolean;
  taxaLimpeza: string;
  onValorLocacaoChange: (value: string) => void;
  onPrimeiroPagamentoChange: (value: string) => void;
  onPrimeiroPagamentoPagoChange: (checked: boolean) => void;
  onSegundoPagamentoPagoChange: (checked: boolean) => void;
}

export const CamposValores = ({
  valorLocacao,
  primeiroPagamento,
  primeiroPagamentoPago,
  segundoPagamento,
  segundoPagamentoPago,
  taxaLimpeza,
  onValorLocacaoChange,
  onPrimeiroPagamentoChange,
  onPrimeiroPagamentoPagoChange,
  onSegundoPagamentoPagoChange
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
      
      <div className="space-y-2">
        <CampoMoeda
          id="primeiroPagamento"
          label="1º Pagamento"
          value={primeiroPagamento}
          onChange={onPrimeiroPagamentoChange}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="primeiroPagamentoPago"
            checked={primeiroPagamentoPago}
            onCheckedChange={onPrimeiroPagamentoPagoChange}
            className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <Label htmlFor="primeiroPagamentoPago" className="text-sm text-black font-medium flex items-center gap-1">
            <Flag className="h-3 w-3" />
            PAGO
          </Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <CampoMoeda
          id="segundoPagamento"
          label="2º Pagamento (Calculado)"
          value={segundoPagamento}
          readOnly
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="segundoPagamentoPago"
            checked={segundoPagamentoPago}
            onCheckedChange={onSegundoPagamentoPagoChange}
            className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <Label htmlFor="segundoPagamentoPago" className="text-sm text-black font-medium flex items-center gap-1">
            <Flag className="h-3 w-3" />
            PAGO
          </Label>
        </div>
      </div>
      
      <CampoMoeda
        id="taxaLimpeza"
        label="Taxa de Limpeza (Fixo)"
        value={taxaLimpeza}
        readOnly
      />
    </div>
  );
};
