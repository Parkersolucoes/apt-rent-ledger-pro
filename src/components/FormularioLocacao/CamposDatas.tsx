import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CamposDatasProps {
  dataEntrada: string;
  dataSaida: string;
  onDataEntradaChange: (value: string) => void;
  onDataSaidaChange: (value: string) => void;
}

export const CamposDatas = ({
  dataEntrada,
  dataSaida,
  onDataEntradaChange,
  onDataSaidaChange
}: CamposDatasProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="dataEntrada" className="font-semibold">Data de Entrada *</Label>
        <Input
          id="dataEntrada"
          type="date"
          value={dataEntrada}
          onChange={(e) => onDataEntradaChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="dataSaida" className="font-semibold">Data de Saída *</Label>
        <Input
          id="dataSaida"
          type="date"
          value={dataSaida}
          onChange={(e) => onDataSaidaChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};
