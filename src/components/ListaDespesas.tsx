
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
import { Trash2, Edit, Calendar, Building } from 'lucide-react';

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

  const handleEditar = (id: string) => {
    console.log('Editando despesa:', id);
    // TODO: Implementar edição
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
                <Select value={filtros.apartamento || 'todos'} onValueChange={(value) => setFiltros({...filtros, apartamento: value === 'todos' ? undefined : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
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

        {/* Grid de Despesas */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {despesasFiltradas.map((despesa) => (
                  <div
                    key={despesa.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-primary" />
                        <span className="font-semibold text-sm">Apt {despesa.apartamento}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditar(despesa.id)}
                          className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExcluir(despesa.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-foreground font-medium line-clamp-2">
                      {despesa.descricao}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(despesa.data)}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(despesa.valor)}
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
