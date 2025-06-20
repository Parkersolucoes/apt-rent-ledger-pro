
-- Tornar os campos ano e mes opcionais na tabela locacoes
-- já que agora eles são calculados automaticamente a partir da data de entrada
ALTER TABLE locacoes 
ALTER COLUMN ano DROP NOT NULL,
ALTER COLUMN mes DROP NOT NULL;

-- Adicionar valores padrão para evitar problemas com registros existentes
UPDATE locacoes 
SET ano = EXTRACT(YEAR FROM data_entrada),
    mes = EXTRACT(MONTH FROM data_entrada)
WHERE ano IS NULL OR mes IS NULL;
