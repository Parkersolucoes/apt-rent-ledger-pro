import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Agendamento, LogAgendamento } from '@/types/agendamento';
import { toast } from '@/hooks/use-toast';

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [logs, setLogs] = useState<LogAgendamento[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const agendamentosFormatados = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        frequencia: item.frequencia as Agendamento['frequencia'],
        horario: item.horario,
        numero_whatsapp: item.numero_whatsapp,
        tipo_informacao: item.tipo_informacao as Agendamento['tipo_informacao'],
        status: item.status,
        proximo_envio: item.proximo_envio ? new Date(item.proximo_envio) : undefined,
        configuracoes_extras: (item.configuracoes_extras as Record<string, any>) || {},
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at)
      }));

      setAgendamentos(agendamentosFormatados);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarLogs = async (agendamentoId?: string) => {
    try {
      let query = supabase
        .from('logs_agendamentos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (agendamentoId) {
        query = query.eq('agendamento_id', agendamentoId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logsFormatados = (data || []).map(item => ({
        id: item.id,
        agendamento_id: item.agendamento_id,
        data_envio: new Date(item.data_envio),
        sucesso: item.sucesso,
        mensagem_enviada: item.mensagem_enviada,
        erro: item.erro,
        detalhes: (item.detalhes as Record<string, any>) || {},
        created_at: new Date(item.created_at)
      }));

      setLogs(logsFormatados);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const adicionarAgendamento = async (agendamento: Omit<Agendamento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          nome: agendamento.nome,
          frequencia: agendamento.frequencia,
          horario: agendamento.horario,
          numero_whatsapp: agendamento.numero_whatsapp,
          tipo_informacao: agendamento.tipo_informacao,
          status: agendamento.status,
          proximo_envio: agendamento.proximo_envio?.toISOString(),
          configuracoes_extras: agendamento.configuracoes_extras || {}
        })
        .select()
        .single();

      if (error) throw error;

      const novoAgendamento: Agendamento = {
        id: data.id,
        nome: data.nome,
        frequencia: data.frequencia as Agendamento['frequencia'],
        horario: data.horario,
        numero_whatsapp: data.numero_whatsapp,
        tipo_informacao: data.tipo_informacao as Agendamento['tipo_informacao'],
        status: data.status,
        proximo_envio: data.proximo_envio ? new Date(data.proximo_envio) : undefined,
        configuracoes_extras: (data.configuracoes_extras as Record<string, any>) || {},
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setAgendamentos(prev => [novoAgendamento, ...prev]);

      toast({
        title: "Sucesso!",
        description: "Agendamento criado com sucesso.",
      });

      return novoAgendamento;
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const atualizarAgendamento = async (id: string, agendamento: Partial<Agendamento>) => {
    try {
      const updateData: any = {};
      
      if (agendamento.nome !== undefined) updateData.nome = agendamento.nome;
      if (agendamento.frequencia !== undefined) updateData.frequencia = agendamento.frequencia;
      if (agendamento.horario !== undefined) updateData.horario = agendamento.horario;
      if (agendamento.numero_whatsapp !== undefined) updateData.numero_whatsapp = agendamento.numero_whatsapp;
      if (agendamento.tipo_informacao !== undefined) updateData.tipo_informacao = agendamento.tipo_informacao;
      if (agendamento.status !== undefined) updateData.status = agendamento.status;
      if (agendamento.proximo_envio !== undefined) updateData.proximo_envio = agendamento.proximo_envio?.toISOString();
      if (agendamento.configuracoes_extras !== undefined) updateData.configuracoes_extras = agendamento.configuracoes_extras;

      const { data, error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const agendamentoAtualizado: Agendamento = {
        id: data.id,
        nome: data.nome,
        frequencia: data.frequencia as Agendamento['frequencia'],
        horario: data.horario,
        numero_whatsapp: data.numero_whatsapp,
        tipo_informacao: data.tipo_informacao as Agendamento['tipo_informacao'],
        status: data.status,
        proximo_envio: data.proximo_envio ? new Date(data.proximo_envio) : undefined,
        configuracoes_extras: (data.configuracoes_extras as Record<string, any>) || {},
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setAgendamentos(prev => 
        prev.map(a => a.id === id ? agendamentoAtualizado : a)
      );

      toast({
        title: "Sucesso!",
        description: "Agendamento atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removerAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAgendamentos(prev => prev.filter(a => a.id !== id));

      toast({
        title: "Sucesso!",
        description: "Agendamento removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  return {
    agendamentos,
    logs,
    loading,
    adicionarAgendamento,
    atualizarAgendamento,
    removerAgendamento,
    carregarAgendamentos,
    carregarLogs
  };
};