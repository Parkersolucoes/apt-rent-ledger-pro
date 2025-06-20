
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiltrosLocacao } from '@/types/locacao';

interface FiltrosRelatorioProps {
  filtros: FiltrosLocacao;
  onFiltrosChange: (filtros: FiltrosLocacao) => void;
  apartamentosDisponiveis: string[];
  anos: (number | undefined)[];
}

const meses = [
  { valor: 1, nome: 'Janeiro' },
  { valor: 2, nome: 'Fevereiro' },
  { valor: 3, nome: 'Março' },
  { valor: 4, nome: 'Abril' },
  { valor: 5, nome: 'Maio' },
  { valor: 6, nome: 'Junho' },
  { valor: 7, nome: 'Julho' },
  { valor: 8, nome: 'Agosto' },
  { valor: 9, nome: 'Setembro' },
  { valor: 10, nome: 'Outubro' },
  { valor: 11, nome: 'Novembro' },
  { valor: 12, nome: 'Dezembro' }
];

export const FiltrosRelatorio = ({
  filtros,
  onFiltrosChange,
  apartamentosDisponiveis,
  anos
}: FiltrosRelatorioProps) => {
  const handleFiltroChange = (key: keyof FiltrosLocacao, value: string | number | undefined) => {
    onFiltrosChange({ ...filtros, [key]: value });
  };

  const limparFiltros = () => {
    onFiltrosChange({});
  };

  return (
    <Card className="shadow-professional-lg">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl">Filtros do Relatório</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="apartamento">Apartamento</Label>
            <Select 
              value={filtros.apartamento || 'todos'} 
              onValueChange={(value) => handleFiltroChange('apartamento', value === 'todos' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {apartamentosDisponiveis.map((apt) => (
                  <SelectItem key={apt} value={apt}>Apartamento {apt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ano">Ano</Label>
            <Select 
              value={filtros.ano?.toString() || 'todos'} 
              onValueChange={(value) => handleFiltroChange('ano', value === 'todos' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano?.toString() || ''}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mes">Mês</Label>
            <Select 
              value={filtros.mes?.toString() || 'todos'} 
              onValueChange={(value) => handleFiltroChange('mes', value === 'todos' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {meses.map((mes) => (
                  <SelectItem key={mes.valor} value={mes.valor.toString()}>{mes.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={limparFiltros}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
