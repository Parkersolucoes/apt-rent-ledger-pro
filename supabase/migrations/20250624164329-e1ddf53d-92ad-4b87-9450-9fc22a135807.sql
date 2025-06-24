
-- Criar tabela para contratos com proprietários
CREATE TABLE public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  proprietario_nome TEXT NOT NULL,
  apartamento_numero TEXT,
  data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_assinatura DATE,
  data_vencimento DATE,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'assinado', 'vencido', 'cancelado')),
  percentual_comissao NUMERIC DEFAULT 0,
  valor_mensal NUMERIC DEFAULT 0,
  variaveis JSONB DEFAULT '{}',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para templates de contratos
CREATE TABLE public.templates_contrato (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  variaveis TEXT[] DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_templates_contrato_updated_at
  BEFORE UPDATE ON public.templates_contrato
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir template padrão de contrato de autorização
INSERT INTO public.templates_contrato (nome, titulo, conteudo, variaveis) VALUES 
('Contrato de Autorização para Locação', 
 'CONTRATO DE AUTORIZAÇÃO PARA LOCAÇÃO DE IMÓVEL',
 'CONTRATO DE AUTORIZAÇÃO PARA LOCAÇÃO DE IMÓVEL

PROPRIETÁRIO (OUTORGANTE):
Nome: {{proprietario_nome}}
Telefone: {{proprietario_telefone}}
CPF/CNPJ: {{proprietario_documento}}

ADMINISTRADORA (OUTORGADA):
Nome: {{administradora_nome}}
CNPJ: {{administradora_cnpj}}
Endereço: {{administradora_endereco}}
Telefone: {{administradora_telefone}}

IMÓVEL OBJETO DO CONTRATO:
Endereço: {{apartamento_endereco}}
Apartamento: {{apartamento_numero}}
Descrição: {{apartamento_descricao}}

CLÁUSULAS E CONDIÇÕES:

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem por objeto autorizar a OUTORGADA a administrar e locar o imóvel acima descrito para temporada/hospedagem.

CLÁUSULA 2ª - DA COMISSÃO
A OUTORGADA terá direito a uma comissão de {{percentual_comissao}}% sobre o valor bruto de cada locação realizada.

CLÁUSULA 3ª - DAS OBRIGAÇÕES DA ADMINISTRADORA
A OUTORGADA se compromete a:
- Divulgar o imóvel em plataformas de hospedagem
- Realizar check-in e check-out dos hóspedes
- Manter o imóvel em condições adequadas de limpeza
- Repassar os valores ao proprietário conforme acordado

CLÁUSULA 4ª - DAS OBRIGAÇÕES DO PROPRIETÁRIO
O OUTORGANTE se compromete a:
- Manter o imóvel em boas condições de habitabilidade
- Fornecer documentação necessária do imóvel
- Permitir acesso para manutenção e limpeza

CLÁUSULA 5ª - DO PRAZO
Este contrato tem vigência de {{prazo_vigencia}}, podendo ser renovado mediante acordo entre as partes.

CLÁUSULA 6ª - DA RESCISÃO
Qualquer das partes pode rescindir este contrato mediante aviso prévio de 30 (trinta) dias.

Local e Data: {{local_data}}

______________________          ______________________
OUTORGANTE                      OUTORGADA
{{proprietario_nome}}           {{administradora_nome}}',
ARRAY['proprietario_nome', 'proprietario_telefone', 'proprietario_documento', 'administradora_nome', 'administradora_cnpj', 'administradora_endereco', 'administradora_telefone', 'apartamento_endereco', 'apartamento_numero', 'apartamento_descricao', 'percentual_comissao', 'prazo_vigencia', 'local_data']);
