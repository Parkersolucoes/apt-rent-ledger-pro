
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
    <div className="min-h-screen gradient-bg-page p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-2xl border-0 bg-slate-800/95 backdrop-blur-sm border border-slate-600">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="text-xl">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filtroApartamento" className="text-slate-200 font-semibold">Apartamento</Label>
                <Select value={filtros.apartamento || 'todos'} onValueChange={(value) => setFiltros({...filtros, apartamento: value === 'todos' ? undefined : value})}>
                  <SelectTrigger className="border-slate-600 focus:border-blue-500 bg-slate-700 text-slate-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="todos" className="text-slate-200 focus:bg-slate-600">Todos</SelectItem>
                    {apartamentos.map((apt) => (
                      <SelectItem key={apt} value={apt} className="text-slate-200 focus:bg-slate-600">{apt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filtroAno" className="text-slate-200 font-semibold">Ano</Label>
                <Select value={filtros.ano?.toString() || 'todos'} onValueChange={(value) => setFiltros({...filtros, ano: value === 'todos' ? undefined : parseInt(value)})}>
                  <SelectTrigger className="border-slate-600 focus:border-blue-500 bg-slate-700 text-slate-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="todos" className="text-slate-200 focus:bg-slate-600">Todos</SelectItem>
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano.toString()} className="text-slate-200 focus:bg-slate-600">{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filtroMes" className="text-slate-200 font-semibold">Mês</Label>
                <Select value={filtros.mes?.toString() || 'todos'} onValueChange={(value) => setFiltros({...filtros, mes: value === 'todos' ? undefined : parseInt(value)})}>
                  <SelectTrigger className="border-slate-600 focus:border-blue-500 bg-slate-700 text-slate-200">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="todos" className="text-slate-200 focus:bg-slate-600">Todos</SelectItem>
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value.toString()} className="text-slate-200 focus:bg-slate-600">{mes.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={limparFiltros} variant="outline" className="w-full border-slate-500 bg-slate-700 text-slate-200 hover:bg-slate-600">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-0 bg-slate-800/95 backdrop-blur-sm border border-slate-600">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-xl">
              <span>Locações ({locacoesFiltradas.length})</span>
              <Badge variant="secondary" className="bg-green-600 text-white">
                Total: {formatCurrency(locacoesFiltradas.reduce((acc, loc) => acc + loc.valorLocacao, 0))}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {locacoesFiltradas.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Nenhuma locação encontrada com os filtros aplicados.
              </p>
            ) : (
              <div className="space-y-4">
                {locacoesFiltradas.map((locacao) => (
                  <div
                    key={locacao.id}
                    className="border border-slate-600 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-slate-700/50 hover:border-blue-500"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <House className="h-4 w-4 text-blue-400" />
                          <span className="font-semibold text-slate-200">{locacao.apartamento}</span>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {getMesNome(locacao.mes)} {locacao.ano}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-400" />
                          <span className="text-slate-200">{locacao.hospede}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-slate-300">
                            {formatDate(locacao.dataEntrada)} - {formatDate(locacao.dataSaida)}
                          </span>
                        </div>
                        
                        {locacao.observacoes && (
                          <div className="text-sm text-slate-300 bg-slate-600/50 p-2 rounded">
                            {locacao.observacoes}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between text-slate-300">
                            <span>Locação:</span>
                            <span className="font-medium text-slate-200">{formatCurrency(locacao.valorLocacao)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Taxa Limpeza:</span>
                            <span className="font-medium text-slate-200">{formatCurrency(locacao.taxaLimpeza)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>1º Pagto:</span>
                            <span className="font-medium text-green-400">{formatCurrency(locacao.primeiroPagamento)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>2º Pagto:</span>
                            <span className="font-medium text-green-400">{formatCurrency(locacao.segundoPagamento)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Faltando:</span>
                            <span className={`font-medium ${locacao.valorFaltando > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {formatCurrency(locacao.valorFaltando)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Comissão:</span>
                            <span className="font-medium text-blue-400">{formatCurrency(locacao.comissao)}</span>
                          </div>
                        </div>
                        
                        {locacao.dataPagamentoProprietario && (
                          <div className="mt-2 p-2 bg-green-600/20 border border-green-600/30 rounded text-sm">
                            <span className="text-green-400">
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
    </div>
  );
};
