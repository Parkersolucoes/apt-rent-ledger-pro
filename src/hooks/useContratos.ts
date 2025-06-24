
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contrato, TemplateContrato } from '@/types/contrato';
import { useToast } from '@/hooks/use-toast';

export const useContratos = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar contratos
  const {
    data: contratos = [],
    isLoading: isLoadingContratos,
    error: errorContratos
  } = useQuery({
    queryKey: ['contratos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Contrato[];
    }
  });

  // Buscar templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: errorTemplates
  } = useQuery({
    queryKey: ['templates_contrato'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates_contrato')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data as TemplateContrato[];
    }
  });

  // Criar contrato
  const criarContrato = useMutation({
    mutationFn: async (contrato: Omit<Contrato, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('contratos')
        .insert([contrato])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar contrato. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Atualizar contrato
  const atualizarContrato = useMutation({
    mutationFn: async ({ id, ...contrato }: Partial<Contrato> & { id: string }) => {
      const { data, error } = await supabase
        .from('contratos')
        .update(contrato)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({
        title: "Sucesso",
        description: "Contrato atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contrato. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Excluir contrato
  const excluirContrato = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({
        title: "Sucesso",
        description: "Contrato excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir contrato. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  return {
    contratos,
    templates,
    isLoadingContratos,
    isLoadingTemplates,
    errorContratos,
    errorTemplates,
    criarContrato,
    atualizarContrato,
    excluirContrato
  };
};
