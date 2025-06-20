
-- Adicionar a nova variável 'despesas_periodo' aos modelos existentes
UPDATE public.modelos_mensagem 
SET variaveis = array_append(variaveis, 'despesas_periodo')
WHERE NOT ('despesas_periodo' = ANY(variaveis));

-- Atualizar os modelos padrão para incluir informações sobre despesas
UPDATE public.modelos_mensagem 
SET conteudo = 'Olá {{nome_proprietario}}! 

📊 *Relatório Financeiro do Apartamento {{apartamento}}*

💰 *Resumo do período:*
• Valor total: {{valor_total}}
• Comissão: {{comissao_total}}
• Taxa limpeza: {{limpeza_total}}
• Valor proprietário: {{valor_proprietario}}

💸 *Despesas do período:*
{{despesas_periodo}}

📋 Total de locações: {{total_locacoes}}

📄 Segue em anexo o relatório detalhado.

Atenciosamente,
Happy Caldas'
WHERE nome = 'Relatório Mensal Padrão';

-- Criar um modelo específico para mensagens de hóspedes
INSERT INTO public.modelos_mensagem (nome, titulo, conteudo, variaveis) VALUES 
(
  'Mensagem para Hóspede',
  'Confirmação de Reserva',
  'Olá {{hospede}}! 

🏠 Sua reserva no apartamento {{apartamento}} foi confirmada!

📅 *Detalhes da estadia:*
• Check-in: {{data_entrada}}
• Check-out: {{data_saida}}
• Valor total: {{valor_total}}

🏢 *Sobre o apartamento:*
{{descricao_apartamento}}

Estamos ansiosos para recebê-lo(a)!

Happy Caldas',
  '{"hospede", "apartamento", "data_entrada", "data_saida", "valor_total", "descricao_apartamento"}'
);
