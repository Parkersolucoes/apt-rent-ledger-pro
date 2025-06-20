
import jsPDF from 'jspdf';
import { colors, pdfDimensions } from './pdfStyles';
import { drawCard } from './pdfLayoutUtils';
import { Locacao } from '@/types/locacao';
import { Despesa } from '@/types/despesa';
import { formatCurrency } from '@/utils/formatters';

export const addMetricsSection = (doc: jsPDF, yPosition: number, locacoes: Locacao[], despesas: Despesa[]) => {
  const { margin, contentWidth } = pdfDimensions;
  
  const valorTotalLocacao = locacoes.reduce((sum, loc) => sum + loc.valorLocacao, 0);
  const limpezaTotal = locacoes.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
  const comissaoTotal = locacoes.reduce((sum, loc) => sum + loc.comissao, 0);
  const proprietarioTotal = locacoes.reduce((sum, loc) => sum + loc.valorProprietario, 0);
  const despesasTotal = despesas.reduce((sum, desp) => sum + desp.valor, 0);
  const lucroLiquido = proprietarioTotal - despesasTotal;

  const metricas = [
    { 
      titulo: 'Receita Total', 
      valor: formatCurrency(valorTotalLocacao), 
      subtitulo: `${locacoes.length} locações`,
      cor: colors.success,
      corFundo: colors.successLight
    },
    { 
      titulo: 'Limpeza', 
      valor: formatCurrency(limpezaTotal), 
      subtitulo: 'Total limpeza',
      cor: colors.primary,
      corFundo: colors.primaryLight
    },
    { 
      titulo: 'Comissão', 
      valor: formatCurrency(comissaoTotal), 
      subtitulo: 'Total comissões',
      cor: colors.primary,
      corFundo: colors.primaryLight
    },
    { 
      titulo: 'Proprietário', 
      valor: formatCurrency(proprietarioTotal), 
      subtitulo: 'Valor líquido',
      cor: colors.success,
      corFundo: colors.successLight
    },
    { 
      titulo: 'Despesas', 
      valor: formatCurrency(despesasTotal), 
      subtitulo: `${despesas.length} itens`,
      cor: colors.danger,
      corFundo: colors.dangerLight
    },
    { 
      titulo: 'Resultado Final', 
      valor: formatCurrency(Math.abs(lucroLiquido)), 
      subtitulo: lucroLiquido >= 0 ? 'Lucro' : 'Prejuízo',
      cor: lucroLiquido >= 0 ? colors.success : colors.danger,
      corFundo: lucroLiquido >= 0 ? colors.successLight : colors.dangerLight
    }
  ];

  // Distribuir em uma linha horizontal
  const cardWidth = (contentWidth - 25) / 6;
  const cardHeight = 25;

  metricas.forEach((metrica, index) => {
    const x = margin + (index * (cardWidth + 5));
    const y = yPosition;

    drawCard(doc, x, y, cardWidth, cardHeight, metrica.corFundo);
    
    doc.setFillColor(metrica.cor[0], metrica.cor[1], metrica.cor[2]);
    doc.circle(x + 5, y + 7, 1.5, 'F');
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(metrica.titulo.toUpperCase(), x + 10, y + 5);
    
    doc.setTextColor(metrica.cor[0], metrica.cor[1], metrica.cor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(metrica.valor, x + 10, y + 13);
    
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(metrica.subtitulo, x + 10, y + 20);
  });

  return yPosition + cardHeight + 15;
};
