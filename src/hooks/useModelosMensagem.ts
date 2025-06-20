
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModeloMensagem, NovoModeloMensagem } from '@/types/modeloMensagem';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';

export const useModelosMensagem = () => {
  const [modelos, setModelos] = useState<ModeloMensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const carregarModelos = async () => {
    try {
      const { data, error } = await supabase
        .from('modelos_mensagem')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const modelosFormatados = data?.map(modelo => ({
        ...modelo,
        created_at: new Date(modelo.created_at),
        updated_at: new Date(modelo.updated_at),
        variaveis: modelo.variaveis || []
      })) || [];

      setModelos(modelosFormatados);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar modelos de mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarDespesasPorPeriodo = async (apartamento: string, dataInicio: Date, dataFim: Date): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('apartamento', apartamento)
        .gte('data', dataInicio.toISOString().split('T')[0])
        .lte('data', dataFim.toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'Nenhuma despesa registrada no período.';
      }

      let resumoDespesas = '';
      let totalDespesas = 0;

      data.forEach((despesa, index) => {
        const valor = parseFloat(despesa.valor.toString());
        totalDespesas += valor;
        resumoDespesas += `${index + 1}. ${despesa.descricao}: ${formatCurrency(valor)}\n`;
      });

      resumoDespesas += `\n💰 Total de despesas: ${formatCurrency(totalDespesas)}`;

      return resumoDespesas;
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      return 'Erro ao carregar despesas do período.';
    }
  };

  const criarModelo = async (novoModelo: NovoModeloMensagem): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('modelos_mensagem')
        .insert([novoModelo]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Modelo criado com sucesso",
      });

      await carregarModelos();
      return true;
    } catch (error) {
      console.error('Erro ao criar modelo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar modelo",
        variant: "destructive",
      });
      return false;
    }
  };

  const atualizarModelo = async (id: string, modelo: Partial<NovoModeloMensagem>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('modelos_mensagem')
        .update(modelo)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Modelo atualizado com sucesso",
      });

      await carregarModelos();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar modelo",
        variant: "destructive",
      });
      return false;
    }
  };

  const excluirModelo = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('modelos_mensagem')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Modelo excluído com sucesso",
      });

      await carregarModelos();
      return true;
    } catch (error) {
      console.error('Erro ao excluir modelo:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir modelo",
        variant: "destructive",
      });
      return false;
    }
  };

  const processarTemplate = async (template: string, variaveis: Record<string, string>): Promise<string> => {
    let resultado = template;
    
    // Processar variáveis especiais que precisam de busca no banco
    if (template.includes('{{despesas_periodo}}') && variaveis.apartamento) {
      try {
        // Buscar despesas do mês atual como exemplo
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        const despesas = await buscarDespesasPorPeriodo(variaveis.apartamento, inicioMes, fimMes);
        variaveis.despesas_periodo = despesas;
      } catch (error) {
        console.error('Erro ao buscar despesas:', error);
        variaveis.despesas_periodo = 'Erro ao carregar despesas do período.';
      }
    }

    // Substituir todas as variáveis no template
    Object.entries(variaveis).forEach(([chave, valor]) => {
      const regex = new RegExp(`{{${chave}}}`, 'g');
      resultado = resultado.replace(regex, valor || '');
    });
    
    return resultado;
  };

  useEffect(() => {
    carregarModelos();
  }, []);

  return {
    modelos,
    loading,
    criarModelo,
    atualizarModelo,
    excluirModelo,
    carregarModelos,
    processarTemplate,
    buscarDespesasPorPeriodo
  };
};
