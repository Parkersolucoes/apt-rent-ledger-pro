import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ConfiguracaoSMTP {
  host: string;
  port: number;
  usuario: string;
  senha: string;
  emailRemetente: string;
  nomeRemetente: string;
}

interface ConfiguracaoEvolution {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  whatsappAgendamentos?: string;
}

interface ConfiguracaoMercadoPago {
  accessToken: string;
  publicKey: string;
}

interface Configuracoes {
  evolution_api_url: string;
  evolution_api_key: string;
  evolution_instance_name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_usuario: string;
  smtp_senha: string;
  smtp_email_remetente: string;
  smtp_nome_remetente: string;
  webhook_url: string;
  logo_empresa: string;
  mercadopago_access_token: string;
  mercadopago_public_key: string;
  whatsapp_agendamentos: string;
}

export const useConfiguracoes = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [configSMTP, setConfigSMTP] = useState<ConfiguracaoSMTP>({
    host: '',
    port: 587,
    usuario: '',
    senha: '',
    emailRemetente: '',
    nomeRemetente: ''
  });
  const [configEvolution, setConfigEvolution] = useState<ConfiguracaoEvolution>({
    apiUrl: '',
    apiKey: '',
    instanceName: '',
    whatsappAgendamentos: ''
  });
  const [configMercadoPago, setConfigMercadoPago] = useState<ConfiguracaoMercadoPago>({
    accessToken: '',
    publicKey: ''
  });
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    evolution_api_url: '',
    evolution_api_key: '',
    evolution_instance_name: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_usuario: '',
    smtp_senha: '',
    smtp_email_remetente: '',
    smtp_nome_remetente: '',
    webhook_url: '',
    logo_empresa: '',
    mercadopago_access_token: '',
    mercadopago_public_key: '',
    whatsapp_agendamentos: ''
  });
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

      // Carregar todas as configurações
      const { data: todasConfigs, error: configError } = await supabase
        .from('configuracoes_sistema')
        .select('chave, valor');

      if (configError && configError.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', configError);
      } else if (todasConfigs && todasConfigs.length > 0) {
        const configsObj: Partial<Configuracoes> = {};
        const smtpConfig = { ...configSMTP };
        const evolutionConfig = { ...configEvolution };
        const mercadoPagoConfig = { ...configMercadoPago };

        todasConfigs.forEach(config => {
          switch (config.chave) {
            case 'smtp_host':
              smtpConfig.host = config.valor || '';
              configsObj.smtp_host = config.valor || '';
              break;
            case 'smtp_port':
              smtpConfig.port = parseInt(config.valor || '587');
              configsObj.smtp_port = parseInt(config.valor || '587');
              break;
            case 'smtp_usuario':
              smtpConfig.usuario = config.valor || '';
              configsObj.smtp_usuario = config.valor || '';
              break;
            case 'smtp_senha':
              smtpConfig.senha = config.valor || '';
              configsObj.smtp_senha = config.valor || '';
              break;
            case 'smtp_email_remetente':
              smtpConfig.emailRemetente = config.valor || '';
              configsObj.smtp_email_remetente = config.valor || '';
              break;
            case 'smtp_nome_remetente':
              smtpConfig.nomeRemetente = config.valor || '';
              configsObj.smtp_nome_remetente = config.valor || '';
              break;
            case 'evolution_api_url':
              evolutionConfig.apiUrl = config.valor || '';
              configsObj.evolution_api_url = config.valor || '';
              break;
            case 'evolution_api_key':
              evolutionConfig.apiKey = config.valor || '';
              configsObj.evolution_api_key = config.valor || '';
              break;
            case 'evolution_instance_name':
              evolutionConfig.instanceName = config.valor || '';
              configsObj.evolution_instance_name = config.valor || '';
              break;
            case 'webhook_url':
              configsObj.webhook_url = config.valor || '';
              break;
            case 'logo_empresa':
              configsObj.logo_empresa = config.valor || '';
              break;
            case 'mercadopago_access_token':
              mercadoPagoConfig.accessToken = config.valor || '';
              configsObj.mercadopago_access_token = config.valor || '';
              break;
            case 'mercadopago_public_key':
              mercadoPagoConfig.publicKey = config.valor || '';
              configsObj.mercadopago_public_key = config.valor || '';
              break;
            case 'whatsapp_agendamentos':
              evolutionConfig.whatsappAgendamentos = config.valor || '';
              configsObj.whatsapp_agendamentos = config.valor || '';
              break;
          }
        });

        setConfigSMTP(smtpConfig);
        setConfigEvolution(evolutionConfig);
        setConfigMercadoPago(mercadoPagoConfig);
        setConfiguracoes(prev => ({ ...prev, ...configsObj }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const salvarLogo = async (file: File) => {
    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

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

  const salvarConfigSMTP = async (config: ConfiguracaoSMTP) => {
    if (!config.host || !config.usuario || !config.senha || !config.emailRemetente) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const configsToSave = [
        { chave: 'smtp_host', valor: config.host },
        { chave: 'smtp_port', valor: config.port.toString() },
        { chave: 'smtp_usuario', valor: config.usuario },
        { chave: 'smtp_senha', valor: config.senha },
        { chave: 'smtp_email_remetente', valor: config.emailRemetente },
        { chave: 'smtp_nome_remetente', valor: config.nomeRemetente },
      ];

      for (const configItem of configsToSave) {
        const { error } = await supabase
          .from('configuracoes_sistema')
          .upsert(configItem, { onConflict: 'chave' });

        if (error) {
          throw error;
        }
      }

      setConfigSMTP(config);
      toast({
        title: "Sucesso!",
        description: "Configurações SMTP salvas com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações SMTP:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações SMTP.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfigEvolution = async (config: ConfiguracaoEvolution) => {
    if (!config.apiUrl || !config.apiKey || !config.instanceName) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos da Evolution API.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const configsToSave = [
        { chave: 'evolution_api_url', valor: config.apiUrl },
        { chave: 'evolution_api_key', valor: config.apiKey },
        { chave: 'evolution_instance_name', valor: config.instanceName },
        { chave: 'whatsapp_agendamentos', valor: config.whatsappAgendamentos || '' },
      ];

      for (const configItem of configsToSave) {
        const { error } = await supabase
          .from('configuracoes_sistema')
          .upsert(configItem, { onConflict: 'chave' });

        if (error) {
          throw error;
        }
      }

      setConfigEvolution(config);
      toast({
        title: "Sucesso!",
        description: "Configurações da Evolution API salvas com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações Evolution:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações da Evolution API.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfigMercadoPago = async (config: ConfiguracaoMercadoPago) => {
    if (!config.accessToken || !config.publicKey) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos do Mercado Pago.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      const configsToSave = [
        { chave: 'mercadopago_access_token', valor: config.accessToken },
        { chave: 'mercadopago_public_key', valor: config.publicKey },
      ];

      for (const configItem of configsToSave) {
        const { error } = await supabase
          .from('configuracoes_sistema')
          .upsert(configItem, { onConflict: 'chave' });

        if (error) {
          throw error;
        }
      }

      setConfigMercadoPago(config);
      toast({
        title: "Sucesso!",
        description: "Configurações do Mercado Pago salvas com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações Mercado Pago:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações do Mercado Pago.",
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
    configSMTP,
    configEvolution,
    configMercadoPago,
    configuracoes,
    salvarLogo,
    salvarWebhook,
    salvarConfigSMTP,
    salvarConfigEvolution,
    salvarConfigMercadoPago,
    isLoading,
    recarregarConfiguracoes: carregarConfiguracoes
  };
};
