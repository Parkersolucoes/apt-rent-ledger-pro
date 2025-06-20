import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface CamposPagamentoProps {
  proprietarioPago: boolean;
  dataPagamentoProprietario: string;
  onProprietarioPagoChange: (checked: boolean) => void;
  onDataPagamentoProprietarioChange: (value: string) => void;
}

export const CamposPagamento = ({
  proprietarioPago,
  dataPagamentoProprietario,
  onProprietarioPagoChange,
  onDataPagamentoProprietarioChange
}: CamposPagamentoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pagamento ao Proprietário</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="proprietarioPago"
          checked={proprietarioPago}
          onCheckedChange={onProprietarioPagoChange}
        />
        <Label htmlFor="proprietarioPago" className="font-semibold">
          Proprietário foi pago
        </Label>
      </div>

      {proprietarioPago && (
        <div>
          <Label htmlFor="dataPagamentoProprietario" className="font-semibold">
            Data do Pagamento ao Proprietário
          </Label>
          <Input
            id="dataPagamentoProprietario"
            type="date"
            value={dataPagamentoProprietario}
            onChange={(e) => onDataPagamentoProprietarioChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
