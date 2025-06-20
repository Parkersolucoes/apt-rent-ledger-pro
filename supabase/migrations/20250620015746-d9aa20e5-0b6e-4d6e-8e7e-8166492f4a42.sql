
-- Verificar se RLS está habilitado na tabela despesas e habilitar se necessário
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir tudo em despesas" ON public.despesas;

-- Criar política permissiva para despesas (sem autenticação por enquanto)
CREATE POLICY "Permitir tudo em despesas" ON public.despesas
  FOR ALL USING (true) WITH CHECK (true);

-- Garantir que os campos de pagamento tenham valores padrão corretos
UPDATE public.locacoes 
SET primeiro_pagamento_pago = COALESCE(primeiro_pagamento_pago, false),
    segundo_pagamento_pago = COALESCE(segundo_pagamento_pago, false)
WHERE primeiro_pagamento_pago IS NULL OR segundo_pagamento_pago IS NULL;

-- Criar função para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se houver e criar novo
DROP TRIGGER IF EXISTS update_despesas_updated_at ON public.despesas;
CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON public.despesas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
