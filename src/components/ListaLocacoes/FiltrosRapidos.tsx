
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, House, User, Filter } from 'lucide-react';
import { FiltrosLocacao } from '@/types/locacao';

interface FiltrosRapidosProps {
  filtros: FiltrosLocacao;
  apartamentos: string[];
  anos: number[];
  onAplicarFiltroRapido: (tipo: 'apartamento' | 'ano' | 'mes', valor: string | number) => void;
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

export const FiltrosRapidos = ({ 
  filtros, 
  apartamentos, 
  anos, 
  onAplicarFiltroRapido 
}: FiltrosRapidosProps) => {
  return (
    <Card className="shadow-professional-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Filter className="h-6 w-6" />
          Filtros Rápidos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Botões de Apartamentos */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <House className="h-5 w-5 text-blue-600" />
            Apartamentos
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {apartamentos.map((apartamento) => (
              <Button
                key={apartamento}
                size="sm"
                variant={filtros.apartamento === apartamento ? "default" : "outline"}
                onClick={() => onAplicarFiltroRapido('apartamento', apartamento)}
                className="h-10 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <House className="h-4 w-4 mr-1" />
                {apartamento}
              </Button>
            ))}
          </div>
        </div>

        {/* Botões de Anos */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Anos
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {anos.map((ano) => (
              <Button
                key={ano}
                size="sm"
                variant={filtros.ano === ano ? "default" : "outline"}
                onClick={() => onAplicarFiltroRapido('ano', ano)}
                className="h-10 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Calendar className="h-4 w-4 mr-1" />
                {ano}
              </Button>
            ))}
          </div>
        </div>

        {/* Botões de Meses */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Meses
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {meses.map((mes) => (
              <Button
                key={mes.value}
                size="sm"
                variant={filtros.mes === mes.value ? "default" : "outline"}
                onClick={() => onAplicarFiltroRapido('mes', mes.value)}
                className="h-10 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Calendar className="h-4 w-4 mr-1" />
                {mes.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
