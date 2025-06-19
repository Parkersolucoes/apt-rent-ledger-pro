
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useToast } from '@/hooks/use-toast';
import { FormularioApartamento } from './FormularioApartamento';
import { ConfirmacaoExclusao } from './ConfirmacaoExclusao';
import { Apartamento } from '@/types/apartamento';
import { Plus, Pencil, Trash2, Search, Building, User } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const ListaApartamentos = () => {
  const { apartamentos, removerApartamento } = useApartamentos();
  const { toast } = useToast();

  const [filtro, setFiltro] = useState('');
  const [apartamentoParaEditar, setApartamentoParaEditar] = useState<Apartamento | null>(null);
  const [apartamentoParaExcluir, setApartamentoParaExcluir] = useState<Apartamento | null>(null);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [sheetAberto, setSheetAberto] = useState(false);

  const apartamentosFiltrados = apartamentos.filter(apartamento =>
    apartamento.numero.toLowerCase().includes(filtro.toLowerCase()) ||
    apartamento.proprietario?.toLowerCase().includes(filtro.toLowerCase()) ||
    apartamento.endereco?.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleEditar = (apartamento: Apartamento) => {
    setApartamentoParaEditar(apartamento);
    setSheetAberto(true);
  };

  const handleExcluir = (apartamento: Apartamento) => {
    setApartamentoParaExcluir(apartamento);
  };

  const confirmarExclusao = () => {
    if (apartamentoParaExcluir) {
      removerApartamento(apartamentoParaExcluir.id);
      toast({
        title: "Sucesso",
        description: `Apartamento ${apartamentoParaExcluir.numero} excluído com sucesso!`,
      });
      setApartamentoParaExcluir(null);
    }
  };

  const handleSucessoFormulario = () => {
    setSheetAberto(false);
    setApartamentoParaEditar(null);
    setMostrandoFormulario(false);
  };

  const abrirNovoApartamento = () => {
    setApartamentoParaEditar(null);
    setMostrandoFormulario(true);
    setSheetAberto(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Apartamentos</h2>
          <p className="text-gray-600">
            Cadastre e gerencie seus apartamentos
          </p>
        </div>
        <Button onClick={abrirNovoApartamento}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Apartamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Lista de Apartamentos ({apartamentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por número, proprietário ou endereço..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>

          {apartamentosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {apartamentos.length === 0 
                ? "Nenhum apartamento cadastrado ainda."
                : "Nenhum apartamento encontrado com os filtros aplicados."
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apartamentosFiltrados.map((apartamento) => (
                <Card key={apartamento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-blue-600">
                          {apartamento.numero}
                        </div>
                        <Badge variant={apartamento.ativo ? "default" : "secondary"}>
                          {apartamento.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditar(apartamento)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExcluir(apartamento)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {apartamento.proprietario && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="h-3 w-3" />
                        {apartamento.proprietario}
                      </div>
                    )}

                    {apartamento.endereco && (
                      <div className="text-sm text-gray-500 mb-2">
                        {apartamento.endereco}
                      </div>
                    )}

                    {apartamento.descricao && (
                      <div className="text-sm text-gray-400 line-clamp-2">
                        {apartamento.descricao}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {apartamentoParaEditar ? 'Editar Apartamento' : 'Novo Apartamento'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FormularioApartamento
              apartamento={apartamentoParaEditar || undefined}
              onSuccess={handleSucessoFormulario}
              onCancel={() => setSheetAberto(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmacaoExclusao
        apartamento={apartamentoParaExcluir}
        open={!!apartamentoParaExcluir}
        onOpenChange={(open) => !open && setApartamentoParaExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
};
