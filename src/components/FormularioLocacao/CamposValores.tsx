
import { CampoMoeda } from './CampoMoeda';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Valores</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <CampoMoeda
            id="valorLocacao"
            label="Valor da Locação *"
            value={valorLocacao}
            onChange={onValorLocacaoChange}
            placeholder="0,00"
            required
          />
        </div>

        <div>
          <Label className="font-semibold">Taxa de Limpeza</Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
            R$ {taxaLimpeza}
          </div>
        </div>

        <div>
          <CampoMoeda
            id="primeiroPagamento"
            label="Primeiro Pagamento"
            value={primeiroPagamento}
            onChange={onPrimeiroPagamentoChange}
            placeholder="0,00"
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="primeiroPagamentoPago"
              checked={primeiroPagamentoPago}
              onCheckedChange={onPrimeiroPagamentoPagoChange}
            />
            <Label htmlFor="primeiroPagamentoPago" className="text-sm">
              Pagamento recebido
            </Label>
          </div>
        </div>

        <div>
          <Label className="font-semibold">Segundo Pagamento</Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
            R$ {segundoPagamento}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="segundoPagamentoPago"
              checked={segundoPagamentoPago}
              onCheckedChange={onSegundoPagamentoPagoChange}
            />
            <Label htmlFor="segundoPagamentoPago" className="text-sm">
              Pagamento recebido
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
