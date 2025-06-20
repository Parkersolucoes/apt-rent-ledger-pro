
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Webhook, Save, TestTube, Upload, Image } from 'lucide-react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

export const Configuracoes = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { logoUrl, salvarLogo, isLoading: logoLoading } = useConfiguracoes();

  useEffect(() => {
    // Carregar webhook salvo do localStorage
    const savedWebhook = localStorage.getItem('webhook_url');
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
  }, []);

  const handleSave = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida para o webhook.",
        variant: "destructive"
      });
      return;
    }

    try {
      new URL(webhookUrl);
      localStorage.setItem('webhook_url', webhookUrl);
      toast({
        title: "Sucesso!",
        description: "Webhook configurado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "URL inválida. Por favor, verifique o formato.",
        variant: "destructive"
      });
    }
  };

  const handleTest = async () => {
    if (!webhookUrl.trim()) {
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

      await fetch(webhookUrl, {
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

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use JPG, PNG ou WebP.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
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
          <CardContent className="p-6 space-y-6">
            {/* Configuração da Logo */}
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-lg">Logo da Empresa</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça upload da logo da sua empresa. Será exibida na tela principal do sistema.
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
                      disabled={logoLoading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {logoLoading ? 'Salvando...' : 'Escolher Arquivo'}
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

            {/* Configuração do Webhook */}
            <div className="space-y-4">
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
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://exemplo.com/webhook"
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
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Configuração
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || !webhookUrl.trim()}
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
