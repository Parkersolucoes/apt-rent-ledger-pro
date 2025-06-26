
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Disponibilidade {
  id: string;
  apartamento_numero: string;
  data_inicio: string;
  data_fim: string;
  status: 'disponivel' | 'ocupado' | 'bloqueado' | 'manutencao';
  hospede?: string;
  valor_diaria?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const useDisponibilidade = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: disponibilidades = [], isLoading, error } = useQuery({
    queryKey: ['disponibilidade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disponibilidade')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      return data as Disponibilidade[];
    },
  });

  const criarDisponibilidade = useMutation({
    mutationFn: async (novaDisponibilidade: Omit<Disponibilidade, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('disponibilidade')
        .insert([novaDisponibilidade])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
      toast({
        title: "Sucesso",
        description: "Período de disponibilidade criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar disponibilidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar período de disponibilidade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const atualizarDisponibilidade = useMutation({
    mutationFn: async ({ id, ...dados }: Partial<Disponibilidade> & { id: string }) => {
      const { data, error } = await supabase
        .from('disponibilidade')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
      toast({
        title: "Sucesso",
        description: "Disponibilidade atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar disponibilidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar disponibilidade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const excluirDisponibilidade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('disponibilidade')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
      toast({
        title: "Sucesso",
        description: "Período de disponibilidade excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir disponibilidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir período de disponibilidade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    disponibilidades,
    isLoading,
    error,
    criarDisponibilidade,
    atualizarDisponibilidade,
    excluirDisponibilidade,
  };
};
