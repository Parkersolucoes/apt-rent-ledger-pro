
-- Criar tabela para configurações do sistema
CREATE TABLE public.configuracoes_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configuração inicial para a logo
INSERT INTO public.configuracoes_sistema (chave, valor) 
VALUES ('logo_empresa', NULL);

-- Criar bucket para armazenar as imagens da logo
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Criar política de storage para permitir upload de logos
CREATE POLICY "Permitir upload de logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Permitir visualização de logos" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Permitir atualização de logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'logos');

CREATE POLICY "Permitir exclusão de logos" ON storage.objects
FOR DELETE USING (bucket_id = 'logos');

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_sistema_updated_at
  BEFORE UPDATE ON public.configuracoes_sistema
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
