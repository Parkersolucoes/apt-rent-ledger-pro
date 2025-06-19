
import { useState, useEffect } from 'react';
import { Locacao, FiltrosLocacao } from '@/types/locacao';

export const useLocacoes = () => {
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedLocacoes = localStorage.getItem('locacoes');
    if (savedLocacoes) {
      const parsed = JSON.parse(savedLocacoes);
      setLocacoes(parsed.map((loc: any) => ({
        ...loc,
        dataEntrada: new Date(loc.dataEntrada),
        dataSaida: new Date(loc.dataSaida),
        dataPagamentoProprietario: loc.dataPagamentoProprietario ? new Date(loc.dataPagamentoProprietario) : undefined,
        createdAt: new Date(loc.createdAt)
      })));
    }
  }, []);

  // Salvar no localStorage sempre que locacoes mudar
  useEffect(() => {
    localStorage.setItem('locacoes', JSON.stringify(locacoes));
  }, [locacoes]);

  const adicionarLocacao = (locacao: Omit<Locacao, 'id' | 'createdAt'>) => {
    const novaLocacao: Locacao = {
      ...locacao,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setLocacoes(prev => [...prev, novaLocacao]);
  };

  const atualizarLocacao = (id: string, locacao: Partial<Locacao>) => {
    setLocacoes(prev => prev.map(loc => 
      loc.id === id ? { ...loc, ...locacao } : loc
    ));
  };

  const removerLocacao = (id: string) => {
    setLocacoes(prev => prev.filter(loc => loc.id !== id));
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
    adicionarLocacao,
    atualizarLocacao,
    removerLocacao,
    filtrarLocacoes,
    obterApartamentos,
    obterAnos
  };
};
