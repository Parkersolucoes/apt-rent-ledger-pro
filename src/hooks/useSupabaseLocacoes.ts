
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Locacao, FiltrosLocacao } from '@/types/locacao';
import { toast } from '@/hooks/use-toast';

export const useSupabaseLocacoes = () => {
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar locações do Supabase
  const carregarLocacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('locacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const locacoesFormatadas = data.map(loc => ({
        id: loc.id,
        apartamento: loc.apartamento,
        ano: loc.ano,
        mes: loc.mes,
        hospede: loc.hospede,
        dataEntrada: new Date(loc.data_entrada),
        dataSaida: new Date(loc.data_saida),
        valorLocacao: Number(loc.valor_locacao),
        primeiroPagamento: Number(loc.primeiro_pagamento),
        segundoPagamento: Number(loc.segundo_pagamento),
        valorFaltando: Number(loc.valor_faltando),
        taxaLimpeza: Number(loc.taxa_limpeza),
        comissao: Number(loc.comissao),
        dataPagamentoProprietario: loc.data_pagamento_proprietario ? new Date(loc.data_pagamento_proprietario) : undefined,
        observacoes: loc.observacoes || undefined,
        createdAt: new Date(loc.created_at)
      }));

      setLocacoes(locacoesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar locações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as locações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLocacoes();
  }, []);

  const adicionarLocacao = async (locacao: Omit<Locacao, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('locacoes')
        .insert({
          apartamento: locacao.apartamento,
          ano: locacao.ano,
          mes: locacao.mes,
          hospede: locacao.hospede,
          data_entrada: locacao.dataEntrada.toISOString().split('T')[0],
          data_saida: locacao.dataSaida.toISOString().split('T')[0],
          valor_locacao: locacao.valorLocacao,
          primeiro_pagamento: locacao.primeiroPagamento,
          segundo_pagamento: locacao.segundoPagamento,
          valor_faltando: locacao.valorFaltando,
          taxa_limpeza: locacao.taxaLimpeza,
          comissao: locacao.comissao,
          data_pagamento_proprietario: locacao.dataPagamentoProprietario?.toISOString().split('T')[0] || null,
          observacoes: locacao.observacoes || null
        })
        .select()
        .single();

      if (error) throw error;

      const novaLocacao: Locacao = {
        id: data.id,
        apartamento: data.apartamento,
        ano: data.ano,
        mes: data.mes,
        hospede: data.hospede,
        dataEntrada: new Date(data.data_entrada),
        dataSaida: new Date(data.data_saida),
        valorLocacao: Number(data.valor_locacao),
        primeiroPagamento: Number(data.primeiro_pagamento),
        segundoPagamento: Number(data.segundo_pagamento),
        valorFaltando: Number(data.valor_faltando),
        taxaLimpeza: Number(data.taxa_limpeza),
        comissao: Number(data.comissao),
        dataPagamentoProprietario: data.data_pagamento_proprietario ? new Date(data.data_pagamento_proprietario) : undefined,
        observacoes: data.observacoes || undefined,
        createdAt: new Date(data.created_at)
      };

      setLocacoes(prev => [novaLocacao, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar locação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a locação.",
        variant: "destructive"
      });
    }
  };

  const atualizarLocacao = async (id: string, locacao: Partial<Locacao>) => {
    try {
      const updateData: any = {};
      
      if (locacao.apartamento !== undefined) updateData.apartamento = locacao.apartamento;
      if (locacao.ano !== undefined) updateData.ano = locacao.ano;
      if (locacao.mes !== undefined) updateData.mes = locacao.mes;
      if (locacao.hospede !== undefined) updateData.hospede = locacao.hospede;
      if (locacao.dataEntrada !== undefined) updateData.data_entrada = locacao.dataEntrada.toISOString().split('T')[0];
      if (locacao.dataSaida !== undefined) updateData.data_saida = locacao.dataSaida.toISOString().split('T')[0];
      if (locacao.valorLocacao !== undefined) updateData.valor_locacao = locacao.valorLocacao;
      if (locacao.primeiroPagamento !== undefined) updateData.primeiro_pagamento = locacao.primeiroPagamento;
      if (locacao.segundoPagamento !== undefined) updateData.segundo_pagamento = locacao.segundoPagamento;
      if (locacao.valorFaltando !== undefined) updateData.valor_faltando = locacao.valorFaltando;
      if (locacao.taxaLimpeza !== undefined) updateData.taxa_limpeza = locacao.taxaLimpeza;
      if (locacao.comissao !== undefined) updateData.comissao = locacao.comissao;
      if (locacao.dataPagamentoProprietario !== undefined) {
        updateData.data_pagamento_proprietario = locacao.dataPagamentoProprietario?.toISOString().split('T')[0] || null;
      }
      if (locacao.observacoes !== undefined) updateData.observacoes = locacao.observacoes || null;

      const { data, error } = await supabase
        .from('locacoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const locacaoAtualizada: Locacao = {
        id: data.id,
        apartamento: data.apartamento,
        ano: data.ano,
        mes: data.mes,
        hospede: data.hospede,
        dataEntrada: new Date(data.data_entrada),
        dataSaida: new Date(data.data_saida),
        valorLocacao: Number(data.valor_locacao),
        primeiroPagamento: Number(data.primeiro_pagamento),
        segundoPagamento: Number(data.segundo_pagamento),
        valorFaltando: Number(data.valor_faltando),
        taxaLimpeza: Number(data.taxa_limpeza),
        comissao: Number(data.comissao),
        dataPagamentoProprietario: data.data_pagamento_proprietario ? new Date(data.data_pagamento_proprietario) : undefined,
        observacoes: data.observacoes || undefined,
        createdAt: new Date(data.created_at)
      };

      setLocacoes(prev => 
        prev.map(loc => loc.id === id ? locacaoAtualizada : loc)
      );
    } catch (error) {
      console.error('Erro ao atualizar locação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a locação.",
        variant: "destructive"
      });
    }
  };

  const removerLocacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLocacoes(prev => prev.filter(loc => loc.id !== id));
    } catch (error) {
      console.error('Erro ao remover locação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a locação.",
        variant: "destructive"
      });
    }
  };

  const filtrarLocacoes = (filtros: FiltrosLocacao) => {
    return locacoes.filter(locacao => {
      if (filtros.apartamento && locacao.apartamento !== filtros.apartamento) {
        return false;
      }
      if (filtros.ano && locacao.ano !== filtros.ano) {
        return false;
      }
      if (filtros.mes && locacao.mes !== filtros.mes) {
        return false;
      }
      return true;
    });
  };

  const obterApartamentos = () => {
    return Array.from(new Set(locacoes.map(loc => loc.apartamento))).sort();
  };

  const obterAnos = () => {
    return Array.from(new Set(locacoes.map(loc => loc.ano))).sort((a, b) => b - a);
  };

  return {
    locacoes,
    loading,
    adicionarLocacao,
    atualizarLocacao,
    removerLocacao,
    filtrarLocacoes,
    obterApartamentos,
    obterAnos,
    carregarLocacoes
  };
};
