
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocacoes } from '@/hooks/useLocacoes';
import { formatCurrency } from '@/utils/formatters';
import { House, User, Wallet, Database, Trash2, CheckCircle, XCircle, Calendar, Phone, MapPin, Users } from 'lucide-react';
import { ApartamentoModal } from './ApartamentoModal';
import { Logo } from './Logo';
import { migrarDadosParaSupabase, limparLocalStorage } from '@/utils/migration';

export const Dashboard = () => {
  const { locacoes } = useLocacoes();
  const [apartamentoSelecionado, setApartamentoSelecionado] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [migrandoDados, setMigrandoDados] = useState(false);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  // Locações ativas hoje
  const locacoesAtivas = locacoes.filter(loc => {
    const dataEntrada = new Date(loc.dataEntrada);
    const dataSaida = new Date(loc.dataSaida);
    dataEntrada.setHours(0, 0, 0, 0);
    dataSaida.setHours(0, 0, 0, 0);
    
    return hoje >= dataEntrada && hoje <= dataSaida;
  });

  // Locações do mês corrente
  const locacoesMesCorrente = locacoes.filter(loc => 
    loc.mes === mesAtual && loc.ano === anoAtual
  );

  const apartamentosOcupados = new Set(locacoesAtivas.map(loc => loc.apartamento));
  const todosApartamentos = new Set(locacoes.map(loc => loc.apartamento));
  const apartamentosDisponiveis = todosApartamentos.size - apartamentosOcupados.size;

  const estatisticas = {
    apartamentosAtivos: todosApartamentos.size,
    apartamentosOcupados: apartamentosOcupados.size,
    apartamentosDisponiveis: apartamentosDisponiveis,
    faturamentoTotal: locacoesMesCorrente.reduce((acc, loc) => acc + loc.valorLocacao, 0)
  };

  const apartamentos = Array.from(todosApartamentos).sort();

  const handleApartamentoClick = (apartamento: string) => {
    setApartamentoSelecionado(apartamento);
    setModalAberto(true);
  };

  const handleMigrarDados = async () => {
    setMigrandoDados(true);
    await migrarDadosParaSupabase();
    setMigrandoDados(false);
    window.location.reload();
  };

  const temDadosLocalStorage = () => {
    return localStorage.getItem('apartamentos') || localStorage.getItem('locacoes');
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Análise de Reservas</h2>
          <p className="text-slate-300">Visão geral do seu negócio de locações</p>
        </div>

        {temDadosLocalStorage() && (
          <Card className="border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Migração de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-700">
                Detectamos dados no localStorage. Migre-os para o Supabase para garantir que não sejam perdidos.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleMigrarDados}
                  disabled={migrandoDados}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {migrandoDados ? 'Migrando...' : 'Migrar para Supabase'}
                </Button>
                <Button 
                  onClick={limparLocalStorage}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Cache Local
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Apartamentos Cadastrados
              </CardTitle>
              <House className="h-6 w-6 text-blue-600" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-blue-700">
                {estatisticas.apartamentosAtivos}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Ocupados Hoje
              </CardTitle>
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-emerald-700">
                {estatisticas.apartamentosOcupados}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {apartamentos.length > 0 ? `${Math.round((estatisticas.apartamentosOcupados / apartamentos.length) * 100)}% ocupação` : '0% ocupação'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Disponíveis Hoje
              </CardTitle>
              <XCircle className="h-6 w-6 text-amber-600" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-amber-700">
                {estatisticas.apartamentosDisponiveis}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Prontos para locação
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Faturamento do Mês
              </CardTitle>
              <Wallet className="h-6 w-6 text-blue-600" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(estatisticas.faturamentoTotal)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {mesAtual}/{anoAtual}
              </p>
            </CardContent>
          </Card>
        </div>

        {apartamentos.length > 0 && (
          <Card className="bg-white border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <House className="h-5 w-5" />
                Apartamentos ({apartamentos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {apartamentos.map((apartamento) => {
                  const locacoesApt = locacoes.filter(loc => loc.apartamento === apartamento);
                  const faturamentoApt = locacoesApt.reduce((acc, loc) => acc + loc.valorLocacao, 0);
                  const estaOcupado = apartamentosOcupados.has(apartamento);
                  
                  return (
                    <Card 
                      key={apartamento}
                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border ${
                        estaOcupado 
                          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300' 
                          : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300'
                      }`}
                      onClick={() => handleApartamentoClick(apartamento)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`text-3xl font-bold mb-2 ${
                          estaOcupado ? 'text-emerald-700' : 'text-slate-600'
                        }`}>
                          {apartamento}
                        </div>
                        <div className={`text-sm mb-1 ${
                          estaOcupado ? 'text-emerald-600' : 'text-slate-500'
                        }`}>
                          {locacoesApt.length} locações
                        </div>
                        <div className={`text-sm font-medium ${
                          estaOcupado ? 'text-emerald-700' : 'text-slate-600'
                        }`}>
                          {formatCurrency(faturamentoApt)}
                        </div>
                        <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                          estaOcupado 
                            ? 'bg-emerald-200 text-emerald-800' 
                            : 'bg-amber-200 text-amber-800'
                        }`}>
                          {estaOcupado ? 'Ocupado' : 'Disponível'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Locações no Mês ({mesAtual}/{anoAtual}) - {locacoesMesCorrente.length} reservas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {locacoesMesCorrente.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Nenhuma locação cadastrada para este mês.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {locacoesMesCorrente.map((locacao) => (
                  <Card
                    key={locacao.id}
                    className="border border-blue-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100"
                  >
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        {/* Header com apartamento e hóspede */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <House className="h-4 w-4 text-blue-600" />
                            <span className="font-bold text-blue-700 text-lg">
                              Apt {locacao.apartamento}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-700">
                              {formatCurrency(locacao.valorLocacao)}
                            </div>
                          </div>
                        </div>

                        {/* Informações do hóspede */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-600" />
                            <span className="font-medium text-slate-800">{locacao.hospede}</span>
                          </div>
                          {locacao.telefone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-600" />
                              <span className="text-sm text-slate-600">{locacao.telefone}</span>
                            </div>
                          )}
                        </div>

                        {/* Período da estadia */}
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-slate-700">Período</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>Entrada: <span className="font-medium">{formatarData(locacao.dataEntrada)}</span></div>
                            <div>Saída: <span className="font-medium">{formatarData(locacao.dataSaida)}</span></div>
                          </div>
                        </div>

                        {/* Detalhes financeiros */}
                        <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">1º Pagamento:</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{formatCurrency(locacao.primeiroPagamento)}</div>
                              <div className="text-xs text-slate-500">{locacao.primeiroPagamentoForma}</div>
                              <div className={`text-xs px-2 py-1 rounded ${
                                locacao.primeiroPagamentoPago 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {locacao.primeiroPagamentoPago ? '✓ Pago' : '✗ Pendente'}
                              </div>
                            </div>
                          </div>

                          {locacao.segundoPagamento > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">2º Pagamento:</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">{formatCurrency(locacao.segundoPagamento)}</div>
                                <div className="text-xs text-slate-500">{locacao.segundoPagamentoForma}</div>
                                <div className={`text-xs px-2 py-1 rounded ${
                                  locacao.segundoPagamentoPago 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {locacao.segundoPagamentoPago ? '✓ Pago' : '✗ Pendente'}
                                </div>
                              </div>
                            </div>
                          )}

                          {locacao.valorFaltando > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-red-600">Valor Faltando:</span>
                              <span className="text-sm font-medium text-red-700">{formatCurrency(locacao.valorFaltando)}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Taxa Limpeza:</span>
                            <span className="text-sm font-medium">{formatCurrency(locacao.taxaLimpeza)}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Comissão:</span>
                            <span className="text-sm font-medium">{formatCurrency(locacao.comissao)}</span>
                          </div>

                          <div className="flex justify-between items-center border-t pt-2">
                            <span className="text-sm font-medium text-slate-700">Valor Proprietário:</span>
                            <span className="text-sm font-bold text-blue-700">{formatCurrency(locacao.valorProprietario)}</span>
                          </div>

                          {locacao.dataPagamentoProprietario && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-green-600">Pago ao Proprietário:</span>
                              <span className="text-sm font-medium text-green-700">{formatarData(locacao.dataPagamentoProprietario)}</span>
                            </div>
                          )}
                        </div>

                        {locacao.observacoes && (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <div className="text-sm">
                              <span className="font-medium text-amber-800">Observações:</span>
                              <div className="text-amber-700 mt-1">{locacao.observacoes}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ApartamentoModal 
          apartamento={apartamentoSelecionado}
          open={modalAberto}
          onOpenChange={setModalAberto}
        />
      </div>
    </div>
  );
};
