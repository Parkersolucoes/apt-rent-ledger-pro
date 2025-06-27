
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useDisponibilidade } from '@/hooks/useDisponibilidade';
import { useApartamentos } from '@/hooks/useApartamentos';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NovaReservaModalLocacao } from './NovaReservaModalLocacao';

export const MapaDisponibilidade = () => {
  const [mesAtual, setMesAtual] = useState(new Date());
  
  const { disponibilidades, isLoading } = useDisponibilidade();
  const { apartamentos } = useApartamentos();

  const diasDoMes = useMemo(() => {
    const inicio = startOfMonth(mesAtual);
    const fim = endOfMonth(mesAtual);
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual]);

  const apartamentosAtivos = apartamentos.filter(apt => apt.ativo);

  const getReservasDia = (apartamento: string, dia: Date) => {
    return disponibilidades.filter(disp => 
      disp.apartamento_numero === apartamento &&
      isWithinInterval(dia, {
        start: new Date(disp.data_inicio),
        end: new Date(disp.data_fim)
      })
    );
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'ocupado':
        return 'bg-red-300 text-red-800 border-red-400';
      case 'bloqueado':
        return 'bg-yellow-300 text-yellow-800 border-yellow-400';
      case 'manutencao':
        return 'bg-gray-400 text-gray-800 border-gray-500';
      default:
        return 'bg-green-400 text-green-800 border-green-500';
    }
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  };

  const getDiaSemana = (dia: Date) => {
    const dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    return dias[getDay(dia)];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando mapa de disponibilidade...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Mapa de Disponibilidade</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <NovaReservaModalLocacao />
        </div>
      </div>

      {/* Controles de navegação */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={mesAnterior}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[180px] text-center">
                {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="outline" size="sm" onClick={proximoMes}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge className="bg-green-400 text-green-800">Disponível</Badge>
              <Badge className="bg-red-300 text-red-800">Ocupado</Badge>
              <Badge className="bg-yellow-300 text-yellow-800">Bloqueado</Badge>
              <Badge className="bg-gray-400 text-gray-800">Manutenção</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-full">
            {/* Cabeçalho dos dias */}
            <div className="grid gap-0.5 mb-3" style={{ gridTemplateColumns: `100px repeat(${diasDoMes.length}, minmax(25px, 1fr))` }}>
              <div className="font-bold text-xs p-2 bg-gray-100 rounded text-center">
                Unidades
              </div>
              {diasDoMes.map((dia) => (
                <div key={dia.toISOString()} className="text-center text-xs p-1 bg-gray-50 rounded">
                  <div className="font-bold text-xs">{getDiaSemana(dia)}</div>
                  <div className="text-sm font-bold">{format(dia, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Linhas das unidades */}
            <div className="space-y-1">
              {apartamentosAtivos.map((apartamento) => (
                <div key={apartamento.id} className="grid gap-0.5 items-center" style={{ gridTemplateColumns: `100px repeat(${diasDoMes.length}, minmax(25px, 1fr))` }}>
                  <div className="font-medium text-xs p-2 bg-gray-50 rounded text-center h-8 flex items-center justify-center">
                    <div className="font-bold">Apto {apartamento.numero}</div>
                  </div>
                  {diasDoMes.map((dia) => {
                    const reservas = getReservasDia(apartamento.numero, dia);
                    const reserva = reservas[0]; // Primeira reserva do dia
                    
                    return (
                      <div
                        key={dia.toISOString()}
                        className="h-8 relative"
                      >
                        {reserva ? (
                          <div
                            className={cn(
                              'absolute inset-0 rounded border text-xs font-medium flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity',
                              getCorStatus(reserva.status)
                            )}
                            title={`${apartamento.numero} - ${format(dia, 'dd/MM')} - ${reserva.hospede || reserva.status}`}
                          >
                            <div className="text-center leading-tight overflow-hidden">
                              {reserva.hospede && (
                                <div className="truncate text-xs">
                                  {reserva.hospede.split(' ')[0].substring(0, 6)}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="absolute inset-0 border border-gray-200 rounded hover:bg-green-50 cursor-pointer transition-colors bg-green-100"
                            title={`${apartamento.numero} - ${format(dia, 'dd/MM')} - Disponível`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-green-600">
              {Math.round((disponibilidades.filter(d => d.status === 'disponivel').length / Math.max(disponibilidades.length, 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Taxa de Disponibilidade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-red-600">
              {disponibilidades.filter(d => d.status === 'ocupado').length}
            </div>
            <div className="text-xs text-gray-500">Reservas Ativas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-yellow-600">
              {disponibilidades.filter(d => d.status === 'bloqueado').length}
            </div>
            <div className="text-xs text-gray-500">Bloqueios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-gray-600">
              {Math.round((disponibilidades.filter(d => d.status === 'ocupado').length / Math.max(disponibilidades.length, 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Taxa de Ocupação</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
