
import jsPDF from 'jspdf';
import { colors, pdfDimensions, meses } from './pdfStyles';
import { FiltrosLocacao } from '@/types/locacao';

export const addHeader = (doc: jsPDF, filtros: FiltrosLocacao) => {
  const { margin, pageWidth } = pdfDimensions;
  
  // Fundo principal azul
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Linha de accent
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 35, pageWidth, 5, 'F');

  // Logo e título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO FINANCEIRO', margin, 20);
  
  // Período e apartamento
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let periodoTexto = '';
  if (filtros.apartamento) periodoTexto += `Apartamento ${filtros.apartamento} • `;
  if (filtros.ano && filtros.mes) {
    const mesNome = meses.find(m => m.valor === filtros.mes)?.nome;
    periodoTexto += `${mesNome}/${filtros.ano}`;
  } else if (filtros.ano) {
    periodoTexto += `Ano ${filtros.ano}`;
  } else {
    periodoTexto += 'Todos os períodos';
  }
  doc.text(periodoTexto, margin, 30);
  
  // Data de geração
  doc.setFontSize(9);
  const dataGeracao = `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(dataGeracao, pageWidth - margin, 20, { align: 'right' as const });

  return 55;
};
