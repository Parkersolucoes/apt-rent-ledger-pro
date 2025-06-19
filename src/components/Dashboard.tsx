
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocacoes } from '@/hooks/useLocacoes';
import { formatCurrency } from '@/utils/formatters';
import { Calendar, House, User, Wallet } from 'lucide-react';

export const Dashboard = () => {
  const { locacoes } = useLocacoes();

  const estatisticas = {
    totalLocacoes: locacoes.length,
    apartamentosAtivos: new Set(locacoes.map(loc => loc.apartamento)).size,
    faturamentoTotal: locacoes.reduce((acc, loc) => acc + loc.valorLocacao, 0),
    comissaoTotal: locacoes.reduce((acc, loc) => acc + loc.comissao, 0)
  };

  const locacoesRecentes = locacoes
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
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
    </div>
  );
};
