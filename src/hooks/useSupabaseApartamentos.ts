
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Apartamento, FiltrosApartamento } from '@/types/apartamento';
import { toast } from '@/hooks/use-toast';

export const useSupabaseApartamentos = () => {
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar apartamentos do Supabase
  const carregarApartamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('apartamentos')
        .select('*')
        .order('numero');

      if (error) throw error;

      const apartamentosFormatados = data.map(apt => ({
        id: apt.id,
        numero: apt.numero,
        descricao: apt.descricao || undefined,
        endereco: apt.endereco || undefined,
        proprietario: apt.proprietario || undefined,
        telefoneProprietario: apt.telefone_proprietario || undefined,
        ativo: apt.ativo,
        createdAt: new Date(apt.created_at),
        updatedAt: new Date(apt.updated_at)
      }));

      setApartamentos(apartamentosFormatados);
    } catch (error) {
      console.error('Erro ao carregar apartamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os apartamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarApartamentos();
  }, []);

  const adicionarApartamento = async (apartamento: Omit<Apartamento, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('apartamentos')
        .insert({
          numero: apartamento.numero,
          descricao: apartamento.descricao || null,
          endereco: apartamento.endereco || null,
          proprietario: apartamento.proprietario || null,
          telefone_proprietario: apartamento.telefoneProprietario || null,
          ativo: apartamento.ativo
        })
        .select()
        .single();

      if (error) throw error;

      const novoApartamento: Apartamento = {
        id: data.id,
        numero: data.numero,
        descricao: data.descricao || undefined,
        endereco: data.endereco || undefined,
        proprietario: data.proprietario || undefined,
        telefoneProprietario: data.telefone_proprietario || undefined,
        ativo: data.ativo,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setApartamentos(prev => [...prev, novoApartamento]);
    } catch (error) {
      console.error('Erro ao adicionar apartamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o apartamento.",
        variant: "destructive"
      });
    }
  };

  const atualizarApartamento = async (id: string, apartamento: Partial<Apartamento>) => {
    try {
      const { data, error } = await supabase
        .from('apartamentos')
        .update({
          numero: apartamento.numero,
          descricao: apartamento.descricao || null,
          endereco: apartamento.endereco || null,
          proprietario: apartamento.proprietario || null,
          telefone_proprietario: apartamento.telefoneProprietario || null,
          ativo: apartamento.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const apartamentoAtualizado: Apartamento = {
        id: data.id,
        numero: data.numero,
        descricao: data.descricao || undefined,
        endereco: data.endereco || undefined,
        proprietario: data.proprietario || undefined,
        telefoneProprietario: data.telefone_proprietario || undefined,
        ativo: data.ativo,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setApartamentos(prev => 
        prev.map(apt => apt.id === id ? apartamentoAtualizado : apt)
      );
    } catch (error) {
      console.error('Erro ao atualizar apartamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o apartamento.",
        variant: "destructive"
      });
    }
  };

  const removerApartamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('apartamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApartamentos(prev => prev.filter(apt => apt.id !== id));
    } catch (error) {
      console.error('Erro ao remover apartamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o apartamento.",
        variant: "destructive"
      });
    }
  };

  const filtrarApartamentos = (filtros: FiltrosApartamento) => {
    return apartamentos.filter(apartamento => {
      if (filtros.ativo !== undefined && apartamento.ativo !== filtros.ativo) {
        return false;
      }
      if (filtros.proprietario && apartamento.proprietario !== filtros.proprietario) {
        return false;
      }
      return true;
    });
  };

  const obterApartamentoPorNumero = (numero: string) => {
    return apartamentos.find(apt => apt.numero === numero);
  };

  const obterNumerosApartamentos = () => {
    return apartamentos.filter(apt => apt.ativo).map(apt => apt.numero).sort();
  };

  return {
    apartamentos,
    loading,
    adicionarApartamento,
    atualizarApartamento,
    removerApartamento,
    filtrarApartamentos,
    obterApartamentoPorNumero,
    obterNumerosApartamentos,
    carregarApartamentos
  };
};
