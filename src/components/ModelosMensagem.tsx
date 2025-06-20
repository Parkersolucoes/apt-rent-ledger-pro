
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useModelosMensagem } from '@/hooks/useModelosMensagem';
import { NovoModeloMensagem, ModeloMensagem } from '@/types/modeloMensagem';
import { Plus, Edit, Trash2, MessageCircle } from 'lucide-react';
import { ConfirmacaoExclusao } from './ConfirmacaoExclusao';

export const ModelosMensagem = () => {
  const { modelos, loading, criarModelo, atualizarModelo, excluirModelo } = useModelosMensagem();
  const [showModal, setShowModal] = useState(false);
  const [modeloEditando, setModeloEditando] = useState<ModeloMensagem | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [modeloParaExcluir, setModeloParaExcluir] = useState<ModeloMensagem | null>(null);

  const [formData, setFormData] = useState<NovoModeloMensagem>({
    nome: '',
    titulo: '',
    conteudo: '',
    variaveis: [],
    ativo: true
  });

  const variaveisDisponiveis = [
    'nome_proprietario',
    'apartamento', 
    'valor_total',
    'comissao_total',
    'limpeza_total',
    'valor_proprietario',
    'total_locacoes',
    'periodo'
  ];

  const resetForm = () => {
    setFormData({
      nome: '',
      titulo: '',
      conteudo: '',
      variaveis: [],
      ativo: true
    });
    setModeloEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sucesso = modeloEditando 
      ? await atualizarModelo(modeloEditando.id, formData)
      : await criarModelo(formData);

    if (sucesso) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleEditar = (modelo: ModeloMensagem) => {
    setModeloEditando(modelo);
    setFormData({
      nome: modelo.nome,
      titulo: modelo.titulo,
      conteudo: modelo.conteudo,
      variaveis: modelo.variaveis,
      ativo: modelo.ativo
    });
    setShowModal(true);
  };

  const handleExcluir = (modelo: ModeloMensagem) => {
    setModeloParaExcluir(modelo);
    setShowConfirmacao(true);
  };

  const confirmarExclusao = async () => {
    if (modeloParaExcluir) {
      await excluirModelo(modeloParaExcluir.id);
      setShowConfirmacao(false);
      setModeloParaExcluir(null);
    }
  };

  const extrairVariaveis = (texto: string): string[] => {
    const regex = /{{([^}]+)}}/g;
    const variaveis = new Set<string>();
    let match;
    
    while ((match = regex.exec(texto)) !== null) {
      variaveis.add(match[1]);
    }
    
    return Array.from(variaveis);
  };

  const handleConteudoChange = (novoConteudo: string) => {
    const variaveisEncontradas = extrairVariaveis(novoConteudo);
    setFormData({
      ...formData,
      conteudo: novoConteudo,
      variaveis: variaveisEncontradas
    });
  };

  return (
    <div className="min-h-screen gradient-bg-page p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Modelos de Mensagem WhatsApp</h2>
            <p className="text-muted-foreground">
              Gerencie modelos de mensagem para envio de relatórios
            </p>
          </div>
          
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Modelo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {modeloEditando ? 'Editar Modelo' : 'Novo Modelo'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Modelo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Relatório Mensal"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="titulo">Título da Mensagem</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      placeholder="Ex: Relatório Financeiro"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="conteudo">Conteúdo da Mensagem</Label>
                  <Textarea
                    id="conteudo"
                    value={formData.conteudo}
                    onChange={(e) => handleConteudoChange(e.target.value)}
                    placeholder="Use {{variavel}} para inserir dados dinâmicos"
                    rows={8}
                    required
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>Variáveis disponíveis:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {variaveisDisponiveis.map(variavel => (
                        <span 
                          key={variavel} 
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs cursor-pointer"
                          onClick={() => {
                            const novoConteudo = formData.conteudo + `{{${variavel}}}`;
                            handleConteudoChange(novoConteudo);
                          }}
                        >
                          {variavel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.variaveis.length > 0 && (
                  <div>
                    <Label>Variáveis detectadas:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.variaveis.map(variavel => (
                        <span key={variavel} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {variavel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                  />
                  <Label htmlFor="ativo">Modelo ativo</Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {modeloEditando ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-professional-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Modelos Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">Carregando modelos...</div>
            ) : modelos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum modelo cadastrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Variáveis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelos.map((modelo) => (
                    <TableRow key={modelo.id}>
                      <TableCell className="font-medium">{modelo.nome}</TableCell>
                      <TableCell>{modelo.titulo}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {modelo.variaveis.map(variavel => (
                            <span key={variavel} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                              {variavel}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          modelo.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {modelo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditar(modelo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExcluir(modelo)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <ConfirmacaoExclusao
          isOpen={showConfirmacao}
          onClose={() => {
            setShowConfirmacao(false);
            setModeloParaExcluir(null);
          }}
          onConfirm={confirmarExclusao}
          titulo="Excluir Modelo"
          mensagem={`Tem certeza que deseja excluir o modelo "${modeloParaExcluir?.nome}"?`}
        />
      </div>
    </div>
  );
};
