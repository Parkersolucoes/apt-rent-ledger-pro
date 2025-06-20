
import { Label } from '@/components/ui/label';

interface CamposCalculadosProps {
  valorLocacao: string;
  taxaLimpeza: string;
  comissao: number;
  valorProprietario: number;
}

export const CamposCalculados = ({
  valorLocacao,
  taxaLimpeza,
  comissao,
  valorProprietario
}: CamposCalculadosProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Valores Calculados</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold">Comissão (20%)</Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
            R$ {comissao.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>

        <div>
          <Label className="font-semibold">Valor do Proprietário</Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            R$ {valorProprietario.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
