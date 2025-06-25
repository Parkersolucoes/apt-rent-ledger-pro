
-- Criar tabela para dados da empresa/administradora
CREATE TABLE public.empresa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  site TEXT,
  responsavel TEXT,
  cargo_responsavel TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_empresa_updated_at
  BEFORE UPDATE ON public.empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir registro padrão da empresa
INSERT INTO public.empresa (nome, cnpj, endereco, telefone, email, responsavel, cargo_responsavel) 
VALUES (
  'Sua Empresa Ltda', 
  '00.000.000/0001-00', 
  'Rua Exemplo, 123 - Centro - Cidade/UF - CEP 00000-000',
  '(11) 99999-9999',
  'contato@suaempresa.com.br',
  'Nome do Responsável',
  'Administrador'
);
