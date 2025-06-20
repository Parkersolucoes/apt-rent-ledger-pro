
-- Criar tabela para despesas dos apartamentos
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartamento TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para melhorar performance nas consultas por apartamento
CREATE INDEX idx_despesas_apartamento ON public.despesas(apartamento);

-- Criar índice para consultas por data
CREATE INDEX idx_despesas_data ON public.despesas(data);
