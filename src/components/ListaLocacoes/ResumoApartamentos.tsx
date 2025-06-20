
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { useDespesas } from '@/hooks/useDespesas';

interface ResumoApartamentosProps {
  apartamentos: string[];
  totaisPorApartamento: Record<string, {
    valorTotal: number;
    totalLimpeza: number;
    comissaoTotal: number;
    valorProprietario: number;
    quantidade: number;
  }>;
}

export const ResumoApartamentos = ({ apartamentos, totaisPorApartamento }: ResumoApartamentosProps) => {
  const { obterTotalDespesasPorApartamento } = useDespesas();

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl">Resumo por Apartamento</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apartamentos.map((apartamento) => {
            const totais = totaisPorApartamento[apartamento];
            const totalDespesas = obterTotalDespesasPorApartamento(apartamento);
            const valorLiquidoProprietario = totais?.valorProprietario - totalDespesas || 0;
            
            if (!totais || totais.quantidade === 0) return null;
            
            return (
              <div
                key={apartamento}
                className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
              >
                <h3 className="font-semibold text-lg text-blue-900 mb-3">
                  Apartamento {apartamento}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Locações:</span>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {totais.quantidade}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receita Total:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(totais.valorTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa Limpeza:</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(totais.totalLimpeza)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comissão:</span>
                    <span className="font-medium text-purple-600">
                      {formatCurrency(totais.comissaoTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Despesas:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(totalDespesas)}
                    </span>
                  </div>
                  <hr className="border-blue-200" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-blue-900">Valor Líquido:</span>
                    <span className={`${valorLiquidoProprietario >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(valorLiquidoProprietario)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
