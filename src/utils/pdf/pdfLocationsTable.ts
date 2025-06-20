
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

  // Tabela com colunas ajustadas na ordem solicitada
  const colunas = [
    { label: 'Apto', x: margin + 3, width: 18 },
    { label: 'Hóspede', x: margin + 23, width: 35 },
    { label: 'Check-in', x: margin + 60, width: 25 },
    { label: 'Check-out', x: margin + 87, width: 25 },
    { label: 'Receita Total', x: margin + 114, width: 28 },
    { label: 'Limpeza', x: margin + 144, width: 22 },
    { label: 'Comissão', x: margin + 168, width: 22 },
    { label: 'Proprietário', x: margin + 192, width: 28 },
    { label: 'Valor Prop.', x: margin + 222, width: 28 }
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

  // Linhas da tabela com fonte maior
  doc.setFontSize(8);
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
    
    const dados = [
      locacao.apartamento,
      locacao.hospede.length > 12 ? locacao.hospede.substring(0, 9) + '...' : locacao.hospede,
      locacao.dataEntrada.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      locacao.dataSaida.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      formatCurrency(locacao.valorLocacao),
      formatCurrency(locacao.taxaLimpeza),
      formatCurrency(locacao.comissao),
      formatCurrency(locacao.valorProprietario),
      formatCurrency(locacao.valorProprietario)
    ];

    dados.forEach((dado, colIndex) => {
      const col = colunas[colIndex];
      
      if (colIndex >= 4) { // Valores monetários
        doc.setTextColor(25, 25, 112); // Azul próximo ao preto
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
  
  doc.setTextColor(25, 25, 112);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  const valorTotal = locacoes.reduce((sum, loc) => sum + loc.valorLocacao, 0);
  const limpezaTotal = locacoes.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
  const comissaoTotal = locacoes.reduce((sum, loc) => sum + loc.comissao, 0);
  const proprietarioTotal = locacoes.reduce((sum, loc) => sum + loc.valorProprietario, 0);
  
  doc.text('TOTAIS', colunas[0].x, footerY + 8);
  doc.text(formatCurrency(valorTotal), colunas[4].x, footerY + 8);
  doc.text(formatCurrency(limpezaTotal), colunas[5].x, footerY + 8);
  doc.text(formatCurrency(comissaoTotal), colunas[6].x, footerY + 8);
  doc.text(formatCurrency(proprietarioTotal), colunas[7].x, footerY + 8);
  doc.text(formatCurrency(proprietarioTotal), colunas[8].x, footerY + 8);

  return footerY + 20;
};
