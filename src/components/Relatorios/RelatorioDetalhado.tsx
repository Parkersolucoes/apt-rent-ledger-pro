
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Locacao } from '@/types/locacao';
import { Despesa } from '@/types/despesa';
import { Building, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface RelatorioDetalhadoProps {
  apartamento: string;
  dataInicio: Date;
  dataFim: Date;
  locacoes: Locacao[];
  despesas: Despesa[];
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
}

export const RelatorioDetalhado = ({
  apartamento,
  dataInicio,
  dataFim,
  locacoes,
  despesas,
  totalReceitas,
  totalDespesas,
  lucroLiquido
}: RelatorioDetalhadoProps) => {
  return (
    <div className="print:bg-white print:text-black space-y-6">
      {/* Cabeçalho do Relatório */}
      <Card className="border-slate-200 print:shadow-none">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white print:bg-white print:text-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl">Relatório Financeiro</CardTitle>
                <p className="text-slate-200 print:text-slate-600">
                  Apartamento {apartamento} • {formatDate(dataInicio)} a {formatDate(dataFim)}
                </p>
              </div>
            </div>
            <div className="text-right print:text-black">
              <div className="text-sm text-slate-200 print:text-slate-600">
                Gerado em: {formatDate(new Date())}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo Executivo */}
      <Card className="border-slate-200 print:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(totalReceitas)}
              </div>
              <div className="text-sm text-slate-600 mt-1">Receitas Totais</div>
              <div className="text-xs text-slate-500">{locacoes.length} locações</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(totalDespesas)}
              </div>
              <div className="text-sm text-slate-600 mt-1">Despesas Totais</div>
              <div className="text-xs text-slate-500">{despesas.length} despesas</div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${lucroLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(lucroLiquido)}
              </div>
              <div className="text-sm text-slate-600 mt-1">Lucro Líquido</div>
              <div className="text-xs text-slate-500">
                {totalReceitas > 0 ? `${((lucroLiquido / totalReceitas) * 100).toFixed(1)}% margem` : '0% margem'}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {totalReceitas > 0 ? `${((totalDespesas / totalReceitas) * 100).toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-slate-600 mt-1">Taxa de Custos</div>
              <div className="text-xs text-slate-500">despesas/receitas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento das Receitas */}
      {locacoes.length > 0 && (
        <Card className="border-slate-200 print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Detalhamento das Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Valor Locação</TableHead>
                  <TableHead className="text-right">Taxa Limpeza</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="text-right">Valor Proprietário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locacoes.map((locacao) => (
                  <TableRow key={locacao.id}>
                    <TableCell>{formatDate(locacao.dataEntrada)}</TableCell>
                    <TableCell>{locacao.hospede}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(locacao.dataEntrada)} a {formatDate(locacao.dataSaida)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(locacao.valorLocacao)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(locacao.taxaLimpeza)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(locacao.comissao)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(locacao.valorProprietario)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-medium bg-green-50">
                  <TableCell colSpan={3} className="text-right">Total:</TableCell>
                  <TableCell className="text-right text-green-700">
                    {formatCurrency(locacoes.reduce((acc, loc) => acc + loc.valorLocacao, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(locacoes.reduce((acc, loc) => acc + loc.taxaLimpeza, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(locacoes.reduce((acc, loc) => acc + loc.comissao, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(locacoes.reduce((acc, loc) => acc + loc.valorProprietario, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detalhamento das Despesas */}
      {despesas.length > 0 && (
        <Card className="border-slate-200 print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Detalhamento das Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell>{formatDate(despesa.data)}</TableCell>
                    <TableCell>{despesa.descricao}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(despesa.valor)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-medium bg-red-50">
                  <TableCell colSpan={2} className="text-right">Total:</TableCell>
                  <TableCell className="text-right text-red-700">
                    {formatCurrency(totalDespesas)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Análise */}
      <Card className="border-slate-200 print:shadow-none">
        <CardHeader>
          <CardTitle>Análise do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Métricas de Performance</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Número de locações: {locacoes.length}</li>
                  <li>• Receita média por locação: {locacoes.length > 0 ? formatCurrency(totalReceitas / locacoes.length) : formatCurrency(0)}</li>
                  <li>• Número de despesas: {despesas.length}</li>
                  <li>• Despesa média: {despesas.length > 0 ? formatCurrency(totalDespesas / despesas.length) : formatCurrency(0)}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Indicadores Financeiros</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Margem de lucro: {totalReceitas > 0 ? `${((lucroLiquido / totalReceitas) * 100).toFixed(1)}%` : '0%'}</li>
                  <li>• ROI do período: {totalDespesas > 0 ? `${((lucroLiquido / totalDespesas) * 100).toFixed(1)}%` : 'N/A'}</li>
                  <li>• Taxa de despesas: {totalReceitas > 0 ? `${((totalDespesas / totalReceitas) * 100).toFixed(1)}%` : '0%'}</li>
                  <li className={`font-medium ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    • Resultado: {lucroLiquido >= 0 ? 'Lucro' : 'Prejuízo'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
