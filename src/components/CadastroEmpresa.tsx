
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Building2 } from 'lucide-react';
import { useEmpresa } from '@/hooks/useEmpresa';

export const CadastroEmpresa = () => {
  const { empresa, isLoading, atualizarEmpresa, criarEmpresa } = useEmpresa();
  
  const [formData, setFormData] = useState({
    nome: 'Happy Caldas Locações',
    razao_social: 'HAPPY CALDAS LOCAÇÕES LTDA',
    nome_fantasia: 'HAPPY CALDAS LOCAÇÕES',
    cnpj: '47.637.692/0001-47',
    endereco: 'Rua B25, QD 13 Lt 35 Casa 7, ITANHANGA 1, Caldas Novas - GO',
    telefone: '(64) 99326-3838',
    telefone_secundario: '(64) 99248-2200',
    email: 'contato@happycaldas.com.br',
    site: '',
    responsavel: 'IVONE DE FATIMA BATISTA',
    cpf_responsavel: '058.004.448-38',
    rg_responsavel: '',
    orgao_expeditor: '',
    nacionalidade_responsavel: 'BRASILEIRA',
    estado_civil_responsavel: '',
    profissao_responsavel: '',
    endereco_responsavel: '',
    cargo_responsavel: 'Representante Legal',
    observacoes: 'Empresa especializada em agenciamento de hospedagem em Caldas Novas - GO',
    ativo: true
  });

  useEffect(() => {
    if (empresa) {
      setFormData({
        nome: empresa.nome || 'Happy Caldas Locações',
        razao_social: empresa.razao_social || 'HAPPY CALDAS LOCAÇÕES LTDA',
        nome_fantasia: empresa.nome_fantasia || 'HAPPY CALDAS LOCAÇÕES',
        cnpj: empresa.cnpj || '47.637.692/0001-47',
        endereco: empresa.endereco || 'Rua B25, QD 13 Lt 35 Casa 7, ITANHANGA 1, Caldas Novas - GO',
        telefone: empresa.telefone || '(64) 99326-3838',
        telefone_secundario: empresa.telefone_secundario || '(64) 99248-2200',
        email: empresa.email || 'contato@happycaldas.com.br',
        site: empresa.site || '',
        responsavel: empresa.responsavel || 'IVONE DE FATIMA BATISTA',
        cpf_responsavel: empresa.cpf_responsavel || '058.004.448-38',
        rg_responsavel: empresa.rg_responsavel || '',
        orgao_expeditor: empresa.orgao_expeditor || '',
        nacionalidade_responsavel: empresa.nacionalidade_responsavel || 'BRASILEIRA',
        estado_civil_responsavel: empresa.estado_civil_responsavel || '',
        profissao_responsavel: empresa.profissao_responsavel || '',
        endereco_responsavel: empresa.endereco_responsavel || '',
        cargo_responsavel: empresa.cargo_responsavel || 'Representante Legal',
        observacoes: empresa.observacoes || 'Empresa especializada em agenciamento de hospedagem em Caldas Novas - GO',
        ativo: empresa.ativo
      });
    }
  }, [empresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (empresa) {
      atualizarEmpresa.mutate(formData);
    } else {
      criarEmpresa.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastro da Empresa</h1>
          <p className="text-muted-foreground">
            Configure os dados da sua empresa/administradora
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="razao_social">Razão Social *</Label>
                <Input
                  id="razao_social"
                  value={formData.razao_social}
                  onChange={(e) => handleInputChange('razao_social', e.target.value)}
                  required
                  placeholder="Razão social da empresa"
                />
              </div>

              <div>
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                  placeholder="Nome fantasia da empresa"
                />
              </div>

              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  rows={3}
                  placeholder="Endereço completo da empresa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone Principal</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                  <Input
                    id="telefone_secundario"
                    value={formData.telefone_secundario}
                    onChange={(e) => handleInputChange('telefone_secundario', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                <div>
                  <Label htmlFor="site">Site</Label>
                  <Input
                    id="site"
                    value={formData.site}
                    onChange={(e) => handleInputChange('site', e.target.value)}
                    placeholder="https://www.suaempresa.com.br"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Responsável</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="responsavel">Nome do Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <Label htmlFor="cargo_responsavel">Cargo</Label>
                <Input
                  id="cargo_responsavel"
                  value={formData.cargo_responsavel}
                  onChange={(e) => handleInputChange('cargo_responsavel', e.target.value)}
                  placeholder="Cargo do responsável"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf_responsavel">CPF</Label>
                  <Input
                    id="cpf_responsavel"
                    value={formData.cpf_responsavel}
                    onChange={(e) => handleInputChange('cpf_responsavel', e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="rg_responsavel">RG</Label>
                  <Input
                    id="rg_responsavel"
                    value={formData.rg_responsavel}
                    onChange={(e) => handleInputChange('rg_responsavel', e.target.value)}
                    placeholder="0000000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="orgao_expeditor">Órgão Expeditor</Label>
                <Input
                  id="orgao_expeditor"
                  value={formData.orgao_expeditor}
                  onChange={(e) => handleInputChange('orgao_expeditor', e.target.value)}
                  placeholder="SSP, IFP, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nacionalidade_responsavel">Nacionalidade</Label>
                  <Input
                    id="nacionalidade_responsavel"
                    value={formData.nacionalidade_responsavel}
                    onChange={(e) => handleInputChange('nacionalidade_responsavel', e.target.value)}
                    placeholder="BRASILEIRA"
                  />
                </div>
                <div>
                  <Label htmlFor="estado_civil_responsavel">Estado Civil</Label>
                  <Input
                    id="estado_civil_responsavel"
                    value={formData.estado_civil_responsavel}
                    onChange={(e) => handleInputChange('estado_civil_responsavel', e.target.value)}
                    placeholder="SOLTEIRO, CASADO, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profissao_responsavel">Profissão</Label>
                <Input
                  id="profissao_responsavel"
                  value={formData.profissao_responsavel}
                  onChange={(e) => handleInputChange('profissao_responsavel', e.target.value)}
                  placeholder="Profissão do responsável"
                />
              </div>

              <div>
                <Label htmlFor="endereco_responsavel">Endereço do Responsável</Label>
                <Textarea
                  id="endereco_responsavel"
                  value={formData.endereco_responsavel}
                  onChange={(e) => handleInputChange('endereco_responsavel', e.target.value)}
                  rows={3}
                  placeholder="Endereço completo do responsável"
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  rows={4}
                  placeholder="Observações adicionais sobre a empresa"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={atualizarEmpresa.isPending || criarEmpresa.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {empresa ? 'Atualizar Dados' : 'Salvar Dados'}
          </Button>
        </div>
      </form>
    </div>
  );
};
