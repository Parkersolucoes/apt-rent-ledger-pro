
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMemo } from 'react';
import { useValidacaoDisponibilidade } from '@/hooks/useValidacaoDisponibilidade';
import { AlertTriangle } from 'lucide-react';

interface CamposDatasProps {
  dataEntrada: string;
  dataSaida: string;
  apartamento: string;
  onDataEntradaChange: (value: string) => void;
  onDataSaidaChange: (value: string) => void;
}

export const CamposDatas = ({
  dataEntrada,
  dataSaida,
  apartamento,
  onDataEntradaChange,
  onDataSaidaChange
}: CamposDatasProps) => {
  const { validarDisponibilidade } = useValidacaoDisponibilidade();

  const { diarias, isDataSaidaInvalida, validacaoDisponibilidade } = useMemo(() => {
    if (!dataEntrada || !dataSaida) {
      return { diarias: 0, isDataSaidaInvalida: false, validacaoDisponibilidade: { isValido: true, mensagemErro: null } };
    }

    const entrada = new Date(dataEntrada);
    const saida = new Date(dataSaida);
    
    const diffTime = saida.getTime() - entrada.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isDataSaidaInvalida = diffDays < 0;
    
    // Validar disponibilidade apenas se as datas são válidas e o apartamento foi selecionado
    let validacaoDisponibilidade = { isValido: true, mensagemErro: null };
    if (!isDataSaidaInvalida && apartamento && diffDays >= 0) {
      validacaoDisponibilidade = validarDisponibilidade(apartamento, entrada, saida);
    }

    return {
      diarias: diffDays,
      isDataSaidaInvalida,
      validacaoDisponibilidade
    };
  }, [dataEntrada, dataSaida, apartamento, validarDisponibilidade]);

  return (
    <div className="space-y-4">
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
            className={isDataSaidaInvalida || !validacaoDisponibilidade.isValido ? 'border-red-500' : ''}
            required
          />
          {isDataSaidaInvalida && (
            <p className="text-red-500 text-sm mt-1">
              A data de saída não pode ser anterior à data de entrada
            </p>
          )}
        </div>
      </div>

      {!validacaoDisponibilidade.isValido && validacaoDisponibilidade.mensagemErro && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {validacaoDisponibilidade.mensagemErro}
          </AlertDescription>
        </Alert>
      )}

      {dataEntrada && dataSaida && !isDataSaidaInvalida && diarias > 0 && validacaoDisponibilidade.isValido && (
        <div className="flex justify-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <Label className="text-blue-700 font-semibold text-lg">
              {diarias} Diária{diarias !== 1 ? 's' : ''}
            </Label>
          </div>
        </div>
      )}
    </div>
  );
};
