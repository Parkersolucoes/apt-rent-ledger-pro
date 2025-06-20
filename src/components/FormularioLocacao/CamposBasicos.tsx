import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="apartamento" className="font-semibold">Apartamento *</Label>
        <Select value={apartamento} onValueChange={onApartamentoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o apartamento" />
          </SelectTrigger>
          <SelectContent>
            {apartamentosDisponiveis.map((numero) => (
              <SelectItem key={numero} value={numero}>
                Apartamento {numero}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="hospede" className="font-semibold">Hóspede *</Label>
        <Input
          id="hospede"
          type="text"
          value={hospede}
          onChange={(e) => onHospedeChange(e.target.value)}
          placeholder="Nome do hóspede"
          required
        />
      </div>

      <div>
        <Label htmlFor="ano" className="font-semibold">Ano</Label>
        <Input
          id="ano"
          type="number"
          value={ano}
          onChange={(e) => onAnoChange(parseInt(e.target.value))}
          placeholder="Ano"
          min="2020"
          max="2030"
        />
      </div>

      <div>
        <Label htmlFor="mes" className="font-semibold">Mês</Label>
        <Select value={mes.toString()} onValueChange={(value) => onMesChange(parseInt(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
