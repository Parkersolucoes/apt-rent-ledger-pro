import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FiltrosLocacao as FiltrosLocacaoType } from '@/types/locacao';
interface FiltrosLocacaoProps {
  filtros: FiltrosLocacaoType;
  setFiltros: (filtros: FiltrosLocacaoType) => void;
  apartamentos: string[];
  anos: number[];
  onLimparFiltros: () => void;
}
const meses = [{
  value: 1,
  label: 'Janeiro'
}, {
  value: 2,
  label: 'Fevereiro'
}, {
  value: 3,
  label: 'Março'
}, {
  value: 4,
  label: 'Abril'
}, {
  value: 5,
  label: 'Maio'
}, {
  value: 6,
  label: 'Junho'
}, {
  value: 7,
  label: 'Julho'
}, {
  value: 8,
  label: 'Agosto'
}, {
  value: 9,
  label: 'Setembro'
}, {
  value: 10,
  label: 'Outubro'
}, {
  value: 11,
  label: 'Novembro'
}, {
  value: 12,
  label: 'Dezembro'
}];
export const FiltrosLocacao = ({
  filtros,
  setFiltros,
  apartamentos,
  anos,
  onLimparFiltros
}: FiltrosLocacaoProps) => {
  return <Card className="shadow-professional-lg">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl text-slate-50">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="filtroApartamento" className="text-foreground font-medium">Apartamento</Label>
            <Select value={filtros.apartamento || 'todos'} onValueChange={value => setFiltros({
            ...filtros,
            apartamento: value === 'todos' ? undefined : value
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {apartamentos.map(apt => <SelectItem key={apt} value={apt}>{apt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="filtroAno" className="text-foreground font-medium">Ano</Label>
            <Select value={filtros.ano?.toString() || 'todos'} onValueChange={value => setFiltros({
            ...filtros,
            ano: value === 'todos' ? undefined : parseInt(value)
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {anos.map(ano => <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="filtroMes" className="text-foreground font-medium">Mês</Label>
            <Select value={filtros.mes?.toString() || 'todos'} onValueChange={value => setFiltros({
            ...filtros,
            mes: value === 'todos' ? undefined : parseInt(value)
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {meses.map(mes => <SelectItem key={mes.value} value={mes.value.toString()}>{mes.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filtroProprietarioPago" className="text-foreground font-medium">Proprietário Pago</Label>
            <Select value={filtros.proprietarioPago === undefined ? 'todos' : filtros.proprietarioPago.toString()} onValueChange={value => setFiltros({
            ...filtros,
            proprietarioPago: value === 'todos' ? undefined : value === 'true'
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={onLimparFiltros} variant="outline" className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
};