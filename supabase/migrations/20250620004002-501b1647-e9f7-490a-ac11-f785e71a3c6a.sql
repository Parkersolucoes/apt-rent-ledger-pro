
-- Add payment status columns to the locacoes table
ALTER TABLE locacoes 
ADD COLUMN primeiro_pagamento_pago BOOLEAN DEFAULT FALSE,
ADD COLUMN segundo_pagamento_pago BOOLEAN DEFAULT FALSE;
