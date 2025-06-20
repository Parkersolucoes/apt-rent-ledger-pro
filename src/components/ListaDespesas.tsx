
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useDespesas } from '@/hooks/useDespesas';
import { Despesa } from '@/types/despesa';
import { Trash2, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ListaDespesas = () => {
  const { despesas, removerDespesa } = useDespesas();

  const handleExcluir = async (despesa: Despesa) => {
    if (window.confirm(`Tem certeza que deseja excluir a despesa "${despesa.descricao}"?`)) {
      await removerDespesa(despesa.id);
      toast({
        title: "Sucesso!",
        description: "Despesa excluída com sucesso.",
      });
    }
  };

  // Agrupar despesas por apartamento
  const despesasPorApartamento = despesas.reduce((acc, despesa) => {
    if (!acc[despesa.apartamento]) {
      acc[despesa.apartamento] = [];
    }
    acc[despesa.apartamento].push(despesa);
    return acc;
  }, {} as Record<string, Despesa[]>);

  return (
    <div className="min-h-screen gradient-bg-page p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="shadow-professional-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Receipt className="h-5 w-5" />
              Despesas Cadastradas ({despesas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {despesas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma despesa cadastrada ainda.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(despesasPorApartamento).map(([apartamento, despesasApt]) => {
                  const totalApartamento = despesasApt.reduce((sum, d) => sum + d.valor, 0);
                  
                  return (
                    <Card key={apartamento} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>Apartamento {apartamento}</span>
                          <span className="text-red-600 font-bold">
                            Total: {formatCurrency(totalApartamento)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {despesasApt.map((despesa) => (
                            <div
                              key={despesa.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{despesa.descricao}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(despesa.data)}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-bold text-red-600">
                                    {formatCurrency(despesa.valor)}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExcluir(despesa)}
                                  className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
