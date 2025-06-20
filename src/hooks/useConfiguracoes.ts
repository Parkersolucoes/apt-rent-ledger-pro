
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useConfiguracoes = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const carregarConfiguracoes = async () => {
    try {
      // Carregar logo
      const { data: logoData, error: logoError } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'logo_empresa')
        .single();

      if (logoError && logoError.code !== 'PGRST116') {
        console.error('Erro ao carregar logo:', logoError);
      } else if (logoData?.valor) {
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(logoData.valor);
        setLogoUrl(publicUrlData.publicUrl);
      }

      // Carregar webhook
      const { data: webhookData, error: webhookError } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'webhook_url')
        .single();

      if (webhookError && webhookError.code !== 'PGRST116') {
        console.error('Erro ao carregar webhook:', webhookError);
      } else if (webhookData?.valor) {
        setWebhookUrl(webhookData.valor);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const salvarLogo = async (file: File) => {
    setIsLoading(true);
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      // Fazer upload do arquivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Atualizar a configuração no banco
      const { error: updateError } = await supabase
        .from('configuracoes_sistema')
        .upsert({ 
          chave: 'logo_empresa',
          valor: fileName 
        }, {
          onConflict: 'chave'
        });

      if (updateError) {
        throw updateError;
      }

      // Atualizar a URL da logo
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);
      
      setLogoUrl(publicUrlData.publicUrl);

      toast({
        title: "Sucesso!",
        description: "Logo da empresa salva com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar logo:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a logo da empresa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const salvarWebhook = async (url: string) => {
    if (!url.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida para o webhook.",
        variant: "destructive"
      });
      return false;
    }

    try {
      new URL(url);
    } catch (error) {
      toast({
        title: "Erro",
        description: "URL inválida. Por favor, verifique o formato.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('configuracoes_sistema')
        .upsert({ 
          chave: 'webhook_url',
          valor: url 
        }, {
          onConflict: 'chave'
        });

      if (error) {
        throw error;
      }

      setWebhookUrl(url);
      toast({
        title: "Sucesso!",
        description: "Webhook configurado com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar webhook:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a configuração do webhook.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  return {
    logoUrl,
    webhookUrl,
    salvarLogo,
    salvarWebhook,
    isLoading,
    recarregarConfiguracoes: carregarConfiguracoes
  };
};
