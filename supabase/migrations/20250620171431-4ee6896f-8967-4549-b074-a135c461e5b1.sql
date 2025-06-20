
-- Criar tabela para modelos de mensagem WhatsApp
CREATE TABLE public.modelos_mensagem (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  variaveis TEXT[] DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_update_modelos_mensagem_updated_at
  BEFORE UPDATE ON public.modelos_mensagem
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns modelos padrão
INSERT INTO public.modelos_mensagem (nome, titulo, conteudo, variaveis) VALUES 
(
  'Relatório Mensal Padrão',
  'Relatório Financeiro Mensal',
  'Olá {{nome_proprietario}}! 

📊 *Relatório Financeiro do Apartamento {{apartamento}}*

💰 *Resumo do período:*
• Valor total: {{valor_total}}
• Comissão: {{comissao_total}}
• Taxa limpeza: {{limpeza_total}}
• Valor proprietário: {{valor_proprietario}}

📋 Total de locações: {{total_locacoes}}

📄 Segue em anexo o relatório detalhado.

Atenciosamente,
Happy Caldas',
  '{"nome_proprietario", "apartamento", "valor_total", "comissao_total", "limpeza_total", "valor_proprietario", "total_locacoes"}'
),
(
  'Relatório Resumido',
  'Resumo Rápido',
  'Oi {{nome_proprietario}}! 

Seu apartamento {{apartamento}} teve {{total_locacoes}} locação(ões) no período.
Valor líquido: {{valor_proprietario}}

Relatório em anexo! 📊',
  '{"nome_proprietario", "apartamento", "total_locacoes", "valor_proprietario"}'
);
