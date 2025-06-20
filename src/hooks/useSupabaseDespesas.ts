
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Despesa, FiltrosDespesa } from '@/types/despesa';
import { toast } from '@/hooks/use-toast';

export const useSupabaseDespesas = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      const despesasFormatadas = data.map(despesa => ({
        id: despesa.id,
        apartamento: despesa.apartamento,
        valor: Number(despesa.valor),
        descricao: despesa.descricao,
        data: new Date(despesa.data),
        createdAt: new Date(despesa.created_at),
        updatedAt: new Date(despesa.updated_at)
      }));

      setDespesas(despesasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as despesas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDespesas();
  }, []);

  const adicionarDespesa = async (despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .insert({
          apartamento: despesa.apartamento,
          valor: despesa.valor,
          descricao: despesa.descricao,
          data: despesa.data.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      const novaDespesa: Despesa = {
        id: data.id,
        apartamento: data.apartamento,
        valor: Number(data.valor),
        descricao: data.descricao,
        data: new Date(data.data),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setDespesas(prev => [novaDespesa, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a despesa.",
        variant: "destructive"
      });
    }
  };

  const removerDespesa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDespesas(prev => prev.filter(despesa => despesa.id !== id));
    } catch (error) {
      console.error('Erro ao remover despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a despesa.",
        variant: "destructive"
      });
    }
  };

  const obterDespesasPorApartamento = (apartamento: string) => {
    return despesas.filter(despesa => despesa.apartamento === apartamento);
  };

  const obterTotalDespesasPorApartamento = (apartamento: string) => {
    return despesas
      .filter(despesa => despesa.apartamento === apartamento)
      .reduce((total, despesa) => total + despesa.valor, 0);
  };

  return {
    despesas,
    loading,
    adicionarDespesa,
    removerDespesa,
    obterDespesasPorApartamento,
    obterTotalDespesasPorApartamento,
    carregarDespesas
  };
};
