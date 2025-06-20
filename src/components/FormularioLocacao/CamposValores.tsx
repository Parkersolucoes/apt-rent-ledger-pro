
import { CampoMoeda } from './CampoMoeda';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CamposValoresProps {
  valorLocacao: string;
  primeiroPagamento: string;
  primeiroPagamentoPago: boolean;
  primeiroPagamentoForma: string;
  segundoPagamento: string;
  segundoPagamentoPago: boolean;
  segundoPagamentoForma: string;
  taxaLimpeza: string;
  onValorLocacaoChange: (value: string) => void;
  onPrimeiroPagamentoChange: (value: string) => void;
  onPrimeiroPagamentoPagoChange: (checked: boolean) => void;
  onPrimeiroPagamentoFormaChange: (value: string) => void;
  onSegundoPagamentoPagoChange: (checked: boolean) => void;
  onSegundoPagamentoFormaChange: (value: string) => void;
}

const formasPagamento = ['Dinheiro', 'Cartão', 'Pix', 'Outros'];

export const CamposValores = ({
  valorLocacao,
  primeiroPagamento,
  primeiroPagamentoPago,
  primeiroPagamentoForma,
  segundoPagamento,
  segundoPagamentoPago,
  segundoPagamentoForma,
  taxaLimpeza,
  onValorLocacaoChange,
  onPrimeiroPagamentoChange,
  onPrimeiroPagamentoPagoChange,
  onPrimeiroPagamentoFormaChange,
  onSegundoPagamentoPagoChange,
  onSegundoPagamentoFormaChange
}: CamposValoresProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Valores</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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
            <Select value={primeiroPagamentoForma} onValueChange={onPrimeiroPagamentoFormaChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma} value={forma}>
                    {forma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={segundoPagamentoForma} onValueChange={onSegundoPagamentoFormaChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma} value={forma}>
                    {forma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
