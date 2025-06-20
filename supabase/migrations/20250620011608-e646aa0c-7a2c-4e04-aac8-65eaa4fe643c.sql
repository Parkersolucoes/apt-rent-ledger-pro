
-- Adicionar campos de forma de pagamento na tabela locacoes
ALTER TABLE locacoes 
ADD COLUMN primeiro_pagamento_forma TEXT DEFAULT 'Dinheiro',
ADD COLUMN segundo_pagamento_forma TEXT DEFAULT 'Dinheiro';

-- Adicionar constraint para validar as formas de pagamento
ALTER TABLE locacoes
ADD CONSTRAINT check_primeiro_pagamento_forma 
CHECK (primeiro_pagamento_forma IN ('Dinheiro', 'Cartão', 'Pix', 'Outros'));

ALTER TABLE locacoes
ADD CONSTRAINT check_segundo_pagamento_forma 
CHECK (segundo_pagamento_forma IN ('Dinheiro', 'Cartão', 'Pix', 'Outros'));
