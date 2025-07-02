-- Criar tabela para agendamentos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  frequencia TEXT NOT NULL CHECK (frequencia IN ('diario', 'semanal', 'mensal')),
  horario TIME NOT NULL,
  numero_whatsapp TEXT NOT NULL,
  tipo_informacao TEXT NOT NULL DEFAULT 'entradas_saidas' CHECK (tipo_informacao IN ('entradas_saidas', 'proximas_entradas', 'proximas_saidas', 'relatorio_semanal')),
  status BOOLEAN NOT NULL DEFAULT true,
  proximo_envio TIMESTAMP WITH TIME ZONE,
  configuracoes_extras JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de agendamentos
CREATE TABLE public.logs_agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sucesso BOOLEAN NOT NULL,
  mensagem_enviada TEXT,
  erro TEXT,
  detalhes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_agendamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Permitir tudo em agendamentos" 
ON public.agendamentos 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir tudo em logs_agendamentos" 
ON public.logs_agendamentos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar trigger para updated_at
CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar configuração para número de WhatsApp de agendamentos
INSERT INTO public.configuracoes_sistema (chave, valor) 
VALUES ('whatsapp_agendamentos', '') 
ON CONFLICT (chave) DO NOTHING;