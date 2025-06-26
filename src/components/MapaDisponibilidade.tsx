
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Filter, Eye } from 'lucide-react';
import { useDisponibilidade } from '@/hooks/useDisponibilidade';
import { useApartamentos } from '@/hooks/useApartamentos';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const MapaDisponibilidade = () => {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [apartamentoSelecionado, setApartamentoSelecionado] = useState<string>('');
  
  const { disponibilidades, isLoading } = useDisponibilidade();
  const { apartamentos } = useApartamentos();

  const diasDoMes = useMemo(() => {
    const inicio = startOfMonth(mesAtual);
    const fim = endOfMonth(mesAtual);
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual]);

  const apartamentosAtivos = apartamentos.filter(apt => apt.ativo);

  const getStatusDia = (apartamento: string, dia: Date) => {
    const disponibilidade = disponibilidades.find(disp => 
      disp.apartamento_numero === apartamento &&
      isWithinInterval(dia, {
        start: new Date(disp.data_inicio),
        end: new Date(disp.data_fim)
      })
    );
    
    return disponibilidade?.status || 'disponivel';
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'ocupado':
        return 'bg-red-500 hover:bg-red-600';
      case 'bloqueado':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'manutencao':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-green-500 hover:bg-green-600';
    }
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando mapa de disponibilidade...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Mapa de Disponibilidade</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Controles de navegação */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={mesAnterior}>
                ←
              </Button>
              <h2 className="text-xl font-semibold">
                {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="outline" onClick={proximoMes}>
                →
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Disponível</Badge>
              <Badge className="bg-red-500">Ocupado</Badge>
              <Badge className="bg-yellow-500">Bloqueado</Badge>
              <Badge className="bg-gray-500">Manutenção</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-32 gap-1 mb-4">
            <div className="font-medium text-sm p-2">Unidade</div>
            {diasDoMes.map((dia) => (
              <div key={dia.toISOString()} className="text-center text-xs p-1 font-medium">
                {format(dia, 'd')}
              </div>
            ))}
          </div>

          {/* Linhas das unidades */}
          <div className="space-y-1">
            {apartamentosAtivos.map((apartamento) => (
              <div key={apartamento.id} className="grid grid-cols-32 gap-1 items-center">
                <div className="font-medium text-sm p-2 bg-gray-50 rounded">
                  {apartamento.numero}
                </div>
                {diasDoMes.map((dia) => {
                  const status = getStatusDia(apartamento.numero, dia);
                  return (
                    <div
                      key={dia.toISOString()}
                      className={cn(
                        'h-8 rounded cursor-pointer transition-colors',
                        getCorStatus(status)
                      )}
                      title={`${apartamento.numero} - ${format(dia, 'dd/MM')} - ${status}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo do mês */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {disponibilidades.filter(d => d.status === 'disponivel').length}
            </div>
            <div className="text-sm text-gray-500">Períodos Disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {disponibilidades.filter(d => d.status === 'ocupado').length}
            </div>
            <div className="text-sm text-gray-500">Ocupações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {disponibilidades.filter(d => d.status === 'bloqueado').length}
            </div>
            <div className="text-sm text-gray-500">Bloqueios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {disponibilidades.filter(d => d.status === 'manutencao').length}
            </div>
            <div className="text-sm text-gray-500">Manutenção</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
