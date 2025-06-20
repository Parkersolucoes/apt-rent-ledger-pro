
-- Corrigir inconsistências no schema da tabela locacoes
-- Adicionar campo que está faltando no banco
ALTER TABLE locacoes 
ADD COLUMN IF NOT EXISTS valor_proprietario NUMERIC DEFAULT 0;

-- Garantir que os campos de pagamento tenham valores padrão corretos
UPDATE locacoes 
SET primeiro_pagamento_pago = COALESCE(primeiro_pagamento_pago, false),
    segundo_pagamento_pago = COALESCE(segundo_pagamento_pago, false),
    primeiro_pagamento_forma = COALESCE(primeiro_pagamento_forma, 'Dinheiro'),
    segundo_pagamento_forma = COALESCE(segundo_pagamento_forma, 'Dinheiro')
WHERE primeiro_pagamento_pago IS NULL 
   OR segundo_pagamento_pago IS NULL 
   OR primeiro_pagamento_forma IS NULL 
   OR segundo_pagamento_forma IS NULL;

-- Garantir que as constraints existam para formas de pagamento
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_primeiro_pagamento_forma'
    ) THEN
        ALTER TABLE locacoes
        ADD CONSTRAINT check_primeiro_pagamento_forma 
        CHECK (primeiro_pagamento_forma IN ('Dinheiro', 'Cartão', 'Pix', 'Outros'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_segundo_pagamento_forma'
    ) THEN
        ALTER TABLE locacoes
        ADD CONSTRAINT check_segundo_pagamento_forma 
        CHECK (segundo_pagamento_forma IN ('Dinheiro', 'Cartão', 'Pix', 'Outros'));
    END IF;
END $$;

-- Verificar e corrigir estrutura da tabela apartamentos
ALTER TABLE apartamentos 
ALTER COLUMN ativo SET DEFAULT true,
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Verificar e corrigir estrutura da tabela despesas
ALTER TABLE despesas 
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Criar função de trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de updated_at nas tabelas se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_apartamentos_updated_at'
    ) THEN
        CREATE TRIGGER update_apartamentos_updated_at 
        BEFORE UPDATE ON apartamentos
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_despesas_updated_at'
    ) THEN
        CREATE TRIGGER update_despesas_updated_at 
        BEFORE UPDATE ON despesas
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
