import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"
import { useApartamentos } from '@/hooks/useApartamentos';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useContratos } from '@/hooks/useContratos';
import { Contrato } from '@/types/contrato';

interface FormularioContratoProps {
  contrato?: Contrato | null;
  onVoltar: () => void;
}

export const FormularioContrato = ({ contrato, onVoltar }: FormularioContratoProps) => {
  const [formData, setFormData] = useState({
    titulo: '',
    apartamento_numero: '',
    proprietario_nome: '',
    data_criacao: new Date(),
    data_assinatura: new Date(),
    data_vencimento: new Date(),
    valor_mensal: 0,
    percentual_comissao: 20,
    status: 'rascunho' as Contrato['status'],
    observacoes: '',
  });

  const { toast } = useToast();
  const { apartamentos } = useApartamentos();
  const { empresa } = useEmpresa();
  const { criarContrato, atualizarContrato } = useContratos();

  useEffect(() => {
    if (contrato) {
      setFormData({
        titulo: contrato.titulo,
        apartamento_numero: contrato.apartamento_numero || '',
        proprietario_nome: contrato.proprietario_nome,
        data_criacao: new Date(contrato.data_criacao),
        data_assinatura: contrato.data_assinatura ? new Date(contrato.data_assinatura) : new Date(),
        data_vencimento: contrato.data_vencimento ? new Date(contrato.data_vencimento) : new Date(),
        valor_mensal: contrato.valor_mensal || 0,
        percentual_comissao: contrato.percentual_comissao || 20,
        status: contrato.status,
        observacoes: contrato.observacoes || '',
      });
    }
  }, [contrato]);

  // Atualizar nome do proprietário quando apartamento for selecionado
  useEffect(() => {
    if (formData.apartamento_numero && !contrato) {
      const apartamento = apartamentos.find(apt => apt.numero === formData.apartamento_numero);
      if (apartamento?.proprietario) {
        setFormData(prev => ({ ...prev, proprietario_nome: apartamento.proprietario || '' }));
      }
    }
  }, [formData.apartamento_numero, apartamentos, contrato]);

  const gerarVariaveisContrato = () => {
    const apartamento = apartamentos.find(apt => apt.numero === formData.apartamento_numero);
    
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
      proprietario_nome: apartamento?.proprietario || formData.proprietario_nome,
      proprietario_cpf: apartamento?.cpfProprietario || '',
      proprietario_data_nascimento: apartamento?.dataNascimentoProprietario ? new Date(apartamento.dataNascimentoProprietario).toLocaleDateString() : '',
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
      proprietario_titular_conta: apartamento?.titularContaProprietario || apartamento?.proprietario || formData.proprietario_nome,
      proprietario_cpf_titular: apartamento?.cpfTitularProprietario || apartamento?.cpfProprietario || '',
      
      // Dados do apartamento
      apartamento_numero: formData.apartamento_numero || '',
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
      titulo_contrato: formData.titulo,
      status_contrato: formData.status,
      data_criacao: new Date(formData.data_criacao).toLocaleDateString(),
      data_assinatura: formData.data_assinatura ? new Date(formData.data_assinatura).toLocaleDateString() : new Date().toLocaleDateString(),
      contrato_data_inicio: formData.data_assinatura ? new Date(formData.data_assinatura).toLocaleDateString() : new Date().toLocaleDateString(),
      contrato_data_fim: formData.data_vencimento ? new Date(formData.data_vencimento).toLocaleDateString() : '',
      contrato_prazo_meses: '12',
      percentual_comissao: formData.percentual_comissao?.toString() || '20',
      valor_mensal: formData.valor_mensal?.toString() || '0'
    };
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contratoData = {
      titulo: formData.titulo,
      conteudo: '', // Will be filled with template content
      proprietario_nome: formData.proprietario_nome,
      apartamento_numero: formData.apartamento_numero,
      data_criacao: formData.data_criacao.toISOString(),
      data_assinatura: formData.data_assinatura.toISOString(),
      data_vencimento: formData.data_vencimento.toISOString(),
      status: formData.status,
      percentual_comissao: formData.percentual_comissao,
      valor_mensal: formData.valor_mensal,
      variaveis: gerarVariaveisContrato(),
      observacoes: formData.observacoes,
    };

    try {
      if (contrato) {
        await atualizarContrato.mutateAsync({ id: contrato.id, ...contratoData });
      } else {
        await criarContrato.mutateAsync(contratoData);
      }
      onVoltar();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
    }
  };

  const apartamentoSelecionado = apartamentos.find(apt => apt.numero === formData.apartamento_numero);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          {contrato ? 'Editar Contrato' : 'Novo Contrato'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título do Contrato</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Ex: Contrato de Locação - Apartamento 101"
                  required
                />
              </div>

              <div>
                <Label htmlFor="apartamento_numero">Número do Apartamento</Label>
                <Select onValueChange={(value) => handleInputChange('apartamento_numero', value)} value={formData.apartamento_numero}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o Apartamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartamentos.map((apartamento) => (
                      <SelectItem key={apartamento.numero} value={apartamento.numero}>
                        {apartamento.numero} - {apartamento.proprietario || 'Sem proprietário'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="proprietario_nome">Nome do Proprietário</Label>
              <Input
                id="proprietario_nome"
                value={formData.proprietario_nome}
                onChange={(e) => handleInputChange('proprietario_nome', e.target.value)}
                placeholder="Nome completo do proprietário"
                required
                disabled={!!apartamentoSelecionado?.proprietario}
              />
              {apartamentoSelecionado?.proprietario && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nome preenchido automaticamente do cadastro do apartamento
                </p>
              )}
            </div>

            {/* Mostrar dados do proprietário se apartamento estiver selecionado */}
            {apartamentoSelecionado && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Dados do Proprietário</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {apartamentoSelecionado.cpfProprietario && (
                    <div>
                      <Label className="text-xs font-medium">CPF</Label>
                      <p>{apartamentoSelecionado.cpfProprietario}</p>
                    </div>
                  )}
                  {apartamentoSelecionado.telefoneProprietario && (
                    <div>
                      <Label className="text-xs font-medium">Telefone</Label>
                      <p>{apartamentoSelecionado.telefoneProprietario}</p>
                    </div>
                  )}
                  {apartamentoSelecionado.emailProprietario && (
                    <div>
                      <Label className="text-xs font-medium">E-mail</Label>
                      <p>{apartamentoSelecionado.emailProprietario}</p>
                    </div>
                  )}
                  {apartamentoSelecionado.enderecoProprietario && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label className="text-xs font-medium">Endereço</Label>
                      <p>{apartamentoSelecionado.enderecoProprietario}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Data de Criação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.data_criacao && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_criacao ? format(formData.data_criacao, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.data_criacao}
                      onSelect={(date) => date && handleInputChange('data_criacao', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Data de Assinatura</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.data_assinatura && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_assinatura ? format(formData.data_assinatura, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.data_assinatura}
                      onSelect={(date) => date && handleInputChange('data_assinatura', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.data_vencimento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_vencimento ? format(formData.data_vencimento, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.data_vencimento}
                      onSelect={(date) => date && handleInputChange('data_vencimento', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_mensal">Valor Mensal (R$)</Label>
                <Input
                  type="number"
                  id="valor_mensal"
                  value={formData.valor_mensal}
                  onChange={(e) => handleInputChange('valor_mensal', parseFloat(e.target.value))}
                  placeholder="Valor mensal do contrato"
                />
              </div>

              <div>
                <Label htmlFor="percentual_comissao">Percentual de Comissão (%)</Label>
                <Input
                  type="number"
                  id="percentual_comissao"
                  value={formData.percentual_comissao}
                  onChange={(e) => handleInputChange('percentual_comissao', parseFloat(e.target.value))}
                  placeholder="Percentual de comissão"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status do Contrato</Label>
              <Select onValueChange={(value) => handleInputChange('status', value)} value={formData.status}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o Status" />
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

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre o contrato"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={criarContrato.isPending || atualizarContrato.isPending}>
            {contrato ? 'Atualizar Contrato' : 'Criar Contrato'}
          </Button>
          <Button type="button" variant="outline" onClick={onVoltar}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
