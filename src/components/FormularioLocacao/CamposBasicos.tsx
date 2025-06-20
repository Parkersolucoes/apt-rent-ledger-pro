
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampoTelefone } from './CampoTelefone';

interface CamposBasicosProps {
  apartamento: string;
  hospede: string;
  telefone: string;
  apartamentosDisponiveis: string[];
  onApartamentoChange: (value: string) => void;
  onHospedeChange: (value: string) => void;
  onTelefoneChange: (value: string) => void;
}

export const CamposBasicos = ({
  apartamento,
  hospede,
  telefone,
  apartamentosDisponiveis,
  onApartamentoChange,
  onHospedeChange,
  onTelefoneChange
}: CamposBasicosProps) => {
  return (
    <div className="space-y-6">
      {/* Seção Principal */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="apartamento" className="font-semibold text-gray-700">Apartamento *</Label>
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
            <Label htmlFor="hospede" className="font-semibold text-gray-700">Hóspede *</Label>
            <Input
              id="hospede"
              type="text"
              value={hospede}
              onChange={(e) => onHospedeChange(e.target.value)}
              placeholder="Nome do hóspede"
              required
            />
          </div>
        </div>
      </div>

      {/* Seção Contato */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contato</h3>
        <div className="grid grid-cols-1 gap-4">
          <CampoTelefone
            value={telefone}
            onChange={onTelefoneChange}
          />
        </div>
      </div>
    </div>
  );
};
