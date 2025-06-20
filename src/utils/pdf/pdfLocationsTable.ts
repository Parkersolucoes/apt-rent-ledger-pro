
import jsPDF from 'jspdf';
import { colors, pdfDimensions } from './pdfStyles';
import { checkAndAddPage } from './pdfLayoutUtils';
import { Locacao } from '@/types/locacao';
import { formatCurrency } from '@/utils/formatters';

export const addLocationsTable = (doc: jsPDF, yPosition: number, locacoes: Locacao[]) => {
  if (locacoes.length === 0) return yPosition;

  const { margin, contentWidth } = pdfDimensions;
  let currentY = checkAndAddPage(doc, yPosition, 60);
  
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento das Locações', margin, currentY);
  currentY += 10;

  // Tabela ajustada com espaçamento reduzido e nova coluna
  const colunas = [
    { label: 'Apto', x: margin + 3, width: 20 },
    { label: 'Hóspede', x: margin + 25, width: 45 },
    { label: 'Check-in', x: margin + 72, width: 25 },
    { label: 'Check-out', x: margin + 99, width: 25 },
    { label: 'Valor Total', x: margin + 126, width: 25 },
    { label: 'Comissão', x: margin + 153, width: 22 },
    { label: 'Taxa Limpeza', x: margin + 177, width: 25 },
    { label: 'Líquido', x: margin + 204, width: 25 },
    { label: 'Proprietário', x: margin + 231, width: 28 }
  ];

  // Cabeçalho da tabela
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, currentY, contentWidth, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  colunas.forEach(col => {
    doc.text(col.label, col.x, currentY + 8);
  });

  currentY += 15;

  // Linhas da tabela
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  locacoes.forEach((locacao, index) => {
    if (index >= 12) return; // Limite para caber na página
    
    const rowY = currentY + (index * 9);
    
    // Linha zebrada
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY - 2, contentWidth, 9, 'F');
    }

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    
    const valorLiquido = locacao.valorLocacao - locacao.comissao - locacao.taxaLimpeza;
    
    const dados = [
      locacao.apartamento,
      locacao.hospede.length > 15 ? locacao.hospede.substring(0, 12) + '...' : locacao.hospede,
      locacao.dataEntrada.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      locacao.dataSaida.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      formatCurrency(locacao.valorLocacao),
      formatCurrency(locacao.comissao),
      formatCurrency(locacao.taxaLimpeza),
      formatCurrency(valorLiquido),
      formatCurrency(locacao.valorProprietario)
    ];

    dados.forEach((dado, colIndex) => {
      const col = colunas[colIndex];
      
      if (colIndex >= 4) { // Valores monetários
        doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(dado, col.x, rowY + 5);
    });
  });

  // Linha de totais
  const footerY = currentY + Math.min(locacoes.length, 12) * 9 + 5;
  doc.setFillColor(colors.successLight[0], colors.successLight[1], colors.successLight[2]);
  doc.rect(margin, footerY, contentWidth, 12, 'F');
  
  doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  const valorTotal = locacoes.reduce((sum, loc) => sum + loc.valorLocacao, 0);
  const comissaoTotal = locacoes.reduce((sum, loc) => sum + loc.comissao, 0);
  const limpezaTotal = locacoes.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
  const liquidoTotal = valorTotal - comissaoTotal - limpezaTotal;
  const proprietarioTotal = locacoes.reduce((sum, loc) => sum + loc.valorProprietario, 0);
  
  doc.text('TOTAIS', colunas[0].x, footerY + 8);
  doc.text(formatCurrency(valorTotal), colunas[4].x, footerY + 8);
  doc.text(formatCurrency(comissaoTotal), colunas[5].x, footerY + 8);
  doc.text(formatCurrency(limpezaTotal), colunas[6].x, footerY + 8);
  doc.text(formatCurrency(liquidoTotal), colunas[7].x, footerY + 8);
  doc.text(formatCurrency(proprietarioTotal), colunas[8].x, footerY + 8);

  return footerY + 20;
};
