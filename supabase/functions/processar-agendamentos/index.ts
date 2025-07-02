import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

interface Locacao {
  id: string;
  apartamento: string;
  hospede: string;
  data_entrada: string;
  data_saida: string;
  telefone?: string;
}

const formatarTelefone = (telefone: string): string => {
  const numeroLimpo = telefone.replace(/\D/g, '');
  if (numeroLimpo.length === 11 || numeroLimpo.length === 10) {
    return `55${numeroLimpo}`;
  }
  if (numeroLimpo.length === 13) {
    return numeroLimpo;
  }
  return numeroLimpo;
};

const enviarWhatsApp = async (config: WhatsAppConfig, telefone: string, mensagem: string): Promise<boolean> => {
  try {
    const telefoneFormatado = formatarTelefone(telefone);
    
    const response = await fetch(`${config.apiUrl}/message/sendText/${config.instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey
      },
      body: JSON.stringify({
        number: telefoneFormatado,
        text: mensagem
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
};

const gerarMensagemEntradasSaidas = (locacoesEntrada: Locacao[], locacoesSaida: Locacao[], data: string): string => {
  let mensagem = `📅 *Relatório de ${data}*\n\n`;

  if (locacoesEntrada.length > 0) {
    mensagem += `🏠 *CHECK-INS HOJE (${locacoesEntrada.length}):*\n`;
    locacoesEntrada.forEach(locacao => {
      mensagem += `• Apt ${locacao.apartamento} - ${locacao.hospede}\n`;
    });
    mensagem += '\n';
  }

  if (locacoesSaida.length > 0) {
    mensagem += `🚪 *CHECK-OUTS HOJE (${locacoesSaida.length}):*\n`;
    locacoesSaida.forEach(locacao => {
      mensagem += `• Apt ${locacao.apartamento} - ${locacao.hospede}\n`;
    });
    mensagem += '\n';
  }

  if (locacoesEntrada.length === 0 && locacoesSaida.length === 0) {
    mensagem += `✅ *Nenhum check-in ou check-out agendado para hoje.*\n\n`;
  }

  mensagem += `_Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}_`;

  return mensagem;
};

const registrarLog = async (supabase: any, agendamentoId: string, sucesso: boolean, mensagem?: string, erro?: string) => {
  await supabase
    .from('logs_agendamentos')
    .insert({
      agendamento_id: agendamentoId,
      sucesso,
      mensagem_enviada: mensagem,
      erro,
      detalhes: {}
    });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar agendamentos ativos que devem ser executados
    const agora = new Date();
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', true)
      .lte('proximo_envio', agora.toISOString());

    if (agendamentosError) {
      throw new Error(`Erro ao buscar agendamentos: ${agendamentosError.message}`);
    }

    console.log(`Processando ${agendamentos?.length || 0} agendamentos`);

    // Buscar configurações da Evolution API
    const { data: configsData, error: configsError } = await supabase
      .from('configuracoes_sistema')
      .select('chave, valor')
      .in('chave', ['evolution_api_url', 'evolution_api_key', 'evolution_instance_name']);

    if (configsError) {
      throw new Error(`Erro ao buscar configurações: ${configsError.message}`);
    }

    const configMap = configsData?.reduce((acc, config) => {
      acc[config.chave] = config.valor;
      return acc;
    }, {} as Record<string, string>) || {};

    const whatsappConfig: WhatsAppConfig = {
      apiUrl: configMap.evolution_api_url || '',
      apiKey: configMap.evolution_api_key || '',
      instanceName: configMap.evolution_instance_name || ''
    };

    if (!whatsappConfig.apiUrl || !whatsappConfig.apiKey || !whatsappConfig.instanceName) {
      throw new Error('Configurações da Evolution API não encontradas');
    }

    for (const agendamento of agendamentos || []) {
      try {
        console.log(`Processando agendamento: ${agendamento.nome}`);
        
        let mensagem = '';
        const hoje = new Date().toISOString().split('T')[0];
        const dataFormatada = new Date().toLocaleDateString('pt-BR');

        if (agendamento.tipo_informacao === 'entradas_saidas') {
          // Buscar locações que entram hoje
          const { data: entradasHoje } = await supabase
            .from('locacoes')
            .select('*')
            .eq('data_entrada', hoje);

          // Buscar locações que saem hoje
          const { data: saidasHoje } = await supabase
            .from('locacoes')
            .select('*')
            .eq('data_saida', hoje);

          mensagem = gerarMensagemEntradasSaidas(
            entradasHoje || [],
            saidasHoje || [],
            dataFormatada
          );
        }

        if (mensagem) {
          const sucesso = await enviarWhatsApp(whatsappConfig, agendamento.numero_whatsapp, mensagem);
          
          await registrarLog(supabase, agendamento.id, sucesso, mensagem, sucesso ? undefined : 'Falha no envio');

          // Calcular próximo envio
          const proximoEnvio = new Date();
          const [horas, minutos] = agendamento.horario.split(':').map(Number);
          
          switch (agendamento.frequencia) {
            case 'diario':
              proximoEnvio.setDate(proximoEnvio.getDate() + 1);
              break;
            case 'semanal':
              proximoEnvio.setDate(proximoEnvio.getDate() + 7);
              break;
            case 'mensal':
              proximoEnvio.setMonth(proximoEnvio.getMonth() + 1);
              break;
          }
          
          proximoEnvio.setHours(horas, minutos, 0, 0);

          // Atualizar próximo envio
          await supabase
            .from('agendamentos')
            .update({ proximo_envio: proximoEnvio.toISOString() })
            .eq('id', agendamento.id);

          console.log(`Agendamento ${agendamento.nome} processado com ${sucesso ? 'sucesso' : 'erro'}`);
        }
      } catch (error) {
        console.error(`Erro ao processar agendamento ${agendamento.nome}:`, error);
        await registrarLog(supabase, agendamento.id, false, undefined, error.message);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processados: agendamentos?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    );
  }
});