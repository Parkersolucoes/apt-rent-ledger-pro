import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Webhook, Save, TestTube, Upload, Mail, Eye, EyeOff, MessageCircle, CreditCard } from 'lucide-react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

export const Configuracoes = () => {
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [mostrarSenhaSMTP, setMostrarSenhaSMTP] = useState(false);
  const [mostrarApiKeyEvolution, setMostrarApiKeyEvolution] = useState(false);
  const [mostrarAccessTokenMP, setMostrarAccessTokenMP] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    logoUrl, 
    webhookUrl, 
    configSMTP, 
    configEvolution, 
    configMercadoPago,
    salvarLogo, 
    salvarWebhook, 
    salvarConfigSMTP, 
    salvarConfigEvolution,
    salvarConfigMercadoPago,
    isLoading 
  } = useConfiguracoes();

  const [smtpForm, setSMTPForm] = useState({
    host: '',
    port: 587,
    usuario: '',
    senha: '',
    emailRemetente: '',
    nomeRemetente: ''
  });

  const [evolutionForm, setEvolutionForm] = useState({
    apiUrl: '',
    apiKey: '',
    instanceName: '',
    whatsappAgendamentos: ''
  });

  const [mercadoPagoForm, setMercadoPagoForm] = useState({
    accessToken: '',
    publicKey: ''
  });

  // Sincronizar os inputs com os valores dos hooks quando carregados
  useEffect(() => {
    if (webhookUrl && !webhookUrlInput) {
      setWebhookUrlInput(webhookUrl);
    }
    if (configSMTP.host) {
      setSMTPForm(configSMTP);
    }
    if (configEvolution.apiUrl) {
      setEvolutionForm({
        ...configEvolution,
        whatsappAgendamentos: configEvolution.whatsappAgendamentos || ''
      });
    }
    if (configMercadoPago.accessToken) {
      setMercadoPagoForm(configMercadoPago);
    }
  }, [webhookUrl, webhookUrlInput, configSMTP, configEvolution, configMercadoPago]);

  const handleSaveWebhook = async () => {
    await salvarWebhook(webhookUrlInput);
  };

  const handleSaveSMTP = async () => {
    await salvarConfigSMTP(smtpForm);
  };

  const handleSaveEvolution = async () => {
    await salvarConfigEvolution(evolutionForm);
  };

  const handleSaveMercadoPago = async () => {
    await salvarConfigMercadoPago(mercadoPagoForm);
  };

  const handleTest = async () => {
    const urlToTest = webhookUrlInput || webhookUrl;
    
    if (!urlToTest.trim()) {
      toast({
        title: "Erro",
        description: "Configure o webhook antes de testá-lo.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);

    try {
      const testData = {
        type: 'test',
        timestamp: new Date().toISOString(),
        message: 'Teste de webhook do Sistema de Locações',
        data: {
          test: true,
          origin: window.location.origin
        }
      };

      await fetch(urlToTest, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testData)
      });

      toast({
        title: "Teste Enviado",
        description: "O webhook de teste foi enviado. Verifique seu sistema para confirmar o recebimento."
      });
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar o teste do webhook.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use JPG, PNG ou WebP.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    salvarLogo(file);
  };

  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Webhook className="h-6 w-6" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Configuração da Logo */}
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-lg">Logo da Empresa</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça upload da logo da sua empresa. Será exibida na tela principal do sistema e nos relatórios.
                </p>
                
                <div className="flex items-center gap-4">
                  {logoUrl && (
                    <div className="border rounded-lg p-2 bg-muted">
                      <img 
                        src={logoUrl} 
                        alt="Logo da empresa" 
                        className="h-16 w-auto max-w-32 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleLogoButtonClick}
                      disabled={isLoading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isLoading ? 'Salvando...' : 'Escolher Arquivo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG ou WebP (máx. 5MB)
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Configuração SMTP */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="font-semibold text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configurações de Email (SMTP)
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure seus dados SMTP para envio de relatórios por email.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">Servidor SMTP *</Label>
                    <Input
                      id="smtp-host"
                      value={smtpForm.host}
                      onChange={(e) => setSMTPForm({...smtpForm, host: e.target.value})}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={smtpForm.port}
                      onChange={(e) => setSMTPForm({...smtpForm, port: parseInt(e.target.value) || 587})}
                      placeholder="587"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp-usuario">Usuário/Email *</Label>
                    <Input
                      id="smtp-usuario"
                      value={smtpForm.usuario}
                      onChange={(e) => setSMTPForm({...smtpForm, usuario: e.target.value})}
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp-senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="smtp-senha"
                        type={mostrarSenhaSMTP ? "text" : "password"}
                        value={smtpForm.senha}
                        onChange={(e) => setSMTPForm({...smtpForm, senha: e.target.value})}
                        placeholder="Sua senha SMTP"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setMostrarSenhaSMTP(!mostrarSenhaSMTP)}
                      >
                        {mostrarSenhaSMTP ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp-email-remetente">Email Remetente *</Label>
                    <Input
                      id="smtp-email-remetente"
                      value={smtpForm.emailRemetente}
                      onChange={(e) => setSMTPForm({...smtpForm, emailRemetente: e.target.value})}
                      placeholder="noreply@suaempresa.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp-nome-remetente">Nome do Remetente</Label>
                    <Input
                      id="smtp-nome-remetente"
                      value={smtpForm.nomeRemetente}
                      onChange={(e) => setSMTPForm({...smtpForm, nomeRemetente: e.target.value})}
                      placeholder="Sistema de Locações"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button 
                    onClick={handleSaveSMTP}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Configurações SMTP
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-semibold mb-2">Configurações comuns:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><strong>Gmail:</strong> smtp.gmail.com:587 (Use senha de app)</p>
                    <p><strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com:587</p>
                    <p><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuração da Evolution API */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="font-semibold text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Evolution API (WhatsApp)
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure sua Evolution API para envio de relatórios por WhatsApp.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="evolution-api-url">URL da API *</Label>
                    <Input
                      id="evolution-api-url"
                      value={evolutionForm.apiUrl}
                      onChange={(e) => setEvolutionForm({...evolutionForm, apiUrl: e.target.value})}
                      placeholder="https://sua-evolution-api.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="evolution-api-key">API Key *</Label>
                    <div className="relative">
                      <Input
                        id="evolution-api-key"
                        type={mostrarApiKeyEvolution ? "text" : "password"}
                        value={evolutionForm.apiKey}
                        onChange={(e) => setEvolutionForm({...evolutionForm, apiKey: e.target.value})}
                        placeholder="Sua API Key da Evolution"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setMostrarApiKeyEvolution(!mostrarApiKeyEvolution)}
                      >
                        {mostrarApiKeyEvolution ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="evolution-instance-name">Nome da Instância *</Label>
                    <Input
                      id="evolution-instance-name"
                      value={evolutionForm.instanceName}
                      onChange={(e) => setEvolutionForm({...evolutionForm, instanceName: e.target.value})}
                      placeholder="nome-da-instancia"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button 
                    onClick={handleSaveEvolution}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Configurações Evolution
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-semibold mb-2">Como configurar:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><strong>URL da API:</strong> Endereço completo da sua Evolution API (ex: https://api.minhaempresa.com)</p>
                    <p><strong>API Key:</strong> Chave de autenticação da sua Evolution API</p>
                    <p><strong>Instância:</strong> Nome da instância configurada na Evolution API</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuração do Mercado Pago */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="font-semibold text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Mercado Pago
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure suas credenciais do Mercado Pago para gerar links de pagamento.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="mp-access-token">Access Token *</Label>
                    <div className="relative">
                      <Input
                        id="mp-access-token"
                        type={mostrarAccessTokenMP ? "text" : "password"}
                        value={mercadoPagoForm.accessToken}
                        onChange={(e) => setMercadoPagoForm({...mercadoPagoForm, accessToken: e.target.value})}
                        placeholder="APP_USR-xxx"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setMostrarAccessTokenMP(!mostrarAccessTokenMP)}
                      >
                        {mostrarAccessTokenMP ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="mp-public-key">Public Key *</Label>
                    <Input
                      id="mp-public-key"
                      value={mercadoPagoForm.publicKey}
                      onChange={(e) => setMercadoPagoForm({...mercadoPagoForm, publicKey: e.target.value})}
                      placeholder="APP_USR-xxx"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button 
                    onClick={handleSaveMercadoPago}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Configurações Mercado Pago
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-semibold mb-2">Como obter as credenciais:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>1. Acesse <a href="https://www.mercadopago.com.br/developers" target="_blank" className="text-blue-600 hover:underline">developers.mercadopago.com.br</a></p>
                    <p>2. Faça login na sua conta Mercado Pago</p>
                    <p>3. Vá em "Suas integrações" → "Credenciais"</p>
                    <p>4. Copie o Access Token e Public Key de produção</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuração de WhatsApp para Agendamentos */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label className="font-semibold text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp para Agendamentos
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure o número de WhatsApp que receberá as mensagens dos agendamentos automáticos.
                </p>
                
                <div>
                  <Label htmlFor="whatsapp-agendamentos">Número do WhatsApp *</Label>
                  <Input
                    id="whatsapp-agendamentos"
                    value={configEvolution.whatsappAgendamentos || ''}
                    onChange={(e) => setEvolutionForm({...evolutionForm, whatsappAgendamentos: e.target.value})}
                    placeholder="5511999999999"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: código do país + DDD + número (ex: 5511999999999)
                  </p>
                </div>

                <div className="mt-4">
                  <Button 
                    onClick={handleSaveEvolution}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Número WhatsApp
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h4 className="font-semibold mb-2">Status do Sistema:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><strong>Cron Job:</strong> ✅ Ativo (executa a cada 5 minutos)</p>
                    <p><strong>Evolution API:</strong> {evolutionForm.apiUrl ? '✅ Configurada' : '❌ Não configurada'}</p>
                    <p><strong>WhatsApp:</strong> {evolutionForm.whatsappAgendamentos ? '✅ Configurado' : '❌ Não configurado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuração do Webhook */}
            <div className="space-y-4 border-t pt-6">
              <div>
                <Label htmlFor="webhook" className="font-semibold text-lg">
                  URL do Webhook
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Configure uma URL de webhook para receber notificações automáticas das principais ações do sistema.
                </p>
                <Input
                  id="webhook"
                  type="url"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  placeholder={webhookUrl || "https://exemplo.com/webhook"}
                  className="text-base"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Eventos enviados pelo webhook:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Nova locação cadastrada</li>
                  <li>• Locação atualizada</li>
                  <li>• Locação excluída</li>
                  <li>• Mudanças no status de pagamento</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveWebhook}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Configuração
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || (!webhookUrlInput.trim() && !webhookUrl.trim())}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isTesting ? 'Testando...' : 'Testar Webhook'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
