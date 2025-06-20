
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
import { Calendar, House, User, Flag } from 'lucide-react';

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
        <Card className="shadow-professional-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-xl">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filtroApartamento" className="text-foreground font-medium">Apartamento</Label>
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
                <Label htmlFor="filtroAno" className="text-foreground font-medium">Ano</Label>
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
                <Label htmlFor="filtroMes" className="text-foreground font-medium">Mês</Label>
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

        <Card className="shadow-professional-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-xl">
              <span>Locações ({locacoesFiltradas.length})</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Total: {formatCurrency(locacoesFiltradas.reduce((acc, loc) => acc + loc.valorLocacao, 0))}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {locacoesFiltradas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma locação encontrada com os filtros aplicados.
              </p>
            ) : (
              <div className="space-y-4">
                {locacoesFiltradas.map((locacao) => (
                  <div
                    key={locacao.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-card"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <House className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">{locacao.apartamento}</span>
                          <Badge variant="outline" className="border-primary text-primary">
                            {getMesNome(locacao.mes)} {locacao.ano}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="text-foreground">{locacao.hospede}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(locacao.dataEntrada)} - {formatDate(locacao.dataSaida)}
                          </span>
                        </div>
                        
                        {locacao.observacoes && (
                          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {locacao.observacoes}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Locação:</span>
                            <span className="font-medium text-foreground">{formatCurrency(locacao.valorLocacao)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Taxa Limpeza:</span>
                            <span className="font-medium text-foreground">{formatCurrency(locacao.taxaLimpeza)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>1º Pagto:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-green-600">{formatCurrency(locacao.primeiroPagamento)}</span>
                              {locacao.primeiroPagamentoPago && (
                                <Flag className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>2º Pagto:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-green-600">{formatCurrency(locacao.segundoPagamento)}</span>
                              {locacao.segundoPagamentoPago && (
                                <Flag className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Faltando:</span>
                            <span className={`font-medium ${locacao.valorFaltando > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(locacao.valorFaltando)}
                            </span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Comissão:</span>
                            <span className="font-medium text-primary">{formatCurrency(locacao.comissao)}</span>
                          </div>
                        </div>
                        
                        {locacao.dataPagamentoProprietario && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
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
    </div>
  );
};
