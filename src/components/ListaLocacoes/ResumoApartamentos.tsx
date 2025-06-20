
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { House } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TotaisApartamento {
  valorTotal: number;
  totalLimpeza: number;
  comissaoTotal: number;
  valorProprietario: number;
  quantidade: number;
}

interface ResumoApartamentosProps {
  apartamentos: string[];
  totaisPorApartamento: Record<string, TotaisApartamento>;
}

export const ResumoApartamentos = ({ 
  apartamentos, 
  totaisPorApartamento 
}: ResumoApartamentosProps) => {
  if (apartamentos.length === 0) return null;

  return (
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
                    <span className="text-muted-foreground">Total Limpeza:</span>
                    <span className="font-medium text-orange-600">{formatCurrency(totais.totalLimpeza)}</span>
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
  );
};
