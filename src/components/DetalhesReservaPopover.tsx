
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Disponibilidade } from '@/hooks/useDisponibilidade';
import { Locacao } from '@/types/locacao';

interface DetalhesReservaPopoverProps {
  children: React.ReactNode;
  reserva?: Disponibilidade;
  locacao?: Locacao;
  apartamento: string;
  dia: Date;
  status: string;
}

export const DetalhesReservaPopover = ({
  children,
  reserva,
  locacao,
  apartamento,
  dia,
  status
}: DetalhesReservaPopoverProps) => {
  const formatarValor = (valor?: number) => {
    if (!valor) return 'N/A';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ocupado':
        return 'bg-red-100 text-red-800';
      case 'bloqueado':
        return 'bg-yellow-100 text-yellow-800';
      case 'manutencao':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Apartamento {apartamento}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500">
                {format(dia, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {locacao && (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{locacao.hospede}</p>
                    {locacao.telefone && (
                      <p className="text-sm text-gray-500">{locacao.telefone}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-medium">
                      {format(new Date(locacao.dataEntrada), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-out</p>
                    <p className="font-medium">
                      {format(new Date(locacao.dataSaida), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Valor da Locação</p>
                    <p className="font-medium">{formatarValor(locacao.valorLocacao)}</p>
                  </div>
                </div>

                {locacao.observacoes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Observações</p>
                      <p className="text-sm">{locacao.observacoes}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {reserva && (
              <>
                {reserva.hospede && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{reserva.hospede}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Data Início</p>
                    <p className="font-medium">
                      {format(new Date(reserva.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Data Fim</p>
                    <p className="font-medium">
                      {format(new Date(reserva.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {reserva.valor_diaria && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Valor da Diária</p>
                      <p className="font-medium">{formatarValor(reserva.valor_diaria)}</p>
                    </div>
                  </div>
                )}

                {reserva.observacoes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Observações</p>
                      <p className="text-sm">{reserva.observacoes}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {status === 'disponivel' && (
              <div className="text-center text-gray-500 py-2">
                <p className="text-sm">Apartamento disponível para reserva</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
