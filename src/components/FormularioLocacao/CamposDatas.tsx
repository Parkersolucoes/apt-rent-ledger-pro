
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <Label htmlFor="dataEntrada" className="text-black font-semibold">Data de Entrada *</Label>
        <Input
          id="dataEntrada"
          type="date"
          value={dataEntrada}
          onChange={(e) => onDataEntradaChange(e.target.value)}
          className="border-gray-300 focus:border-blue-500 bg-white text-black"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="dataSaida" className="text-black font-semibold">Data de Saída *</Label>
        <Input
          id="dataSaida"
          type="date"
          value={dataSaida}
          onChange={(e) => onDataSaidaChange(e.target.value)}
          className="border-gray-300 focus:border-blue-500 bg-white text-black"
          required
        />
      </div>
    </div>
  );
};
