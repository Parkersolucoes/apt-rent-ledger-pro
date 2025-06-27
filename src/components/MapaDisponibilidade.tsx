import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useDisponibilidade } from '@/hooks/useDisponibilidade';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useLocacoes } from '@/hooks/useLocacoes';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NovaReservaModalLocacao } from './NovaReservaModalLocacao';

export const MapaDisponibilidade = () => {
  const [mesAtual, setMesAtual] = useState(new Date());
  
  const { disponibilidades, isLoading } = useDisponibilidade();
  const { apartamentos } = useApartamentos();
  const { locacoes } = useLocacoes();

  const diasDoMes = useMemo(() => {
    const inicio = startOfMonth(mesAtual);
    const fim = endOfMonth(mesAtual);
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual]);

  const apartamentosAtivos = apartamentos.filter(apt => apt.ativo);

  const getStatusDia = (apartamento: string, dia: Date) => {
    // Primeiro, verifica se há uma reserva de disponibilidade específica
    const reservaDisponibilidade = disponibilidades.find(disp => 
      disp.apartamento_numero === apartamento &&
      isWithinInterval(dia, {
        start: new Date(disp.data_inicio),
        end: new Date(disp.data_fim)
      })
    );

    if (reservaDisponibilidade) {
      return {
        status: reservaDisponibilidade.status,
        hospede: reservaDisponibilidade.hospede,
        origem: 'disponibilidade'
      };
    }

    // Se não há reserva de disponibilidade, verifica as locações
    const locacao = locacoes.find(loc => 
      loc.apartamento === apartamento &&
      isWithinInterval(dia, {
        start: new Date(loc.dataEntrada),
        end: new Date(loc.dataSaida)
      })
    );

    if (locacao) {
      return {
        status: 'ocupado',
        hospede: locacao.hospede,
        origem: 'locacao'
      };
    }

    // Se não há nem reserva nem locação, está disponível
    return {
      status: 'disponivel',
      hospede: null,
      origem: 'livre'
    };
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'ocupado':
        return 'bg-red-200 text-red-800 border-red-300';
      case 'bloqueado':
        return 'bg-yellow-200 text-yellow-800 border-yellow-300';
      case 'manutencao':
        return 'bg-gray-300 text-gray-800 border-gray-400';
      default:
        return 'bg-green-200 text-green-800 border-green-300';
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

  // Calcular estatísticas baseadas nas locações e disponibilidades
  const totalDiasDoMes = diasDoMes.length * apartamentosAtivos.length;
  const diasOcupados = diasDoMes.reduce((total, dia) => {
    return total + apartamentosAtivos.filter(apt => {
      const statusDia = getStatusDia(apt.numero, dia);
      return statusDia.status === 'ocupado';
    }).length;
  }, 0);

  const diasBloqueados = diasDoMes.reduce((total, dia) => {
    return total + apartamentosAtivos.filter(apt => {
      const statusDia = getStatusDia(apt.numero, dia);
      return statusDia.status === 'bloqueado';
    }).length;
  }, 0);

  return (
    <div className="container mx-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold">Mapa de Disponibilidade</h1>
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
        <CardHeader className="pb-2">
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
              <Badge className="bg-green-200 text-green-800">Disponível</Badge>
              <Badge className="bg-red-200 text-red-800">Ocupado</Badge>
              <Badge className="bg-yellow-200 text-yellow-800">Bloqueado</Badge>
              <Badge className="bg-gray-300 text-gray-800">Manutenção</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-full">
            {/* Cabeçalho dos dias */}
            <div className="grid gap-px mb-2" style={{ gridTemplateColumns: `80px repeat(${diasDoMes.length}, minmax(20px, 1fr))` }}>
              <div className="font-bold text-xs p-1 bg-gray-100 rounded text-center">
                Unidades
              </div>
              {diasDoMes.map((dia) => (
                <div key={dia.toISOString()} className="text-center text-xs p-1 bg-gray-50 rounded">
                  <div className="font-bold text-xs">{getDiaSemana(dia)}</div>
                  <div className="text-xs font-bold">{format(dia, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Linhas das unidades */}
            <div className="space-y-px">
              {apartamentosAtivos.map((apartamento) => (
                <div key={apartamento.id} className="grid gap-px items-center" style={{ gridTemplateColumns: `80px repeat(${diasDoMes.length}, minmax(20px, 1fr))` }}>
                  <div className="font-medium text-xs p-1 bg-gray-50 rounded text-center h-6 flex items-center justify-center">
                    <div className="font-bold text-xs">Apto {apartamento.numero}</div>
                  </div>
                  {diasDoMes.map((dia) => {
                    const statusInfo = getStatusDia(apartamento.numero, dia);
                    
                    return (
                      <div
                        key={dia.toISOString()}
                        className="h-6 relative"
                      >
                        <div
                          className={cn(
                            'absolute inset-0 rounded border text-xs font-medium flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity',
                            getCorStatus(statusInfo.status)
                          )}
                          title={`${apartamento.numero} - ${format(dia, 'dd/MM')} - ${statusInfo.hospede || statusInfo.status} ${statusInfo.origem === 'locacao' ? '(Locação)' : statusInfo.origem === 'disponibilidade' ? '(Reserva)' : ''}`}
                        >
                          <div className="text-center leading-tight overflow-hidden">
                            {statusInfo.hospede && (
                              <div className="truncate text-xs">
                                {statusInfo.hospede.split(' ')[0].substring(0, 4)}
                              </div>
                            )}
                          </div>
                        </div>
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
              {Math.round(((totalDiasDoMes - diasOcupados - diasBloqueados) / Math.max(totalDiasDoMes, 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Taxa de Disponibilidade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-red-600">
              {diasOcupados}
            </div>
            <div className="text-xs text-gray-500">Dias Ocupados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-yellow-600">
              {diasBloqueados}
            </div>
            <div className="text-xs text-gray-500">Dias Bloqueados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-gray-600">
              {Math.round((diasOcupados / Math.max(totalDiasDoMes, 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Taxa de Ocupação</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
