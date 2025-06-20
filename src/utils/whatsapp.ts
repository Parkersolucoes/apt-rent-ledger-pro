
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

export const enviarPDFWhatsApp = async (
  config: WhatsAppConfig,
  telefone: string,
  pdfBlob: Blob,
  nomeArquivo: string,
  mensagem?: string
): Promise<boolean> => {
  try {
    // Converter o PDF para base64
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Limpar o número de telefone (remover caracteres especiais)
    const telefoneFormatado = telefone.replace(/\D/g, '');
    
    // Verificar se o número tem o código do país (assumindo Brasil +55)
    const numeroCompleto = telefoneFormatado.startsWith('55') ? telefoneFormatado : `55${telefoneFormatado}`;

    // Primeiro enviar a mensagem de texto se fornecida
    if (mensagem) {
      const textResponse = await fetch(`${config.apiUrl}/message/sendText/${config.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.apiKey
        },
        body: JSON.stringify({
          number: numeroCompleto,
          text: mensagem
        })
      });

      if (!textResponse.ok) {
        console.error('Erro ao enviar mensagem de texto:', await textResponse.text());
      }
    }

    // Enviar o arquivo PDF
    const fileResponse = await fetch(`${config.apiUrl}/message/sendMedia/${config.instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey
      },
      body: JSON.stringify({
        number: numeroCompleto,
        mediatype: 'document',
        mimetype: 'application/pdf',
        media: base64,
        fileName: nomeArquivo
      })
    });

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error('Erro ao enviar arquivo:', errorText);
      throw new Error(`Erro na API Evolution: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    throw error;
  }
};

export const formatarTelefone = (telefone: string): string => {
  // Remove todos os caracteres não numéricos
  const numeroLimpo = telefone.replace(/\D/g, '');
  
  // Se tem 11 dígitos (celular) ou 10 dígitos (fixo), adiciona código do país
  if (numeroLimpo.length === 11 || numeroLimpo.length === 10) {
    return `55${numeroLimpo}`;
  }
  
  // Se já tem 13 dígitos (com código do país), retorna como está
  if (numeroLimpo.length === 13) {
    return numeroLimpo;
  }
  
  return numeroLimpo;
};
