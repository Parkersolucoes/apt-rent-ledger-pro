
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const migrarDadosParaSupabase = async () => {
  try {
    // Migrar apartamentos
    const apartamentosLocalStorage = localStorage.getItem('apartamentos');
    if (apartamentosLocalStorage) {
      const apartamentos = JSON.parse(apartamentosLocalStorage);
      console.log('Migrando apartamentos:', apartamentos.length);
      
      for (const apt of apartamentos) {
        const { error } = await supabase
          .from('apartamentos')
          .insert({
            numero: apt.numero,
            descricao: apt.descricao || null,
            endereco: apt.endereco || null,
            proprietario: apt.proprietario || null,
            ativo: apt.ativo
          });
        
        if (error) {
          console.error('Erro ao migrar apartamento:', apt.numero, error);
        }
      }
    }

    // Migrar locações
    const locacoesLocalStorage = localStorage.getItem('locacoes');
    if (locacoesLocalStorage) {
      const locacoes = JSON.parse(locacoesLocalStorage);
      console.log('Migrando locações:', locacoes.length);
      
      for (const loc of locacoes) {
        const { error } = await supabase
          .from('locacoes')
          .insert({
            apartamento: loc.apartamento,
            ano: loc.ano,
            mes: loc.mes,
            hospede: loc.hospede,
            data_entrada: new Date(loc.dataEntrada).toISOString().split('T')[0],
            data_saida: new Date(loc.dataSaida).toISOString().split('T')[0],
            valor_locacao: loc.valorLocacao,
            primeiro_pagamento: loc.primeiroPagamento,
            segundo_pagamento: loc.segundoPagamento,
            valor_faltando: loc.valorFaltando,
            taxa_limpeza: loc.taxaLimpeza,
            comissao: loc.comissao,
            data_pagamento_proprietario: loc.dataPagamentoProprietario ? new Date(loc.dataPagamentoProprietario).toISOString().split('T')[0] : null,
            observacoes: loc.observacoes || null
          });
        
        if (error) {
          console.error('Erro ao migrar locação:', loc.hospede, error);
        }
      }
    }

    toast({
      title: "Migração concluída!",
      description: "Dados migrados com sucesso para o Supabase.",
    });

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
    toast({
      title: "Erro na migração",
      description: "Ocorreu um erro ao migrar os dados.",
      variant: "destructive"
    });
  }
};

export const limparLocalStorage = () => {
  localStorage.removeItem('apartamentos');
  localStorage.removeItem('locacoes');
  toast({
    title: "Cache limpo",
    description: "Dados do localStorage foram removidos.",
  });
};
