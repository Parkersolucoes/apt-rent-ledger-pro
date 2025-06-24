
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Edit, Trash2 } from 'lucide-react';
import { useContratos } from '@/hooks/useContratos';
import { FormularioContrato } from './FormularioContrato';
import { Contrato } from '@/types/contrato';

export const Contratos = () => {
  const [busca, setBusca] = useState('');
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const { contratos, isLoadingContratos, excluirContrato } = useContratos();

  const contratosFiltrados = contratos.filter(contrato =>
    contrato.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    contrato.proprietario_nome.toLowerCase().includes(busca.toLowerCase()) ||
    (contrato.apartamento_numero && contrato.apartamento_numero.toLowerCase().includes(busca.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assinado': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleNovoContrato = () => {
    setContratoSelecionado(null);
    setMostrarFormulario(true);
  };

  const handleEditarContrato = (contrato: Contrato) => {
    setContratoSelecionado(contrato);
    setMostrarFormulario(true);
  };

  const handleExcluirContrato = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      excluirContrato.mutate(id);
    }
  };

  if (mostrarFormulario) {
    return (
      <FormularioContrato
        contrato={contratoSelecionado}
        onVoltar={() => setMostrarFormulario(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground">
            Gerencie os contratos de autorização com proprietários
          </p>
        </div>
        <Button onClick={handleNovoContrato}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Contratos</CardTitle>
          <CardDescription>
            Encontre contratos por título, proprietário ou apartamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite para buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {isLoadingContratos ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contratosFiltrados.map((contrato) => (
            <Card key={contrato.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{contrato.titulo}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {contrato.proprietario_nome}
                    </p>
                    {contrato.apartamento_numero && (
                      <p className="text-sm text-muted-foreground">
                        Apt: {contrato.apartamento_numero}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(contrato.status)}>
                    {contrato.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Criado: {new Date(contrato.data_criacao).toLocaleDateString()}</p>
                  {contrato.data_assinatura && (
                    <p>Assinado: {new Date(contrato.data_assinatura).toLocaleDateString()}</p>
                  )}
                  {contrato.percentual_comissao && (
                    <p>Comissão: {contrato.percentual_comissao}%</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarContrato(contrato)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExcluirContrato(contrato.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {contratosFiltrados.length === 0 && !isLoadingContratos && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              {busca
                ? 'Não encontramos contratos com os termos pesquisados.'
                : 'Você ainda não possui contratos cadastrados.'}
            </p>
            <Button onClick={handleNovoContrato}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Contrato
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
