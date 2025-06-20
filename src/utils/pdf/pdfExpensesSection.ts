
import jsPDF from 'jspdf';
import { colors, pdfDimensions } from './pdfStyles';
import { checkAndAddPage } from './pdfLayoutUtils';
import { Despesa } from '@/types/despesa';
import { formatCurrency } from '@/utils/formatters';

export const addExpensesSection = (doc: jsPDF, yPosition: number, despesas: Despesa[]) => {
  if (despesas.length === 0) return yPosition;

  const { margin, contentWidth } = pdfDimensions;
  let currentY = checkAndAddPage(doc, yPosition, 40);
  
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Despesas do Período', margin, currentY);
  currentY += 8;

  // Cabeçalho das despesas
  doc.setFillColor(colors.dangerLight[0], colors.dangerLight[1], colors.dangerLight[2]);
  doc.rect(margin, currentY, contentWidth, 10, 'F');
  
  doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Data', margin + 5, currentY + 7);
  doc.text('Descrição', margin + 40, currentY + 7);
  doc.text('Apartamento', margin + 150, currentY + 7);
  doc.text('Valor', margin + 200, currentY + 7);

  currentY += 12;

  doc.setFontSize(8);
  despesas.slice(0, 8).forEach((despesa, index) => {
    const rowY = currentY + (index * 9);
    
    if (index % 2 === 0) {
      doc.setFillColor(254, 248, 248);
      doc.rect(margin, rowY - 2, contentWidth, 9, 'F');
    }

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFont('helvetica', 'normal');
    
    doc.text(despesa.data.toLocaleDateString('pt-BR'), margin + 5, rowY + 5);
    doc.text(despesa.descricao.length > 50 ? despesa.descricao.substring(0, 47) + '...' : despesa.descricao, margin + 40, rowY + 5);
    doc.text(despesa.apartamento || 'Geral', margin + 150, rowY + 5);
    
    doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(despesa.valor), margin + 200, rowY + 5);
  });

  const despesasTotal = despesas.reduce((sum, desp) => sum + desp.valor, 0);
  const totalY = currentY + Math.min(despesas.length, 8) * 9 + 3;
  doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
  doc.rect(margin, totalY, contentWidth, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DAS DESPESAS', margin + 5, totalY + 7);
  doc.text(formatCurrency(despesasTotal), margin + 200, totalY + 7);

  return totalY + 15;
};
