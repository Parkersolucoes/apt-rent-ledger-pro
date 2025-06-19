
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocacoes } from '@/hooks/useLocacoes';
import { formatCurrency, formatDate, getMesNome } from '@/utils/formatters';
import { FiltrosLocacao } from '@/types/locacao';
import { Calendar, House, User } from 'lucide-react';

export const ListaLocacoes = () => {
  const { locacoes, obterApartamentos, obterAnos, filtrarLocacoes } = useLocacoes();
  const [filtros, setFiltros] = useState<FiltrosLocacao>({});

  const locacoesFiltradas = filtrarLocacoes(filtros);
  const apartamentos = obterApartamentos();
  const anos = obterAnos();

  const limparFiltros = () => {
    setFiltros({});
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filtroApartamento">Apartamento</Label>
              <Select value={filtros.apartamento || 'todos'} onValueChange={(value) => setFiltros({...filtros, apartamento: value === 'todos' ? undefined : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {apartamentos.map((apt) => (
                    <SelectItem key={apt} value={apt}>{apt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filtroAno">Ano</Label>
              <Select value={filtros.ano?.toString() || 'todos'} onValueChange={(value) => setFiltros({...filtros, ano: value === 'todos' ? undefined : parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filtroMes">Mês</Label>
              <Select value={filtros.mes?.toString() || 'todos'} onValueChange={(value) => setFiltros({...filtros, mes: value === 'todos' ? undefined : parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value.toString()}>{mes.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={limparFiltros} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Locações ({locacoesFiltradas.length})</span>
            <Badge variant="secondary">
              Total: {formatCurrency(locacoesFiltradas.reduce((acc, loc) => acc + loc.valorLocacao, 0))}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locacoesFiltradas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma locação encontrada com os filtros aplicados.
            </p>
          ) : (
            <div className="space-y-4">
              {locacoesFiltradas.map((locacao) => (
                <div
                  key={locacao.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <House className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">{locacao.apartamento}</span>
                        <Badge variant="outline">
                          {getMesNome(locacao.mes)} {locacao.ano}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span>{locacao.hospede}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          {formatDate(locacao.dataEntrada)} - {formatDate(locacao.dataSaida)}
                        </span>
                      </div>
                      
                      {locacao.observacoes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {locacao.observacoes}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Locação:</span>
                          <span className="font-medium">{formatCurrency(locacao.valorLocacao)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa Limpeza:</span>
                          <span className="font-medium">{formatCurrency(locacao.taxaLimpeza)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1º Pagto:</span>
                          <span className="font-medium text-green-600">{formatCurrency(locacao.primeiroPagamento)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2º Pagto:</span>
                          <span className="font-medium text-green-600">{formatCurrency(locacao.segundoPagamento)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Faltando:</span>
                          <span className={`font-medium ${locacao.valorFaltando > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(locacao.valorFaltando)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Comissão:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(locacao.comissao)}</span>
                        </div>
                      </div>
                      
                      {locacao.dataPagamentoProprietario && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                          <span className="text-green-700">
                            Pago ao proprietário em: {formatDate(locacao.dataPagamentoProprietario)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
