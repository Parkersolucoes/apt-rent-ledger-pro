
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDespesas } from '@/hooks/useDespesas';
import { useApartamentos } from '@/hooks/useApartamentos';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { FiltrosDespesa } from '@/types/despesa';
import { toast } from '@/hooks/use-toast';
import { Trash2, Receipt, Calendar, Building } from 'lucide-react';

export const ListaDespesas = () => {
  const { despesas, filtrarDespesas, removerDespesa, obterApartamentos } = useDespesas();
  const { obterNumerosApartamentos } = useApartamentos();
  const [filtros, setFiltros] = useState<FiltrosDespesa>({});

  const apartamentosDisponiveis = obterNumerosApartamentos();
  const apartamentosComDespesas = obterApartamentos();
  const despesasFiltradas = filtrarDespesas(filtros);

  const limparFiltros = () => {
    setFiltros({});
  };

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      await removerDespesa(id);
      toast({
        title: "Sucesso!",
        description: "Despesa excluída com sucesso.",
      });
    }
  };

  const totalDespesas = despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Filtros */}
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-xl">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="apartamento" className="font-semibold">Apartamento</Label>
                <Select value={filtros.apartamento || ''} onValueChange={(value) => setFiltros({...filtros, apartamento: value || undefined})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {apartamentosComDespesas.map((numero) => (
                      <SelectItem key={numero} value={numero}>
                        Apartamento {numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dataInicio" className="font-semibold">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtros.dataInicio ? filtros.dataInicio.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value ? new Date(e.target.value) : undefined})}
                />
              </div>

              <div>
                <Label htmlFor="dataFim" className="font-semibold">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filtros.dataFim ? filtros.dataFim.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value ? new Date(e.target.value) : undefined})}
                />
              </div>

              <div>
                <Button 
                  onClick={limparFiltros}
                  variant="outline"
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Despesas */}
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-xl">
              <span>Despesas ({despesasFiltradas.length})</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                Total: {formatCurrency(totalDespesas)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {despesasFiltradas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma despesa encontrada com os filtros aplicados.
              </p>
            ) : (
              <div className="space-y-4">
                {despesasFiltradas.map((despesa) => (
                  <div
                    key={despesa.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">Apartamento {despesa.apartamento}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-blue-600" />
                          <span className="text-foreground">{despesa.descricao}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(despesa.data)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(despesa.valor)}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExcluir(despesa.id)}
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
      </div>
    </div>
  );
};
