import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, FileText, Send, Mail } from 'lucide-react';
import { useContratos } from '@/hooks/useContratos';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useToast } from '@/hooks/use-toast';
import { Contrato } from '@/types/contrato';
import { WhatsAppModalContrato } from './WhatsAppModalContrato';
import { EmailModalContrato } from './EmailModalContrato';
import { generateContractPDF } from '@/utils/pdf/pdfContractGenerator';
import { enviarPDFWhatsApp } from '@/utils/whatsapp';
import { supabase } from '@/integrations/supabase/client';

interface FormularioContratoProps {
  contrato?: Contrato | null;
  onVoltar: () => void;
}

export const FormularioContrato = ({ contrato, onVoltar }: FormularioContratoProps) => {
  const { criarContrato, atualizarContrato, templates } = useContratos();
  const { apartamentos } = useApartamentos();
  const { empresa } = useEmpresa();
  const { configEvolution } = useConfiguracoes();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    proprietario_nome: '',
    apartamento_numero: '',
    data_assinatura: '',
    data_vencimento: '',
    status: 'rascunho' as 'rascunho' | 'enviado' | 'assinado' | 'vencido' | 'cancelado',
    percentual_comissao: '',
    valor_mensal: '',
    observacoes: ''
  });

  const [templateSelecionado, setTemplateSelecionado] = useState('');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  useEffect(() => {
    if (contrato) {
      setFormData({
        titulo: contrato.titulo,
        conteudo: contrato.conteudo,
        proprietario_nome: contrato.proprietario_nome,
        apartamento_numero: contrato.apartamento_numero || '',
        data_assinatura: contrato.data_assinatura || '',
        data_vencimento: contrato.data_vencimento || '',
        status: contrato.status,
        percentual_comissao: contrato.percentual_comissao?.toString() || '',
        valor_mensal: contrato.valor_mensal?.toString() || '',
        observacoes: contrato.observacoes || ''
      });
    }
  }, [contrato]);

  const handleTemplateChange = (templateId: string) => {
    setTemplateSelecionado(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        titulo: template.titulo,
        conteudo: template.conteudo
      }));
    }
  };

  const preencherComProprietario = (apartamentoNumero: string) => {
    const apartamento = apartamentos.find(apt => apt.numero === apartamentoNumero);
    if (apartamento) {
      setFormData(prev => ({
        ...prev,
        proprietario_nome: apartamento.proprietario || '',
        apartamento_numero: apartamentoNumero
      }));
    }
  };

  const processarVariaveis = (conteudo: string) => {
    let conteudoProcessado = conteudo;
    
    // Variáveis do proprietário/apartamento
    const apartamento = apartamentos.find(apt => apt.numero === formData.apartamento_numero);
    if (apartamento) {
      conteudoProcessado = conteudoProcessado
        .replace(/\{\{proprietario_nome\}\}/g, apartamento.proprietario || '')
        .replace(/\{\{proprietario_telefone\}\}/g, apartamento.telefoneProprietario || '')
        .replace(/\{\{apartamento_numero\}\}/g, apartamento.numero)
        .replace(/\{\{apartamento_endereco\}\}/g, apartamento.endereco || '')
        .replace(/\{\{apartamento_descricao\}\}/g, apartamento.descricao || '');
    }

    // Variáveis da empresa
    if (empresa) {
      conteudoProcessado = conteudoProcessado
        .replace(/\{\{empresa_nome\}\}/g, empresa.nome || '')
        .replace(/\{\{empresa_cnpj\}\}/g, empresa.cnpj || '')
        .replace(/\{\{empresa_endereco\}\}/g, empresa.endereco || '')
        .replace(/\{\{empresa_telefone\}\}/g, empresa.telefone || '')
        .replace(/\{\{empresa_email\}\}/g, empresa.email || '')
        .replace(/\{\{empresa_responsavel\}\}/g, empresa.responsavel || '')
        .replace(/\{\{empresa_cargo_responsavel\}\}/g, empresa.cargo_responsavel || '');
    }

    // Outras variáveis
    conteudoProcessado = conteudoProcessado
      .replace(/\{\{percentual_comissao\}\}/g, formData.percentual_comissao)
      .replace(/\{\{valor_mensal\}\}/g, formData.valor_mensal)
      .replace(/\{\{local_data\}\}/g, new Date().toLocaleDateString());

    return conteudoProcessado;
  };

  const handleExportarPDF = () => {
    if (!contrato) {
      toast({
        title: "Erro",
        description: "É necessário salvar o contrato antes de exportar em PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = generateContractPDF(contrato);
      doc.save(`contrato-${contrato.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({
        title: "Sucesso!",
        description: "Contrato exportado em PDF com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF do contrato.",
        variant: "destructive",
      });
    }
  };

  const handleEnviarWhatsApp = async (telefone: string, mensagem: string) => {
    if (!contrato) {
      toast({
        title: "Erro",
        description: "É necessário salvar o contrato antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    if (!configEvolution.apiUrl || !configEvolution.apiKey || !configEvolution.instanceName) {
      toast({
        title: "Erro",
        description: "Configure primeiro as credenciais da Evolution API nas configurações.",
        variant: "destructive",
      });
      return;
    }

    setEnviandoWhatsApp(true);

    try {
      const doc = generateContractPDF(contrato);
      const pdfBlob = doc.output('blob');
      const nomeArquivo = `contrato-${contrato.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`;

      await enviarPDFWhatsApp(
        configEvolution,
        telefone,
        pdfBlob,
        nomeArquivo,
        mensagem
      );

      toast({
        title: "Sucesso!",
        description: "Contrato enviado por WhatsApp com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar contrato por WhatsApp. Verifique as configurações da Evolution API.",
        variant: "destructive",
      });
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  const handleEnviarEmail = async (email: string, assunto: string, mensagem: string) => {
    if (!contrato) {
      toast({
        title: "Erro",
        description: "É necessário salvar o contrato antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setEnviandoEmail(true);

    try {
      const doc = generateContractPDF(contrato);
      const pdfBlob = doc.output('blob');
      const nomeArquivo = `contrato-${contrato.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`;

      const arrayBuffer = await pdfBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('send-contract-email', {
        body: {
          email,
          assunto,
          mensagem,
          pdfBase64: base64,
          nomeArquivo
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Contrato enviado por e-mail com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar contrato por e-mail. Verifique se a configuração do Resend está correta.",
        variant: "destructive",
      });
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const conteudoProcessado = processarVariaveis(formData.conteudo);
    
    const dadosContrato = {
      ...formData,
      conteudo: conteudoProcessado,
      data_criacao: new Date().toISOString().split('T')[0],
      percentual_comissao: formData.percentual_comissao ? parseFloat(formData.percentual_comissao) : undefined,
      valor_mensal: formData.valor_mensal ? parseFloat(formData.valor_mensal) : undefined,
      data_assinatura: formData.data_assinatura || undefined,
      data_vencimento: formData.data_vencimento || undefined
    };

    if (contrato) {
      atualizarContrato.mutate({ id: contrato.id, ...dadosContrato });
    } else {
      criarContrato.mutate(dadosContrato);
    }
    
    onVoltar();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {contrato ? 'Editar Contrato' : 'Novo Contrato'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!contrato && (
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={templateSelecionado} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="apartamento">Apartamento</Label>
                <Select 
                  value={formData.apartamento_numero} 
                  onValueChange={preencherComProprietario}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um apartamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartamentos.map((apt) => (
                      <SelectItem key={apt.id} value={apt.numero}>
                        {apt.numero} - {apt.proprietario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="proprietario">Proprietário</Label>
                <Input
                  id="proprietario"
                  value={formData.proprietario_nome}
                  onChange={(e) => setFormData({ ...formData, proprietario_nome: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="assinado">Assinado</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comissao">Comissão (%)</Label>
                  <Input
                    id="comissao"
                    type="number"
                    step="0.01"
                    value={formData.percentual_comissao}
                    onChange={(e) => setFormData({ ...formData, percentual_comissao: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valor_mensal">Valor Mensal</Label>
                  <Input
                    id="valor_mensal"
                    type="number"
                    step="0.01"
                    value={formData.valor_mensal}
                    onChange={(e) => setFormData({ ...formData, valor_mensal: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_assinatura">Data de Assinatura</Label>
                  <Input
                    id="data_assinatura"
                    type="date"
                    value={formData.data_assinatura}
                    onChange={(e) => setFormData({ ...formData, data_assinatura: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="conteudo">Texto do Contrato</Label>
                <Textarea
                  id="conteudo"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Digite o conteúdo do contrato..."
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Variáveis disponíveis:<br/>
                  <strong>Proprietário/Apartamento:</strong> {`{{proprietario_nome}}, {{apartamento_numero}}, {{apartamento_endereco}}`}<br/>
                  <strong>Empresa:</strong> {`{{empresa_nome}}, {{empresa_cnpj}}, {{empresa_endereco}}, {{empresa_responsavel}}`}<br/>
                  <strong>Contrato:</strong> {`{{percentual_comissao}}, {{valor_mensal}}, {{local_data}}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button type="submit" disabled={criarContrato.isPending || atualizarContrato.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {contrato ? 'Atualizar' : 'Criar'} Contrato
          </Button>
          
          <Button type="button" variant="outline" onClick={onVoltar}>
            Cancelar
          </Button>

          {contrato && (
            <>
              <Button type="button" variant="outline" onClick={handleExportarPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowWhatsAppModal(true)}
                disabled={enviandoWhatsApp}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar WhatsApp
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEmailModal(true)}
                disabled={enviandoEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar E-mail
              </Button>
            </>
          )}
        </div>
      </form>

      {contrato && (
        <>
          <WhatsAppModalContrato
            open={showWhatsAppModal}
            onOpenChange={setShowWhatsAppModal}
            contrato={contrato}
            onEnviar={handleEnviarWhatsApp}
            enviando={enviandoWhatsApp}
          />

          <EmailModalContrato
            open={showEmailModal}
            onOpenChange={setShowEmailModal}
            contrato={contrato}
            onEnviar={handleEnviarEmail}
            enviando={enviandoEmail}
          />
        </>
      )}
    </div>
  );
};
