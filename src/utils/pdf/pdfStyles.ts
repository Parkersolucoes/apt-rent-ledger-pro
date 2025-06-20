
export const colors = {
  primary: [37, 99, 235] as [number, number, number],
  primaryLight: [219, 234, 254] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  successLight: [240, 253, 244] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  dangerLight: [254, 242, 242] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  grayLight: [249, 250, 251] as [number, number, number],
  dark: [17, 24, 39] as [number, number, number],
  border: [229, 231, 235] as [number, number, number]
};

export const pdfDimensions = {
  margin: 20,
  pageWidth: 297, // A4 paisagem
  pageHeight: 210, // A4 paisagem
  get contentWidth() { return this.pageWidth - (this.margin * 2); }
};

export const meses = [
  { valor: 1, nome: 'Janeiro' },
  { valor: 2, nome: 'Fevereiro' },
  { valor: 3, nome: 'Março' },
  { valor: 4, nome: 'Abril' },
  { valor: 5, nome: 'Maio' },
  { valor: 6, nome: 'Junho' },
  { valor: 7, nome: 'Julho' },
  { valor: 8, nome: 'Agosto' },
  { valor: 9, nome: 'Setembro' },
  { valor: 10, nome: 'Outubro' },
  { valor: 11, nome: 'Novembro' },
  { valor: 12, nome: 'Dezembro' }
];
