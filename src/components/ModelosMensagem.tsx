import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModelosMensagem } from '@/hooks/useModelosMensagem';
import { ModeloMensagem, NovoModeloMensagem, VariaveisTemplate } from '@/types/modeloMensagem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

export const ModelosMensagem = () => {
  const { modelos, loading, criarModelo, atualizarModelo, excluirModelo, processarTemplate } = useModelosMensagem();
  
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modeloEditando, setModeloEditando] = useState<ModeloMensagem | null>(null);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<{
    aberto: boolean;
    modelo: ModeloMensagem | null;
  }>({ aberto: false, modelo: null });
  const [previewAberto, setPreviewAberto] = useState(false);
  const [modeloPreview, setModeloPreview] = useState<ModeloMensagem | null>(null);
  const [variaveisPreview, setVariaveisPreview] = useState<Record<string, string>>({});

  const [formulario, setFormulario] = useState<NovoModeloMensagem>({
    nome: '',
    titulo: '',
    conteudo: '',
    variaveis: [],
    ativo: true
  });

  const resetFormulario = () => {
    setFormulario({
      nome: '',
      titulo: '',
      conteudo: '',
      variaveis: [],
      ativo: true
    });
    setModeloEditando(null);
  };

  const abrirEdicao = (modelo: ModeloMensagem) => {
    setFormulario({
      nome: modelo.nome,
      titulo: modelo.titulo,
      conteudo: modelo.conteudo,
      variaveis: modelo.variaveis,
      ativo: modelo.ativo
    });
    setModeloEditando(modelo);
    setDialogAberto(true);
  };

  const abrirPreview = (modelo: ModeloMensagem) => {
    setModeloPreview(modelo);
    const variaveisIniciais: Record<string, string> = {};
    modelo.variaveis.forEach(variavel => {
      variaveisIniciais[variavel] = '';
    });
    setVariaveisPreview(variaveisIniciais);
    setPreviewAberto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (modeloEditando) {
      sucesso = await atualizarModelo(modeloEditando.id, formulario);
    } else {
      sucesso = await criarModelo(formulario);
    }

    if (sucesso) {
      setDialogAberto(false);
      resetFormulario();
    }
  };

  const handleExcluir = async () => {
    if (confirmacaoExclusao.modelo) {
      await excluirModelo(confirmacaoExclusao.modelo.id);
      setConfirmacaoExclusao({ aberto: false, modelo: null });
    }
  };

  const adicionarVariavel = (variavel: string) => {
    if (!formulario.variaveis.includes(variavel)) {
      setFormulario(prev => ({
        ...prev,
        variaveis: [...prev.variaveis, variavel]
      }));
    }
  };

  const removerVariavel = (variavel: string) => {
    setFormulario(prev => ({
      ...prev,
      variaveis: prev.variaveis.filter(v => v !== variavel)
    }));
  };

  const inserirVariavelNoConteudo = (variavel: string) => {
    const textarea = document.querySelector('textarea[name="conteudo"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variavel}}}` + after;
      
      setFormulario(prev => ({
        ...prev,
        conteudo: newText
      }));

      // Reposicionar cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variavel.length + 4;
        textarea.focus();
      }, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando modelos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Modelos de Mensagem</h1>
          <p className="text-gray-600 mt-2">Gerencie templates para envio via WhatsApp</p>
        </div>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetFormulario(); setDialogAberto(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {modeloEditando ? 'Editar Modelo' : 'Novo Modelo'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Modelo</Label>
                  <Input
                    id="nome"
                    value={formulario.nome}
                    onChange={(e) => setFormulario(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Relatório Mensal"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Mensagem</Label>
                  <Input
                    id="titulo"
                    value={formulario.titulo}
                    onChange={(e) => setFormulario(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Relatório Financeiro"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo da Mensagem</Label>
                <Textarea
                  id="conteudo"
                  name="conteudo"
                  value={formulario.conteudo}
                  onChange={(e) => setFormulario(prev => ({ ...prev, conteudo: e.target.value }))}
                  placeholder="Digite o conteúdo da mensagem. Use {{variavel}} para inserir dados dinâmicos."
                  rows={8}
                  required
                />
                <p className="text-sm text-gray-500">
                  Use variáveis como {`{{nome_proprietario}}`} para inserir dados dinâmicos
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Variáveis Disponíveis</Label>
                  <Select onValueChange={inserirVariavelNoConteudo}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Inserir variável" />
                    </SelectTrigger>
                    <SelectContent>
                      {variaveisDisponiveis.map(variavel => (
                        <SelectItem key={variavel} value={variavel}>
                          {`{{${variavel}}}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  {variaveisDisponiveis.map(variavel => (
                    <Badge
                      key={variavel}
                      variant={formulario.variaveis.includes(variavel) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formulario.variaveis.includes(variavel)) {
                          removerVariavel(variavel);
                        } else {
                          adicionarVariavel(variavel);
                        }
                      }}
                    >
                      {variavel}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formulario.ativo}
                  onCheckedChange={(checked) => setFormulario(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo">Modelo ativo</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {modeloEditando ? 'Atualizar' : 'Criar'} Modelo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelos.map((modelo) => (
          <Card key={modelo.id} className={`${!modelo.ativo ? 'opacity-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{modelo.nome}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{modelo.titulo}</p>
                </div>
                <Badge variant={modelo.ativo ? "default" : "secondary"}>
                  {modelo.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Conteúdo:</p>
                  <p className="text-sm bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                    {modelo.conteudo.length > 100 
                      ? `${modelo.conteudo.substring(0, 100)}...` 
                      : modelo.conteudo}
                  </p>
                </div>

                {modelo.variaveis.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Variáveis:</p>
                    <div className="flex flex-wrap gap-1">
                      {modelo.variaveis.map(variavel => (
                        <Badge key={variavel} variant="outline" className="text-xs">
                          {variavel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirPreview(modelo)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirEdicao(modelo)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmacaoExclusao({ aberto: true, modelo })}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modelos.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-500 mb-4">Nenhum modelo cadastrado ainda.</p>
            <Button onClick={() => setDialogAberto(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Modelo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Preview */}
      <Dialog open={previewAberto} onOpenChange={setPreviewAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview do Modelo: {modeloPreview?.nome}</DialogTitle>
          </DialogHeader>
          
          {modeloPreview && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preencha as variáveis para ver o preview:</Label>
                {modeloPreview.variaveis.map(variavel => (
                  <div key={variavel}>
                    <Label htmlFor={variavel} className="text-sm">{variavel}</Label>
                    <Input
                      id={variavel}
                      value={variaveisPreview[variavel] || ''}
                      onChange={(e) => setVariaveisPreview(prev => ({
                        ...prev,
                        [variavel]: e.target.value
                      }))}
                      placeholder={`Digite ${variavel}`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Preview da Mensagem:</Label>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <p className="font-medium text-green-800 mb-2">{modeloPreview.titulo}</p>
                  <div className="whitespace-pre-wrap text-sm text-green-700">
                    {processarTemplate(modeloPreview.conteudo, variaveisPreview)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setPreviewAberto(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={confirmacaoExclusao.aberto} onOpenChange={(open) => setConfirmacaoExclusao({ aberto: open, modelo: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Modelo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o modelo "{confirmacaoExclusao.modelo?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
