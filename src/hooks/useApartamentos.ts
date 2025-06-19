
import { useState, useEffect } from 'react';
import { Apartamento, FiltrosApartamento } from '@/types/apartamento';

export const useApartamentos = () => {
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedApartamentos = localStorage.getItem('apartamentos');
    if (savedApartamentos) {
      const parsed = JSON.parse(savedApartamentos);
      setApartamentos(parsed.map((apt: any) => ({
        ...apt,
        createdAt: new Date(apt.createdAt),
        updatedAt: new Date(apt.updatedAt)
      })));
    }
  }, []);

  // Salvar no localStorage sempre que apartamentos mudar
  useEffect(() => {
    localStorage.setItem('apartamentos', JSON.stringify(apartamentos));
  }, [apartamentos]);

  const adicionarApartamento = (apartamento: Omit<Apartamento, 'id' | 'createdAt' | 'updatedAt'>) => {
    const novoApartamento: Apartamento = {
      ...apartamento,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setApartamentos(prev => [...prev, novoApartamento]);
  };

  const atualizarApartamento = (id: string, apartamento: Partial<Apartamento>) => {
    setApartamentos(prev => prev.map(apt => 
      apt.id === id ? { ...apt, ...apartamento, updatedAt: new Date() } : apt
    ));
  };

  const removerApartamento = (id: string) => {
    setApartamentos(prev => prev.filter(apt => apt.id !== id));
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
    adicionarApartamento,
    atualizarApartamento,
    removerApartamento,
    filtrarApartamentos,
    obterApartamentoPorNumero,
    obterNumerosApartamentos
  };
};
