
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useToast } from '@/hooks/use-toast';
import { Apartamento } from '@/types/apartamento';
import { CampoTelefone } from './CampoTelefone';
import { Save, X } from 'lucide-react';

interface FormularioApartamentoProps {
  apartamento?: Apartamento;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FormularioApartamento = ({ apartamento, onSuccess, onCancel }: FormularioApartamentoProps) => {
  const { adicionarApartamento, atualizarApartamento } = useApartamentos();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    numero: apartamento?.numero || '',
    descricao: apartamento?.descricao || '',
    endereco: apartamento?.endereco || '',
    proprietario: apartamento?.proprietario || '',
    telefoneProprietario: apartamento?.telefoneProprietario || '',
    cpfProprietario: apartamento?.cpfProprietario || '',
    dataNascimentoProprietario: apartamento?.dataNascimentoProprietario ? new Date(apartamento.dataNascimentoProprietario) : undefined,
    enderecoProprietario: apartamento?.enderecoProprietario || '',
    emailProprietario: apartamento?.emailProprietario || '',
    rgProprietario: apartamento?.rgProprietario || '',
    orgaoExpeditorProprietario: apartamento?.orgaoExpeditorProprietario || '',
    nacionalidadeProprietario: apartamento?.nacionalidadeProprietario || 'BRASILEIRA',
    estadoCivilProprietario: apartamento?.estadoCivilProprietario || '',
    profissaoProprietario: apartamento?.profissaoProprietario || '',
    bancoProprietario: apartamento?.bancoProprietario || '',
    agenciaProprietario: apartamento?.agenciaProprietario || '',
    contaProprietario: apartamento?.contaProprietario || '',
    pixProprietario: apartamento?.pixProprietario || '',
    tipoContaProprietario: apartamento?.tipoContaProprietario || 'Corrente',
    titularContaProprietario: apartamento?.titularContaProprietario || '',
    cpfTitularProprietario: apartamento?.cpfTitularProprietario || '',
    ativo: apartamento?.ativo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      toast({
        title: "Erro",
        description: "O número do apartamento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const apartamentoData = {
        ...formData,
        dataNascimentoProprietario: formData.dataNascimentoProprietario?.toISOString().split('T')[0]
      };

      if (apartamento) {
        atualizarApartamento(apartamento.id, apartamentoData);
        toast({
          title: "Sucesso",
          description: "Apartamento atualizado com sucesso!",
        });
      } else {
        adicionarApartamento(apartamentoData);
        toast({
          title: "Sucesso",
          description: "Apartamento cadastrado com sucesso!",
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        // Limpar formulário se não há callback
        setFormData({
          numero: '',
          descricao: '',
          endereco: '',
          proprietario: '',
          telefoneProprietario: '',
          cpfProprietario: '',
          dataNascimentoProprietario: undefined,
          enderecoProprietario: '',
          emailProprietario: '',
          rgProprietario: '',
          orgaoExpeditorProprietario: '',
          nacionalidadeProprietario: 'BRASILEIRA',
          estadoCivilProprietario: '',
          profissaoProprietario: '',
          bancoProprietario: '',
          agenciaProprietario: '',
          contaProprietario: '',
          pixProprietario: '',
          tipoContaProprietario: 'Corrente',
          titularContaProprietario: '',
          cpfTitularProprietario: '',
          ativo: true
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar apartamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-professional-lg border">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl">
          {apartamento ? 'Editar Apartamento' : 'Novo Apartamento'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="apartamento" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="apartamento">Apartamento</TabsTrigger>
              <TabsTrigger value="proprietario">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="bancarios">Dados Bancários</TabsTrigger>
            </TabsList>

            <TabsContent value="apartamento" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-foreground font-medium">Número do Apartamento *</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    placeholder="Ex: 101, 201A, etc."
                    required
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proprietario" className="text-foreground font-medium">Nome do Proprietário</Label>
                  <Input
                    id="proprietario"
                    value={formData.proprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, proprietario: e.target.value }))}
                    placeholder="Nome completo do proprietário"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-foreground font-medium">Endereço do Apartamento</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Endereço completo do apartamento"
                  className="border-input focus:border-primary bg-background text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-foreground font-medium">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do apartamento (quartos, banheiros, características, etc.)"
                  rows={3}
                  className="border-input focus:border-primary bg-background text-foreground"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo" className="text-foreground font-medium">Apartamento ativo</Label>
              </div>
            </TabsContent>

            <TabsContent value="proprietario" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpfProprietario" className="text-foreground font-medium">CPF</Label>
                  <Input
                    id="cpfProprietario"
                    value={formData.cpfProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpfProprietario: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rgProprietario" className="text-foreground font-medium">RG</Label>
                  <Input
                    id="rgProprietario"
                    value={formData.rgProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, rgProprietario: e.target.value }))}
                    placeholder="00.000.000-0"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgaoExpeditorProprietario" className="text-foreground font-medium">Órgão Expeditor</Label>
                  <Input
                    id="orgaoExpeditorProprietario"
                    value={formData.orgaoExpeditorProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, orgaoExpeditorProprietario: e.target.value }))}
                    placeholder="SSP-GO"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dataNascimentoProprietario && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataNascimentoProprietario ? format(formData.dataNascimentoProprietario, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dataNascimentoProprietario}
                        onSelect={(date) => setFormData(prev => ({ ...prev, dataNascimentoProprietario: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoTelefone
                  label="Telefone"
                  value={formData.telefoneProprietario}
                  onChange={(value) => setFormData(prev => ({ ...prev, telefoneProprietario: value }))}
                  placeholder="(00) 00000-0000"
                />

                <div className="space-y-2">
                  <Label htmlFor="emailProprietario" className="text-foreground font-medium">E-mail</Label>
                  <Input
                    id="emailProprietario"
                    type="email"
                    value={formData.emailProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailProprietario: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nacionalidadeProprietario" className="text-foreground font-medium">Nacionalidade</Label>
                  <Input
                    id="nacionalidadeProprietario"
                    value={formData.nacionalidadeProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, nacionalidadeProprietario: e.target.value }))}
                    placeholder="BRASILEIRA"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadoCivilProprietario" className="text-foreground font-medium">Estado Civil</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, estadoCivilProprietario: value }))} value={formData.estadoCivilProprietario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                      <SelectItem value="União Estável">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissaoProprietario" className="text-foreground font-medium">Profissão</Label>
                  <Input
                    id="profissaoProprietario"
                    value={formData.profissaoProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, profissaoProprietario: e.target.value }))}
                    placeholder="Profissão"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enderecoProprietario" className="text-foreground font-medium">Endereço Completo</Label>
                <Textarea
                  id="enderecoProprietario"
                  value={formData.enderecoProprietario}
                  onChange={(e) => setFormData(prev => ({ ...prev, enderecoProprietario: e.target.value }))}
                  placeholder="Endereço completo do proprietário"
                  rows={2}
                  className="border-input focus:border-primary bg-background text-foreground"
                />
              </div>
            </TabsContent>

            <TabsContent value="bancarios" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bancoProprietario" className="text-foreground font-medium">Banco</Label>
                  <Input
                    id="bancoProprietario"
                    value={formData.bancoProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, bancoProprietario: e.target.value }))}
                    placeholder="Nome do banco"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenciaProprietario" className="text-foreground font-medium">Agência</Label>
                  <Input
                    id="agenciaProprietario"
                    value={formData.agenciaProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, agenciaProprietario: e.target.value }))}
                    placeholder="0000"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contaProprietario" className="text-foreground font-medium">Conta</Label>
                  <Input
                    id="contaProprietario"
                    value={formData.contaProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, contaProprietario: e.target.value }))}
                    placeholder="00000-0"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoContaProprietario" className="text-foreground font-medium">Tipo de Conta</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, tipoContaProprietario: value }))} value={formData.tipoContaProprietario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corrente">Corrente</SelectItem>
                      <SelectItem value="Poupança">Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titularContaProprietario" className="text-foreground font-medium">Titular da Conta</Label>
                  <Input
                    id="titularContaProprietario"
                    value={formData.titularContaProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, titularContaProprietario: e.target.value }))}
                    placeholder="Nome do titular"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfTitularProprietario" className="text-foreground font-medium">CPF do Titular</Label>
                  <Input
                    id="cpfTitularProprietario"
                    value={formData.cpfTitularProprietario}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpfTitularProprietario: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="border-input focus:border-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixProprietario" className="text-foreground font-medium">PIX</Label>
                <Input
                  id="pixProprietario"
                  value={formData.pixProprietario}
                  onChange={(e) => setFormData(prev => ({ ...prev, pixProprietario: e.target.value }))}
                  placeholder="Chave PIX (CPF, telefone, e-mail ou chave aleatória)"
                  className="border-input focus:border-primary bg-background text-foreground"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 justify-end pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {apartamento ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
