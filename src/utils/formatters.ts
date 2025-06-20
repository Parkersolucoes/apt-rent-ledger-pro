
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getMesNome = (mes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1];
};

export const parseDateInput = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const calcularComissao = (valorLocacao: number): number => {
  return valorLocacao * 0.2;
};

export const calcularValorProprietario = (valorLocacao: number, taxaLimpeza: number, comissao: number): number => {
  const valorTotal = valorLocacao + taxaLimpeza;
  return valorTotal - taxaLimpeza - comissao;
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
