import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocacoes } from '@/hooks/useLocacoes';
import { formatCurrency } from '@/utils/formatters';
import { Calendar, House, User, Wallet, Database, Trash2 } from 'lucide-react';
import { ApartamentoModal } from './ApartamentoModal';
import { migrarDadosParaSupabase, limparLocalStorage } from '@/utils/migration';

export const Dashboard = () => {
  const { locacoes } = useLocacoes();
  const [apartamentoSelecionado, setApartamentoSelecionado] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [migrandoDados, setMigrandoDados] = useState(false);

  const estatisticas = {
    totalLocacoes: locacoes.length,
    apartamentosAtivos: new Set(locacoes.map(loc => loc.apartamento)).size,
    faturamentoTotal: locacoes.reduce((acc, loc) => acc + loc.valorLocacao, 0),
    comissaoTotal: locacoes.reduce((acc, loc) => acc + loc.comissao, 0)
  };

  const locacoesRecentes = locacoes
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const apartamentos = Array.from(new Set(locacoes.map(loc => loc.apartamento))).sort();

  const handleApartamentoClick = (apartamento: string) => {
    setApartamentoSelecionado(apartamento);
    setModalAberto(true);
  };

  const handleMigrarDados = async () => {
    setMigrandoDados(true);
    await migrarDadosParaSupabase();
    setMigrandoDados(false);
    // Recarregar a página para mostrar os dados migrados
    window.location.reload();
  };

  const temDadosLocalStorage = () => {
    return localStorage.getItem('apartamentos') || localStorage.getItem('locacoes');
  };

  return (
    <div className="space-y-6">
      {temDadosLocalStorage() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Database className="h-5 w-5" />
              Migração de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-600">
              Detectamos dados no localStorage. Migre-os para o Supabase para garantir que não sejam perdidos.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleMigrarDados}
                disabled={migrandoDados}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Database className="h-4 w-4 mr-2" />
                {migrandoDados ? 'Migrando...' : 'Migrar para Supabase'}
              </Button>
              <Button 
                onClick={limparLocalStorage}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache Local
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total de Locações
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {estatisticas.totalLocacoes}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Apartamentos Ativos
            </CardTitle>
            <House className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {estatisticas.apartamentosAtivos}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">
              Faturamento Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {formatCurrency(estatisticas.faturamentoTotal)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">
              Comissões Totais
            </CardTitle>
            <Wallet className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">
              {formatCurrency(estatisticas.comissaoTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {apartamentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <House className="h-5 w-5" />
              Apartamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {apartamentos.map((apartamento) => {
                const locacoesApt = locacoes.filter(loc => loc.apartamento === apartamento);
                const faturamentoApt = locacoesApt.reduce((acc, loc) => acc + loc.valorLocacao, 0);
                
                return (
                  <Card 
                    key={apartamento}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
                    onClick={() => handleApartamentoClick(apartamento)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-indigo-900 mb-2">
                        {apartamento}
                      </div>
                      <div className="text-sm text-indigo-700 mb-1">
                        {locacoesApt.length} locações
                      </div>
                      <div className="text-sm font-medium text-indigo-800">
                        {formatCurrency(faturamentoApt)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Locações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locacoesRecentes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma locação cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {locacoesRecentes.map((locacao) => (
                <div
                  key={locacao.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium">{locacao.hospede}</div>
                    <div className="text-sm text-gray-600">
                      {locacao.apartamento} • {locacao.mes}/{locacao.ano}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {formatCurrency(locacao.valorLocacao)}
                    </div>
                    <div className="text-sm text-gray-500">
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
  );
};
