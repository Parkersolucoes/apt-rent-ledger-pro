
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
import { Calendar, House, User, Flag, Edit, Trash2, Filter } from 'lucide-react';
import { ConfirmacaoExclusaoLocacao } from './ConfirmacaoExclusaoLocacao';
import { EdicaoLocacao } from './EdicaoLocacao';
import { toast } from '@/hooks/use-toast';
import { Locacao } from '@/types/locacao';

export const ListaLocacoes = () => {
  const { locacoes, obterApartamentos, obterAnos, filtrarLocacoes, removerLocacao } = useLocacoes();
  const [filtros, setFiltros] = useState<FiltrosLocacao>({});
  const [locacaoParaExcluir, setLocacaoParaExcluir] = useState<Locacao | null>(null);
  const [locacaoParaEditar, setLocacaoParaEditar] = useState<Locacao | null>(null);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);

  const locacoesFiltradas = filtrarLocacoes(filtros);
  const apartamentos = obterApartamentos();
  const anos = obterAnos();

  const limparFiltros = () => {
    setFiltros({});
  };

  const aplicarFiltroRapido = (tipo: 'apartamento' | 'ano' | 'mes', valor: string | number) => {
    if (tipo === 'apartamento') {
      setFiltros({...filtros, apartamento: valor as string});
    } else if (tipo === 'ano') {
      setFiltros({...filtros, ano: valor as number});
    } else if (tipo === 'mes') {
      setFiltros({...filtros, mes: valor as number});
    }
  };

  const handleExcluir = (locacao: Locacao) => {
    setLocacaoParaExcluir(locacao);
    setModalExclusaoAberto(true);
  };

  const handleEditar = (locacao: Locacao) => {
    setLocacaoParaEditar(locacao);
    setModalEdicaoAberto(true);
  };

  const confirmarExclusao = async () => {
    if (locacaoParaExcluir) {
      await removerLocacao(locacaoParaExcluir.id);
      toast({
        title: "Sucesso!",
        description: "Locação excluída com sucesso.",
      });
      setModalExclusaoAberto(false);
      setLocacaoParaExcluir(null);
    }
  };

  // Calcular totais por apartamento
  const totaisPorApartamento = apartamentos.reduce((acc, apartamento) => {
    const locacoesApartamento = locacoesFiltradas.filter(loc => loc.apartamento === apartamento);
    const valorTotal = locacoesApartamento.reduce((sum, loc) => sum + loc.valorLocacao + loc.taxaLimpeza, 0);
    const comissaoTotal = locacoesApartamento.reduce((sum, loc) => sum + loc.comissao, 0);
    const valorProprietario = valorTotal - comissaoTotal;
    
    acc[apartamento] = {
      valorTotal,
      comissaoTotal,
      valorProprietario,
      quantidade: locacoesApartamento.length
    };
    return acc;
  }, {} as Record<string, { valorTotal: number; comissaoTotal: number; valorProprietario: number; quantidade: number }>);

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

        {/* Botões de Filtro Rápido */}
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
                    onClick={() => aplicarFiltroRapido('apartamento', apartamento)}
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
                    onClick={() => aplicarFiltroRapido('ano', ano)}
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
                    onClick={() => aplicarFiltroRapido('mes', mes.value)}
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

        {/* Totais por Apartamento */}
        {apartamentos.length > 0 && (
          <Card className="shadow-professional-lg">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="text-xl">Totais por Apartamento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apartamentos.map((apartamento) => {
                  const totais = totaisPorApartamento[apartamento];
                  if (!totais || totais.quantidade === 0) return null;
                  
                  return (
                    <Card key={apartamento} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <House className="h-5 w-5" />
                          Apartamento {apartamento}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Locações:</span>
                          <span className="font-medium">{totais.quantidade}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor Total:</span>
                          <span className="font-medium text-green-600">{formatCurrency(totais.valorTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Comissão:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(totais.comissaoTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2">
                          <span className="text-muted-foreground font-medium">Valor Proprietário:</span>
                          <span className="font-bold text-primary">{formatCurrency(totais.valorProprietario)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 space-y-3">
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

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditar(locacao)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExcluir(locacao)}
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ConfirmacaoExclusaoLocacao
          locacao={locacaoParaExcluir}
          open={modalExclusaoAberto}
          onOpenChange={setModalExclusaoAberto}
          onConfirm={confirmarExclusao}
        />

        <EdicaoLocacao
          locacao={locacaoParaEditar}
          open={modalEdicaoAberto}
          onOpenChange={setModalEdicaoAberto}
        />
      </div>
    </div>
  );
};
