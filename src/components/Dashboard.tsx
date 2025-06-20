import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocacoes } from '@/hooks/useLocacoes';
import { formatCurrency } from '@/utils/formatters';
import { House, User, Wallet, Database, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

  const mesAtual = hoje.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
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

  const locacoesRecentes = locacoes
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

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

  return (
    <div className="min-h-screen gradient-bg-page p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h2 className="text-3xl font-bold text-slate-50 mb-2">Dashboard Executivo</h2>
          <p className="text-slate-300">Visão geral do seu negócio de locações</p>
        </div>

        {temDadosLocalStorage() && (
          <Card className="border-blue-500/30 bg-slate-800/95 backdrop-blur-sm shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-blue-50">
                <Database className="h-5 w-5" />
                Migração de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-300">
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
                  className="border-red-500 text-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Cache Local
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">
                Apartamentos Cadastrados
              </CardTitle>
              <House className="h-5 w-5 text-indigo-400" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-indigo-400">
                {estatisticas.apartamentosAtivos}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-600 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-emerald-100">
                Ocupados Hoje
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-emerald-300" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-emerald-300">
                {estatisticas.apartamentosOcupados}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {apartamentos.length > 0 ? `${Math.round((estatisticas.apartamentosOcupados / apartamentos.length) * 100)}% ocupação` : '0% ocupação'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-amber-600 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-amber-100">
                Disponíveis Hoje
              </CardTitle>
              <XCircle className="h-5 w-5 text-amber-300" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-amber-300">
                {estatisticas.apartamentosDisponiveis}
              </div>
              <p className="text-xs text-amber-200 mt-1">
                Prontos para locação
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">
                Faturamento do Mês
              </CardTitle>
              <Wallet className="h-5 w-5 text-blue-300" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-blue-300">
                {formatCurrency(estatisticas.faturamentoTotal)}
              </div>
              <p className="text-xs text-blue-200 mt-1">
                {mesAtual}/{anoAtual}
              </p>
            </CardContent>
          </Card>
        </div>

        {apartamentos.length > 0 && (
          <Card className="bg-slate-800/95 backdrop-blur-sm border-slate-600 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-blue-50">
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
                          ? 'bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-600' 
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600'
                      }`}
                      onClick={() => handleApartamentoClick(apartamento)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`text-3xl font-bold mb-2 ${
                          estaOcupado ? 'text-emerald-300' : 'text-slate-300'
                        }`}>
                          {apartamento}
                        </div>
                        <div className={`text-sm mb-1 ${
                          estaOcupado ? 'text-emerald-200' : 'text-slate-400'
                        }`}>
                          {locacoesApt.length} locações
                        </div>
                        <div className={`text-sm font-medium ${
                          estaOcupado ? 'text-emerald-100' : 'text-slate-300'
                        }`}>
                          {formatCurrency(faturamentoApt)}
                        </div>
                        <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                          estaOcupado 
                            ? 'bg-emerald-700 text-emerald-200' 
                            : 'bg-amber-700 text-amber-200'
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

        <Card className="bg-slate-800/95 backdrop-blur-sm border-slate-600 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-blue-50">
              <User className="h-5 w-5" />
              Locações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {locacoesRecentes.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Nenhuma locação cadastrada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {locacoesRecentes.map((locacao) => (
                  <div
                    key={locacao.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{locacao.hospede}</div>
                      <div className="text-sm text-slate-400">
                        {locacao.apartamento} • {locacao.mes}/{locacao.ano}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-400">
                        {formatCurrency(locacao.valorLocacao)}
                      </div>
                      <div className="text-sm text-slate-500">
                        Comissão: {formatCurrency(locacao.comissao)}
                      </div>
                    </div>
                  </div>
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
