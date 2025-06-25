import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast"
import { useApartamentos } from '@/hooks/useApartamentos';
import { useEmpresa } from '@/hooks/useEmpresa';

export const FormularioContrato = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    apartamento_numero: '',
    proprietario_nome: '',
    data_criacao: new Date(),
    data_assinatura: new Date(),
    data_vencimento: new Date(),
    valor_mensal: 0,
    percentual_comissao: 20,
    status: 'Ativo',
    observacoes: '',
  });

  const { toast } = useToast();
  const { apartamentos } = useApartamentos();
  const { empresa } = useEmpresa();

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
      
      // Dados do proprietário
      proprietario_nome: formData.proprietario_nome,
      proprietario_data_nascimento: '',
      proprietario_nacionalidade: empresa?.nacionalidade_responsavel || 'BRASILEIRA',
      proprietario_estado_civil: empresa?.estado_civil_responsavel || '',
      proprietario_profissao: empresa?.profissao_responsavel || '',
      proprietario_rg: empresa?.rg_responsavel || '',
      proprietario_orgao_expeditor: empresa?.orgao_expeditor || '',
      proprietario_cpf: '',
      proprietario_email: '',
      proprietario_endereco: empresa?.endereco_responsavel || '',
      proprietario_banco: '',
      proprietario_agencia: '',
      proprietario_conta: '',
      proprietario_pix: '',
      proprietario_tipo_conta: '',
      proprietario_titular_conta: formData.proprietario_nome,
      proprietario_cpf_titular: '',
      
      // Dados do apartamento
      apartamento_numero: formData.apartamento_numero || '',
      apartamento_torre: '',
      apartamento_caracteristicas: apartamento?.descricao || '',
      apartamento_capacidade: '8',
      
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

  const processarConteudoContrato = (conteudo: string) => {
    const variaveis = gerarVariaveisContrato();
    let conteudoProcessado = conteudo;

    // Substituir todas as variáveis no conteúdo
    Object.entries(variaveis).forEach(([chave, valor]) => {
      const regex = new RegExp(`\\{\\{${chave}\\}\\}`, 'g');
      conteudoProcessado = conteudoProcessado.replace(regex, valor || '');
    });

    return conteudoProcessado;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário submetido:', formData);
    toast({
      title: "Sucesso",
      description: "Contrato gerado com sucesso!",
    })
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-6 space-y-4">
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
              />
            </div>

            <div>
              <Label htmlFor="apartamento_numero">Número do Apartamento</Label>
              <Select onValueChange={(value) => handleInputChange('apartamento_numero', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o Apartamento" />
                </SelectTrigger>
                <SelectContent>
                  {apartamentos.map((apartamento) => (
                    <SelectItem key={apartamento.numero} value={apartamento.numero}>
                      {apartamento.numero} - {apartamento.descricao}
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Data de Criação</Label>
              <DatePicker
                locale={ptBR}
                className="w-full"
                date={formData.data_criacao}
                onDateChange={(date) => handleInputChange('data_criacao', date)}
              />
            </div>

            <div>
              <Label>Data de Assinatura</Label>
              <DatePicker
                locale={ptBR}
                className="w-full"
                date={formData.data_assinatura}
                onDateChange={(date) => handleInputChange('data_assinatura', date)}
              />
            </div>

            <div>
              <Label>Data de Vencimento</Label>
              <DatePicker
                locale={ptBR}
                className="w-full"
                date={formData.data_vencimento}
                onDateChange={(date) => handleInputChange('data_vencimento', date)}
              />
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
            <Select onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Em negociação">Em negociação</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
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

      <Button type="submit">Gerar Contrato</Button>
    </form>
  );
};
