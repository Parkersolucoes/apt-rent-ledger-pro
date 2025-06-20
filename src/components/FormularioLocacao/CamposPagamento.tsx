
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="proprietarioPago"
          checked={proprietarioPago}
          onCheckedChange={(checked) => onProprietarioPagoChange(!!checked)}
          className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <Label htmlFor="proprietarioPago" className="text-slate-200 font-semibold">
          Proprietário Pago
        </Label>
      </div>

      <div>
        <Label htmlFor="dataPagamentoProprietario" className="text-slate-200 font-semibold">Data de Pagamento ao Proprietário</Label>
        <Input
          id="dataPagamentoProprietario"
          type="date"
          value={dataPagamentoProprietario}
          onChange={(e) => onDataPagamentoProprietarioChange(e.target.value)}
          className="border-slate-600 focus:border-blue-500 bg-slate-700 text-slate-200"
        />
      </div>
    </div>
  );
};
