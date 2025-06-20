
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
  logoUrl?: string | null;
}

export const RelatorioDetalhado = ({
  apartamento,
  dataInicio,
  dataFim,
  locacoes,
  despesas,
  totalReceitas,
  totalDespesas,
  lucroLiquido,
  logoUrl
}: RelatorioDetalhadoProps) => {
  return (
    <div className="print:bg-white print:text-black print:shadow-none print:p-4 print:max-w-none print:w-full space-y-4 print:space-y-3">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page { 
              size: A4; 
              margin: 1.5cm; 
            }
            .print\\:break-page {
              page-break-before: always;
            }
            .print\\:avoid-break {
              page-break-inside: avoid;
            }
            .print\\:text-xs {
              font-size: 10px !important;
            }
            .print\\:text-sm {
              font-size: 12px !important;
            }
            .print\\:text-base {
              font-size: 14px !important;
            }
            .print\\:mb-2 {
              margin-bottom: 8px !important;
            }
            .print\\:mb-4 {
              margin-bottom: 16px !important;
            }
            .print\\:p-2 {
              padding: 8px !important;
            }
            .print\\:py-1 {
              padding-top: 4px !important;
              padding-bottom: 4px !important;
            }
          }
        `
      }} />

      {/* Cabeçalho do Relatório */}
      <Card className="border-slate-200 print:shadow-none print:border print:border-gray-300 print:avoid-break">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white print:bg-white print:text-black print:border-b print:border-gray-300 print:p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-10 w-auto print:h-8"
                />
              )}
              <div>
                <CardTitle className="text-xl print:text-base print:font-bold">Relatório Financeiro</CardTitle>
                <p className="text-slate-200 print:text-slate-600 print:text-sm">
                  Apartamento {apartamento} • {formatDate(dataInicio)} a {formatDate(dataFim)}
                </p>
              </div>
            </div>
            <div className="text-right print:text-black">
              <div className="text-sm text-slate-200 print:text-slate-600 print:text-xs">
                Gerado em: {formatDate(new Date())}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo Executivo */}
      <Card className="border-slate-200 print:shadow-none print:border print:border-gray-300 print:avoid-break print:mb-4">
        <CardHeader className="print:p-2 print:border-b print:border-gray-200">
          <CardTitle className="flex items-center gap-2 print:text-base">
            <DollarSign className="h-5 w-5 text-blue-600 print:h-4 print:w-4" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent className="print:p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:gap-2 print:grid-cols-4">
            <div className="text-center print:text-left">
              <div className="text-3xl font-bold text-green-600 print:text-base print:font-semibold">
                {formatCurrency(totalReceitas)}
              </div>
              <div className="text-sm text-slate-600 mt-1 print:text-xs print:mt-0">Receitas Totais</div>
              <div className="text-xs text-slate-500 print:text-xs">{locacoes.length} locações</div>
            </div>
            
            <div className="text-center print:text-left">
              <div className="text-3xl font-bold text-red-600 print:text-base print:font-semibold">
                {formatCurrency(totalDespesas)}
              </div>
              <div className="text-sm text-slate-600 mt-1 print:text-xs print:mt-0">Despesas Totais</div>
              <div className="text-xs text-slate-500 print:text-xs">{despesas.length} despesas</div>
            </div>
            
            <div className="text-center print:text-left">
              <div className={`text-3xl font-bold print:text-base print:font-semibold ${lucroLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(lucroLiquido)}
              </div>
              <div className="text-sm text-slate-600 mt-1 print:text-xs print:mt-0">Lucro Líquido</div>
              <div className="text-xs text-slate-500 print:text-xs">
                {totalReceitas > 0 ? `${((lucroLiquido / totalReceitas) * 100).toFixed(1)}% margem` : '0% margem'}
              </div>
            </div>

            <div className="text-center print:text-left">
              <div className="text-3xl font-bold text-purple-600 print:text-base print:font-semibold">
                {totalReceitas > 0 ? `${((totalDespesas / totalReceitas) * 100).toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-slate-600 mt-1 print:text-xs print:mt-0">Taxa de Custos</div>
              <div className="text-xs text-slate-500 print:text-xs">despesas/receitas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento das Receitas */}
      {locacoes.length > 0 && (
        <Card className="border-slate-200 print:shadow-none print:border print:border-gray-300 print:avoid-break print:mb-4">
          <CardHeader className="print:p-2 print:border-b print:border-gray-200">
            <CardTitle className="flex items-center gap-2 print:text-base">
              <TrendingUp className="h-5 w-5 text-green-600 print:h-4 print:w-4" />
              Detalhamento das Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="print:p-0">
            <Table className="print:text-xs">
              <TableHeader>
                <TableRow className="print:border-b print:border-gray-300">
                  <TableHead className="print:py-1 print:text-xs print:font-semibold">Data</TableHead>
                  <TableHead className="print:py-1 print:text-xs print:font-semibold">Hóspede</TableHead>
                  <TableHead className="print:py-1 print:text-xs print:font-semibold">Período</TableHead>
                  <TableHead className="text-right print:py-1 print:text-xs print:font-semibold print:text-right">Valor Locação</TableHead>
                  <TableHead className="text-right print:py-1 print:text-xs print:font-semibold print:text-right">Taxa Limpeza</TableHead>
                  <TableHead className="text-right print:py-1 print:text-xs print:font-semibold print:text-right">Comissão</TableHead>
                  <TableHead className="text-right print:py-1 print:text-xs print:font-semibold print:text-right">Valor Proprietário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locacoes.map((locacao) => (
                  <TableRow key={locacao.id} className="print:border-b print:border-gray-200">
                    <TableCell className="print:py-1 print:text-xs">{formatDate(locacao.dataEntrada)}</TableCell>
                    <TableCell className="print:py-1 print:text-xs">{locacao.hospede}</TableCell>
                    <TableCell className="text-sm print:py-1 print:text-xs">
                      {formatDate(locacao.dataEntrada)} a {formatDate(locacao.dataSaida)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600 print:py-1 print:text-xs print:text-right">
                      {formatCurrency(locacao.valorLocacao)}
                    </TableCell>
                    <TableCell className="text-right print:py-1 print:text-xs print:text-right">
                      {formatCurrency(locacao.taxaLimpeza)}
                    </TableCell>
                    <TableCell className="text-right print:py-1 print:text-xs print:text-right">
                      {formatCurrency(locacao.comissao)}
                    </TableCell>
                    <TableCell className="text-right font-medium print:py-1 print:text-xs print:text-right">
                      {formatCurrency(locacao.valorProprietario)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-medium bg-green-50 print:bg-gray-100 print:border-t print:border-gray-400">
                  <TableCell colSpan={3} className="text-right print:py-1 print:text-xs print:font-semibold">Total:</TableCell>
                  <TableCell className="text-right text-green-700 print:py-1 print:text-xs print:text-right print:font-semibold">
                    {formatCurrency(locacoes.reduce((acc, loc) => acc + loc.valorLocacao, 0))}
                  </TableCell>
                  <TableCell className="text-right print:py-1 print:text-xs print:text-right">
                    {formatCurrency(locacoes.reduce((acc, loc) => acc + loc.taxaLimpeza, 0))}
                  </TableCell>
                  <TableCell className="text-right print:py-1 print:text-xs print:text-right">
                    {formatCurrency(locacoes.reduce((acc, loc) => acc + loc.comissao, 0))}
                  </TableCell>
                  <TableCell className="text-right print:py-1 print:text-xs print:text-right">
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
        <Card className="border-slate-200 print:shadow-none print:border print:border-gray-300 print:avoid-break print:mb-4">
          <CardHeader className="print:p-2 print:border-b print:border-gray-200">
            <CardTitle className="flex items-center gap-2 print:text-base">
              <TrendingDown className="h-5 w-5 text-red-600 print:h-4 print:w-4" />
              Detalhamento das Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="print:p-0">
            <Table className="print:text-xs">
              <TableHeader>
                <TableRow className="print:border-b print:border-gray-300">
                  <TableHead className="print:py-1 print:text-xs print:font-semibold">Data</TableHead>
                  <TableHead className="print:py-1 print:text-xs print:font-semibold">Descrição</TableHead>
                  <TableHead className="text-right print:py-1 print:text-xs print:font-semibold print:text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((despesa) => (
                  <TableRow key={despesa.id} className="print:border-b print:border-gray-200">
                    <TableCell className="print:py-1 print:text-xs">{formatDate(despesa.data)}</TableCell>
                    <TableCell className="print:py-1 print:text-xs">{despesa.descricao}</TableCell>
                    <TableCell className="text-right font-medium text-red-600 print:py-1 print:text-xs print:text-right">
                      {formatCurrency(despesa.valor)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-medium bg-red-50 print:bg-gray-100 print:border-t print:border-gray-400">
                  <TableCell colSpan={2} className="text-right print:py-1 print:text-xs print:font-semibold">Total:</TableCell>
                  <TableCell className="text-right text-red-700 print:py-1 print:text-xs print:text-right print:font-semibold">
                    {formatCurrency(totalDespesas)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Análise */}
      <Card className="border-slate-200 print:shadow-none print:border print:border-gray-300 print:avoid-break">
        <CardHeader className="print:p-2 print:border-b print:border-gray-200">
          <CardTitle className="print:text-base">Análise do Período</CardTitle>
        </CardHeader>
        <CardContent className="print:p-2">
          <div className="space-y-4 print:space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:grid-cols-2">
              <div>
                <h4 className="font-medium text-slate-700 mb-2 print:text-sm print:mb-1">Métricas de Performance</h4>
                <ul className="space-y-1 text-sm text-slate-600 print:text-xs print:space-y-0">
                  <li>• Número de locações: {locacoes.length}</li>
                  <li>• Receita média por locação: {locacoes.length > 0 ? formatCurrency(totalReceitas / locacoes.length) : formatCurrency(0)}</li>
                  <li>• Número de despesas: {despesas.length}</li>
                  <li>• Despesa média: {despesas.length > 0 ? formatCurrency(totalDespesas / despesas.length) : formatCurrency(0)}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2 print:text-sm print:mb-1">Indicadores Financeiros</h4>
                <ul className="space-y-1 text-sm text-slate-600 print:text-xs print:space-y-0">
                  <li>• Margem de lucro: {totalReceitas > 0 ? `${((lucroLiquido / totalReceitas) * 100).toFixed(1)}%` : '0%'}</li>
                  <li>• ROI do período: {totalDespesas > 0 ? `${((lucroLiquido / totalDespesas) * 100).toFixed(1)}%` : 'N/A'}</li>
                  <li>• Taxa de despesas: {totalReceitas > 0 ? `${((totalDespesas / totalReceitas) * 100).toFixed(1)}%` : '0%'}</li>
                  <li className={`font-medium print:font-semibold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
