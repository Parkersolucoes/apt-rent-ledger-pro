
-- Criar tabela para gerenciar disponibilidade das unidades
CREATE TABLE public.disponibilidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartamento_numero TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'ocupado', 'bloqueado', 'manutencao')),
  hospede TEXT,
  valor_diaria NUMERIC,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_disponibilidade_apartamento ON public.disponibilidade(apartamento_numero);
CREATE INDEX idx_disponibilidade_data ON public.disponibilidade(data_inicio, data_fim);
CREATE INDEX idx_disponibilidade_status ON public.disponibilidade(status);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_disponibilidade_updated_at
  BEFORE UPDATE ON public.disponibilidade
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
