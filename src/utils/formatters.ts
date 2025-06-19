
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDateInput = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const getMesNome = (mes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1];
};

export const calcularComissao = (valorTotal: number): number => {
  return valorTotal * 0.2;
};
