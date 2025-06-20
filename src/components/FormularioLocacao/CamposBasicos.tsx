
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CamposBasicosProps {
  apartamento: string;
  ano: number;
  mes: number;
  hospede: string;
  apartamentosDisponiveis: string[];
  onApartamentoChange: (value: string) => void;
  onAnoChange: (value: number) => void;
  onMesChange: (value: number) => void;
  onHospedeChange: (value: string) => void;
}

const meses = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

export const CamposBasicos = ({
  apartamento,
  ano,
  mes,
  hospede,
  apartamentosDisponiveis,
  onApartamentoChange,
  onAnoChange,
  onMesChange,
  onHospedeChange
}: CamposBasicosProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="apartamento" className="text-blue-800 font-semibold">Apartamento *</Label>
          <Select value={apartamento} onValueChange={onApartamentoChange}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500">
              <SelectValue placeholder="Selecione um apartamento" />
            </SelectTrigger>
            <SelectContent>
              {apartamentosDisponiveis.map((numero) => (
                <SelectItem key={numero} value={numero}>
                  {numero}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="ano" className="text-blue-800 font-semibold">Ano *</Label>
          <Input
            id="ano"
            type="number"
            value={ano}
            onChange={(e) => onAnoChange(parseInt(e.target.value))}
            min="2020"
            max="2030"
            className="border-blue-200 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="mes" className="text-blue-800 font-semibold">Mês *</Label>
          <Select value={mes.toString()} onValueChange={(value) => onMesChange(parseInt(value))}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mesItem) => (
                <SelectItem key={mesItem.value} value={mesItem.value.toString()}>
                  {mesItem.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="hospede" className="text-blue-800 font-semibold">Nome do Hóspede *</Label>
        <Input
          id="hospede"
          value={hospede}
          onChange={(e) => onHospedeChange(e.target.value)}
          placeholder="Nome completo do hóspede"
          className="border-blue-200 focus:border-blue-500"
          required
        />
      </div>
    </>
  );
};
