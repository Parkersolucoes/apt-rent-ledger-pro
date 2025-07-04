
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebhookData {
  type: 'locacao_criada' | 'locacao_atualizada' | 'locacao_excluida' | 'pagamento_atualizado';
  timestamp: string;
  data: any;
}

export const useWebhook = () => {
  const getWebhookUrl = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'webhook_url')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar webhook URL:', error);
        return null;
      }

      return data?.valor || null;
    } catch (error) {
      console.error('Erro ao buscar webhook URL:', error);
      return null;
    }
  };

  const sendWebhook = async (webhookData: WebhookData) => {
    const webhookUrl = await getWebhookUrl();
    
    if (!webhookUrl) {
      console.log('Webhook não configurado');
      return;
    }

    try {
      console.log('Enviando webhook:', webhookData);
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          ...webhookData,
          origin: window.location.origin,
        })
      });

      console.log('Webhook enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      // Não mostrar toast para não interferir na UX principal
    }
  };

  const sendLocacaoCriada = (locacao: any) => {
    sendWebhook({
      type: 'locacao_criada',
      timestamp: new Date().toISOString(),
      data: {
        locacao,
        message: `Nova locação cadastrada: ${locacao.hospede} - Apartamento ${locacao.apartamento}`
      }
    });
  };

  const sendLocacaoAtualizada = (locacao: any) => {
    sendWebhook({
      type: 'locacao_atualizada',
      timestamp: new Date().toISOString(),
      data: {
        locacao,
        message: `Locação atualizada: ${locacao.hospede} - Apartamento ${locacao.apartamento}`
      }
    });
  };

  const sendLocacaoExcluida = (locacao: any) => {
    sendWebhook({
      type: 'locacao_excluida',
      timestamp: new Date().toISOString(),
      data: {
        locacao,
        message: `Locação excluída: ${locacao.hospede} - Apartamento ${locacao.apartamento}`
      }
    });
  };

  const sendPagamentoAtualizado = (locacao: any, tipoPagamento: string, pago: boolean) => {
    sendWebhook({
      type: 'pagamento_atualizado',
      timestamp: new Date().toISOString(),
      data: {
        locacao,
        tipoPagamento,
        pago,
        message: `Pagamento ${pago ? 'confirmado' : 'pendente'}: ${tipoPagamento} - ${locacao.hospede}`
      }
    });
  };

  return {
    sendLocacaoCriada,
    sendLocacaoAtualizada,
    sendLocacaoExcluida,
    sendPagamentoAtualizado
  };
};
