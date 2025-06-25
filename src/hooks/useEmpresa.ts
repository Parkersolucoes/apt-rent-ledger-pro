
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  site?: string;
  responsavel?: string;
  cargo_responsavel?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Novos campos baseados no contrato
  razao_social?: string;
  nome_fantasia?: string;
  telefone_secundario?: string;
  cpf_responsavel?: string;
  rg_responsavel?: string;
  orgao_expeditor?: string;
  nacionalidade_responsavel?: string;
  estado_civil_responsavel?: string;
  profissao_responsavel?: string;
  endereco_responsavel?: string;
}

export const useEmpresa = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados da empresa ativa
  const {
    data: empresa,
    isLoading,
    error
  } = useQuery({
    queryKey: ['empresa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as Empresa;
    }
  });

  // Atualizar dados da empresa
  const atualizarEmpresa = useMutation({
    mutationFn: async (dadosEmpresa: Partial<Empresa>) => {
      if (!empresa?.id) {
        throw new Error('ID da empresa não encontrado');
      }

      const { data, error } = await supabase
        .from('empresa')
        .update(dadosEmpresa)
        .eq('id', empresa.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa'] });
      toast({
        title: "Sucesso",
        description: "Dados da empresa atualizados com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados da empresa. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Criar nova empresa
  const criarEmpresa = useMutation({
    mutationFn: async (dadosEmpresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('empresa')
        .insert([dadosEmpresa])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa'] });
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar empresa. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  return {
    empresa,
    isLoading,
    error,
    atualizarEmpresa,
    criarEmpresa
  };
};
