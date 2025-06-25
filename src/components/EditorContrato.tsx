import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApartamentos } from '@/hooks/useApartamentos';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useContratos } from '@/hooks/useContratos';
import { Contrato } from '@/types/contrato';
import { templateContratoHappyCaldas } from '@/utils/templates/contratoHappyCaldas';

interface EditorContratoProps {
  contrato: Contrato;
  onVoltar: () => void;
}

export const EditorContrato = ({ contrato, onVoltar }: EditorContratoProps) => {
  const [templateContent, setTemplateContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const { toast } = useToast();
  const { apartamentos } = useApartamentos();
  const { empresa } = useEmpresa();
  const { atualizarContrato } = useContratos();

  useEffect(() => {
    // Inicializar com o template padrão se não houver conteúdo
    const initialContent = contrato.conteudo || templateContratoHappyCaldas;
    setTemplateContent(initialContent);
  }, [contrato]);

  useEffect(() => {
    // Atualizar preview sempre que o template mudar
    const preview = processarTemplate(templateContent);
    setPreviewContent(preview);
  }, [templateContent, apartamentos, empresa]);

  const gerarVariaveisContrato = () => {
    const apartamento = apartamentos.find(apt => apt.numero === contrato.apartamento_numero);
    
    return {
      // Dados da empresa
      empresa_nome: empresa?.nome || '',
      empresa_razao_social: empresa?.razao_social || empresa?.nome || '',
      empresa_nome_fantasia: empresa?.nome_fantasia || empresa?.nome || '',
      empresa_cnpj: empresa?.cnpj || '',
      empresa_endereco: empresa?.endereco || '',
      empresa_cidade: 'Caldas Novas',
      empresa_estado: 'Goiás',
      empresa_telefone: empresa?.telefone || '',
      empresa_telefone_secundario: empresa?.telefone_secundario || '',
      empresa_email: empresa?.email || '',
      empresa_responsavel: empresa?.responsavel || '',
      empresa_cpf_responsavel: empresa?.cpf_responsavel || '',
      
      // Dados do proprietário - agora vindos do cadastro do apartamento
      proprietario_nome: apartamento?.proprietario || contrato.proprietario_nome,
      proprietario_cpf: apartamento?.cpfProprietario || '',
      proprietario_data_nascimento: apartamento?.dataNascimentoProprietario || '',
      proprietario_nacionalidade: apartamento?.nacionalidadeProprietario || 'BRASILEIRA',
      proprietario_estado_civil: apartamento?.estadoCivilProprietario || '',
      proprietario_profissao: apartamento?.profissaoProprietario || '',
      proprietario_rg: apartamento?.rgProprietario || '',
      proprietario_orgao_expeditor: apartamento?.orgaoExpeditorProprietario || '',
      proprietario_email: apartamento?.emailProprietario || '',
      proprietario_endereco: apartamento?.enderecoProprietario || '',
      proprietario_telefone: apartamento?.telefoneProprietario || '',
      proprietario_banco: apartamento?.bancoProprietario || '',
      proprietario_agencia: apartamento?.agenciaProprietario || '',
      proprietario_conta: apartamento?.contaProprietario || '',
      proprietario_pix: apartamento?.pixProprietario || '',
      proprietario_tipo_conta: apartamento?.tipoContaProprietario || '',
      proprietario_titular_conta: apartamento?.titularContaProprietario || apartamento?.proprietario || contrato.proprietario_nome,
      proprietario_cpf_titular: apartamento?.cpfTitularProprietario || apartamento?.cpfProprietario || '',
      
      // Dados do apartamento
      apartamento_numero: contrato.apartamento_numero || '',
      apartamento_torre: '',
      apartamento_caracteristicas: apartamento?.descricao || '',
      apartamento_capacidade: '8',
      apartamento_endereco: apartamento?.endereco || '',
      
      // Dados do condomínio
      condominio_nome: 'EVIAN THERMAS RESIDENCE',
      condominio_telefone: '(64) 3453-7270',
      condominio_endereco: apartamento?.endereco || '',
      condominio_caracteristicas: 'Situado aproximadamente a 800m do centro da cidade, possui ampla área de lazer com piscina coberta, piscina de borda infinita, piscina com bar molhado, piscina com cascata, 2 piscinas infantil, playground infantil seco e molhado, brinquedoteca, cinema, salão de jogos, Saunas, Hidromassagem, restaurante, Lanchonete, Recepção 24h.',
      
      // Dados do contrato
      titulo_contrato: contrato.titulo,
      status_contrato: contrato.status,
      data_criacao: new Date(contrato.data_criacao).toLocaleDateString(),
      data_assinatura: contrato.data_assinatura ? new Date(contrato.data_assinatura).toLocaleDateString() : new Date().toLocaleDateString(),
      contrato_data_inicio: contrato.data_assinatura ? new Date(contrato.data_assinatura).toLocaleDateString() : new Date().toLocaleDateString(),
      contrato_data_fim: contrato.data_vencimento ? new Date(contrato.data_vencimento).toLocaleDateString() : '',
      contrato_prazo_meses: '12',
      percentual_comissao: contrato.percentual_comissao?.toString() || '20',
      valor_mensal: contrato.valor_mensal?.toString() || '0'
    };
  };

  const processarTemplate = (template: string) => {
    const variaveis = gerarVariaveisContrato();
    let resultado = template;

    // Substituir todas as variáveis no formato {{variavel}}
    Object.entries(variaveis).forEach(([chave, valor]) => {
      const regex = new RegExp(`{{${chave}}}`, 'g');
      resultado = resultado.replace(regex, valor || '');
    });

    return resultado;
  };

  const handleSalvar = async () => {
    try {
      const variaveisContrato = gerarVariaveisContrato();
      
      await atualizarContrato.mutateAsync({
        id: contrato.id,
        conteudo: templateContent,
        variaveis: variaveisContrato
      });
      
      toast({
        title: "Sucesso",
        description: "Template do contrato salvo com sucesso!",
      });
      
      onVoltar();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar template. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const inserirVariavel = (variavel: string) => {
    const textarea = document.getElementById('template-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = templateContent;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{{${variavel}}}` + after;
      
      setTemplateContent(newText);
      
      // Reposicionar cursor após inserir
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variavel.length + 4, start + variavel.length + 4);
      }, 0);
    }
  };

  const variaveisDisponiveis = Object.keys(gerarVariaveisContrato()).sort();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          Editor de Contrato: {contrato.titulo}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com variáveis */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground mb-2">
              Clique para inserir no template:
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {variaveisDisponiveis.map((variavel) => (
                <Button
                  key={variavel}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-1 px-2"
                  onClick={() => inserirVariavel(variavel)}
                >
                  {variavel}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor principal */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="editor" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="editor">
                  <Edit className="w-4 h-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <Button onClick={handleSalvar} disabled={atualizarContrato.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {atualizarContrato.isPending ? 'Salvando...' : 'Salvar Template'}
              </Button>
            </div>

            <TabsContent value="editor">
              <Card>
                <CardHeader>
                  <CardTitle>Template do Contrato</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Use variáveis no formato {`{{nome_da_variavel}}`} para inserir dados dinâmicos
                  </p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="template-textarea"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    className="min-h-96 font-mono text-sm"
                    placeholder="Digite o template do contrato aqui..."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Preview do Contrato</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Visualização com as variáveis substituídas pelos valores reais
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 min-h-96 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-serif leading-relaxed">
                      {previewContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
