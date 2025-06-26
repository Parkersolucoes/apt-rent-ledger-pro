
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
        return 'bg-blue-500 text-white';
      case 'bloqueado':
        return 'bg-yellow-400 text-black';
      case 'manutencao':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1));
  };

  const getDiaSemana = (dia: Date) => {
    const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return dias[getDay(dia)];
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
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        </div>
      </div>

      {/* Controles de navegação */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={mesAnterior}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="outline" size="icon" onClick={proximoMes}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">Ocupado</Badge>
              <Badge className="bg-yellow-400 text-black">Bloqueado</Badge>
              <Badge className="bg-gray-500">Manutenção</Badge>
              <Badge className="bg-green-500">Disponível</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-full">
            {/* Cabeçalho dos dias */}
            <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `120px repeat(${diasDoMes.length}, 80px)` }}>
              <div className="font-bold text-sm p-2 bg-gray-100 rounded flex items-center">
                UHs / Mês
              </div>
              {diasDoMes.map((dia) => (
                <div key={dia.toISOString()} className="text-center text-xs p-2 bg-gray-50 rounded">
                  <div className="font-bold">{getDiaSemana(dia)}</div>
                  <div className="text-lg font-bold">{format(dia, 'd')}</div>
                  <div className="text-xs text-gray-500">{format(dia, 'MMM', { locale: ptBR }).toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Linhas das unidades */}
            <div className="space-y-2">
              {apartamentosAtivos.map((apartamento) => (
                <div key={apartamento.id} className="grid gap-1 items-center" style={{ gridTemplateColumns: `120px repeat(${diasDoMes.length}, 80px)` }}>
                  <div className="font-medium text-sm p-2 bg-gray-50 rounded flex items-center h-12">
                    <div>
                      <div className="font-bold">Apto {apartamento.numero}</div>
                      <div className="text-xs text-gray-500">STANDARD</div>
                    </div>
                  </div>
                  {diasDoMes.map((dia) => {
                    const reservas = getReservasDia(apartamento.numero, dia);
                    const reserva = reservas[0]; // Primeira reserva do dia
                    
                    return (
                      <div
                        key={dia.toISOString()}
                        className="h-12 relative"
                      >
                        {reserva ? (
                          <div
                            className={cn(
                              'absolute inset-0 rounded px-2 py-1 text-xs font-medium flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-opacity',
                              getCorStatus(reserva.status)
                            )}
                            title={`${apartamento.numero} - ${format(dia, 'dd/MM')} - ${reserva.hospede || reserva.status}`}
                          >
                            {reserva.hospede && (
                              <div className="truncate w-full text-center leading-tight">
                                {reserva.hospede.split(' ')[0]}
                              </div>
                            )}
                            {reserva.valor_diaria && (
                              <div className="text-xs opacity-90">
                                R$ {reserva.valor_diaria.toFixed(0)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="absolute inset-0 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((disponibilidades.filter(d => d.status === 'disponivel').length / Math.max(disponibilidades.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Taxa de Disponibilidade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {disponibilidades.filter(d => d.status === 'ocupado').length}
            </div>
            <div className="text-sm text-gray-500">Reservas Ativas</div>
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
              {Math.round((disponibilidades.filter(d => d.status === 'ocupado').length / Math.max(disponibilidades.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Taxa de Ocupação</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
