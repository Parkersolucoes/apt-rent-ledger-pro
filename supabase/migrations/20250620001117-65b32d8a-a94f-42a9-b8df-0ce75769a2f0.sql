
-- Criar tabela de apartamentos
CREATE TABLE public.apartamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  descricao TEXT,
  endereco TEXT,
  proprietario TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de locações
CREATE TABLE public.locacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartamento TEXT NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  hospede TEXT NOT NULL,
  data_entrada DATE NOT NULL,
  data_saida DATE NOT NULL,
  valor_locacao DECIMAL(10,2) NOT NULL,
  primeiro_pagamento DECIMAL(10,2) NOT NULL DEFAULT 0,
  segundo_pagamento DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_faltando DECIMAL(10,2) NOT NULL DEFAULT 0,
  taxa_limpeza DECIMAL(10,2) NOT NULL DEFAULT 0,
  comissao DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_pagamento_proprietario DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_apartamentos_numero ON public.apartamentos(numero);
CREATE INDEX idx_apartamentos_ativo ON public.apartamentos(ativo);
CREATE INDEX idx_locacoes_apartamento ON public.locacoes(apartamento);
CREATE INDEX idx_locacoes_ano_mes ON public.locacoes(ano, mes);

-- Habilitar Row Level Security (por enquanto sem políticas restritivas)
ALTER TABLE public.apartamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas temporárias (para funcionar sem autenticação por enquanto)
CREATE POLICY "Permitir tudo em apartamentos" ON public.apartamentos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir tudo em locações" ON public.locacoes
  FOR ALL USING (true) WITH CHECK (true);
