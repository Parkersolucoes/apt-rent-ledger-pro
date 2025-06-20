
import { useState } from 'react';
import jsPDF from 'jspdf';
import { Locacao } from '@/types/locacao';
import { Despesa } from '@/types/despesa';
import { FiltrosLocacao } from '@/types/locacao';
import { formatCurrency } from '@/utils/formatters';

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const colors = {
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

  // Dimensões para layout paisagem (A4 rotacionado)
  const margin = 20;
  const pageWidth = 297; // A4 paisagem
  const pageHeight = 210; // A4 paisagem
  const contentWidth = pageWidth - (margin * 2);

  const meses = [
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

  const drawCard = (doc: jsPDF, x: number, y: number, width: number, height: number, color = colors.grayLight) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 2, 2, 'S');
  };

  const checkAndAddPage = (doc: jsPDF, yPosition: number, requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      return margin;
    }
    return yPosition;
  };

  const addHeader = (doc: jsPDF, filtros: FiltrosLocacao) => {
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

  const addMetricsSection = (doc: jsPDF, yPosition: number, locacoes: Locacao[], despesas: Despesa[]) => {
    const valorTotalLocacao = locacoes.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoes.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoes.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
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
    const cardWidth = (contentWidth - 20) / 5;
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

  const addLocationsTable = (doc: jsPDF, yPosition: number, locacoes: Locacao[]) => {
    if (locacoes.length === 0) return yPosition;

    let currentY = checkAndAddPage(doc, yPosition, 60);
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento das Locações', margin, currentY);
    currentY += 10;

    // Tabela otimizada para paisagem
    const colunas = [
      { label: 'Apto', x: margin + 5, width: 25 },
      { label: 'Hóspede', x: margin + 35, width: 60 },
      { label: 'Check-in', x: margin + 100, width: 30 },
      { label: 'Check-out', x: margin + 135, width: 30 },
      { label: 'Valor Total', x: margin + 170, width: 30 },
      { label: 'Comissão', x: margin + 205, width: 25 },
      { label: 'Taxa Limpeza', x: margin + 235, width: 25 },
      { label: 'Proprietário', x: margin + 265, width: 30 }
    ];

    // Cabeçalho da tabela
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, currentY, contentWidth, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    colunas.forEach(col => {
      doc.text(col.label, col.x, currentY + 8);
    });

    currentY += 15;

    // Linhas da tabela
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    locacoes.forEach((locacao, index) => {
      if (index >= 12) return; // Limite para caber na página
      
      const rowY = currentY + (index * 10);
      
      // Linha zebrada
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, rowY - 2, contentWidth, 10, 'F');
      }

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      
      const dados = [
        locacao.apartamento,
        locacao.hospede.length > 20 ? locacao.hospede.substring(0, 17) + '...' : locacao.hospede,
        locacao.dataEntrada.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        locacao.dataSaida.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        formatCurrency(locacao.valorLocacao),
        formatCurrency(locacao.comissao),
        formatCurrency(locacao.taxaLimpeza),
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
    const footerY = currentY + Math.min(locacoes.length, 12) * 10 + 5;
    doc.setFillColor(colors.successLight[0], colors.successLight[1], colors.successLight[2]);
    doc.rect(margin, footerY, contentWidth, 12, 'F');
    
    doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    const valorTotal = locacoes.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoes.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoes.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const proprietarioTotal = locacoes.reduce((sum, loc) => sum + loc.valorProprietario, 0);
    
    doc.text('TOTAIS', colunas[0].x, footerY + 8);
    doc.text(formatCurrency(valorTotal), colunas[4].x, footerY + 8);
    doc.text(formatCurrency(comissaoTotal), colunas[5].x, footerY + 8);
    doc.text(formatCurrency(limpezaTotal), colunas[6].x, footerY + 8);
    doc.text(formatCurrency(proprietarioTotal), colunas[7].x, footerY + 8);

    return footerY + 20;
  };

  const addExpensesSection = (doc: jsPDF, yPosition: number, despesas: Despesa[]) => {
    if (despesas.length === 0) return yPosition;

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
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', margin + 5, currentY + 7);
    doc.text('Descrição', margin + 40, currentY + 7);
    doc.text('Apartamento', margin + 150, currentY + 7);
    doc.text('Valor', margin + 200, currentY + 7);

    currentY += 12;

    doc.setFontSize(7);
    despesas.slice(0, 8).forEach((despesa, index) => {
      const rowY = currentY + (index * 8);
      
      if (index % 2 === 0) {
        doc.setFillColor(254, 248, 248);
        doc.rect(margin, rowY - 2, contentWidth, 8, 'F');
      }

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'normal');
      
      doc.text(despesa.data.toLocaleDateString('pt-BR'), margin + 5, rowY + 4);
      doc.text(despesa.descricao.length > 50 ? despesa.descricao.substring(0, 47) + '...' : despesa.descricao, margin + 40, rowY + 4);
      doc.text(despesa.apartamento || 'Geral', margin + 150, rowY + 4);
      
      doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(despesa.valor), margin + 200, rowY + 4);
    });

    const despesasTotal = despesas.reduce((sum, desp) => sum + desp.valor, 0);
    const totalY = currentY + Math.min(despesas.length, 8) * 8 + 3;
    doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.rect(margin, totalY, contentWidth, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL DAS DESPESAS', margin + 5, totalY + 7);
    doc.text(formatCurrency(despesasTotal), margin + 200, totalY + 7);

    return totalY + 15;
  };

  const generatePDF = async (
    locacoes: Locacao[], 
    despesas: Despesa[], 
    filtros: FiltrosLocacao
  ): Promise<jsPDF> => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape', // Mudança para paisagem
        unit: 'mm',
        format: 'a4'
      });

      let yPosition = addHeader(doc, filtros);
      yPosition = addMetricsSection(doc, yPosition, locacoes, despesas);
      yPosition = addLocationsTable(doc, yPosition, locacoes);
      yPosition = addExpensesSection(doc, yPosition, despesas);

      return doc;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating
  };
};
