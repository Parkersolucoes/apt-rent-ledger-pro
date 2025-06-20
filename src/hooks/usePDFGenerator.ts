
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

  const margin = 20;
  const pageWidth = 210;
  const pageHeight = 297;
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
    doc.roundedRect(x, y, width, height, 3, 3, 'F');
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, width, height, 3, 3, 'S');
  };

  const checkAndAddPage = (doc: jsPDF, yPosition: number, requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      return margin;
    }
    return yPosition;
  };

  const addHeader = (doc: jsPDF, filtros: FiltrosLocacao) => {
    // Fundo principal azul
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Linha de accent
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 50, pageWidth, 5, 'F');

    // Logo e título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO', margin, 25);
    
    // Período e apartamento
    doc.setFontSize(12);
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
    doc.text(periodoTexto, margin, 35);
    
    // Data de geração
    doc.setFontSize(10);
    const dataGeracao = `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    doc.text(dataGeracao, pageWidth - margin, 25, { align: 'right' as const });

    return 70;
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
        titulo: 'Despesas', 
        valor: formatCurrency(despesasTotal), 
        subtitulo: `${despesas.length} itens`,
        cor: colors.danger,
        corFundo: colors.dangerLight
      },
      { 
        titulo: 'Lucro Líquido', 
        valor: formatCurrency(Math.abs(lucroLiquido)), 
        subtitulo: lucroLiquido >= 0 ? 'Positivo' : 'Negativo',
        cor: lucroLiquido >= 0 ? colors.success : colors.danger,
        corFundo: lucroLiquido >= 0 ? colors.successLight : colors.dangerLight
      },
      { 
        titulo: 'Proprietário', 
        valor: formatCurrency(proprietarioTotal), 
        subtitulo: `${valorTotalLocacao > 0 ? ((proprietarioTotal / valorTotalLocacao) * 100).toFixed(1) : '0'}% do total`,
        cor: colors.primary,
        corFundo: colors.primaryLight
      }
    ];

    const cardWidth = (contentWidth - 15) / 2;
    const cardHeight = 28;

    metricas.forEach((metrica, index) => {
      const isEven = index % 2 === 0;
      const x = margin + (isEven ? 0 : cardWidth + 5);
      const y = yPosition + (Math.floor(index / 2) * (cardHeight + 5));

      drawCard(doc, x, y, cardWidth, cardHeight, metrica.corFundo);
      
      doc.setFillColor(metrica.cor[0], metrica.cor[1], metrica.cor[2]);
      doc.circle(x + 6, y + 8, 2, 'F');
      
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(metrica.titulo.toUpperCase(), x + 12, y + 6);
      
      doc.setTextColor(metrica.cor[0], metrica.cor[1], metrica.cor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(metrica.valor, x + 12, y + 15);
      
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(metrica.subtitulo, x + 12, y + 22);
    });

    return yPosition + (cardHeight * 2) + 25;
  };

  const addLocationsTable = (doc: jsPDF, yPosition: number, locacoes: Locacao[]) => {
    if (locacoes.length === 0) return yPosition;

    let currentY = checkAndAddPage(doc, yPosition, 80);
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento das Locações', margin, currentY);
    currentY += 12;

    const tableHeight = Math.min(locacoes.length * 12 + 30, 120);
    drawCard(doc, margin, currentY, contentWidth, tableHeight, [255, 255, 255]);
    
    doc.setFillColor(colors.grayLight[0], colors.grayLight[1], colors.grayLight[2]);
    doc.rect(margin + 2, currentY + 2, contentWidth - 4, 16, 'F');
    
    const colunas = [
      { label: 'Apto', x: margin + 5, width: 20 },
      { label: 'Hóspede', x: margin + 30, width: 50 },
      { label: 'Check-in', x: margin + 85, width: 25 },
      { label: 'Check-out', x: margin + 115, width: 25 },
      { label: 'Valor', x: margin + 145, width: 20 },
      { label: 'Comissão', x: margin + 170, width: 20 },
      { label: 'Líquido', x: margin + 195, width: 20 }
    ];

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    colunas.forEach(col => {
      doc.text(col.label, col.x + col.width / 2, currentY + 12, { align: 'center' as const });
    });

    currentY += 20;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    locacoes.slice(0, 8).forEach((locacao, index) => {
      const rowY = currentY + (index * 12);
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin + 2, rowY - 2, contentWidth - 4, 12, 'F');
      }

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      
      const dados = [
        locacao.apartamento,
        locacao.hospede.length > 25 ? locacao.hospede.substring(0, 22) + '...' : locacao.hospede,
        locacao.dataEntrada.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        locacao.dataSaida.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        formatCurrency(locacao.valorLocacao),
        formatCurrency(locacao.comissao),
        formatCurrency(locacao.valorProprietario)
      ];

      dados.forEach((dado, colIndex) => {
        const col = colunas[colIndex];
        
        if (colIndex >= 4) {
          doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(dado, col.x + col.width / 2, rowY + 5, { align: 'center' as const });
      });
    });

    // Footer da tabela com totais
    const footerY = currentY + Math.min(locacoes.length, 8) * 12 + 5;
    doc.setFillColor(colors.successLight[0], colors.successLight[1], colors.successLight[2]);
    doc.rect(margin + 2, footerY, contentWidth - 4, 14, 'F');
    
    doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    const valorTotal = locacoes.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoes.reduce((sum, loc) => sum + loc.comissao, 0);
    const proprietarioTotal = locacoes.reduce((sum, loc) => sum + loc.valorProprietario, 0);
    
    doc.text('TOTAIS', colunas[3].x + colunas[3].width / 2, footerY + 9, { align: 'center' as const });
    doc.text(formatCurrency(valorTotal), colunas[4].x + colunas[4].width / 2, footerY + 9, { align: 'center' as const });
    doc.text(formatCurrency(comissaoTotal), colunas[5].x + colunas[5].width / 2, footerY + 9, { align: 'center' as const });
    doc.text(formatCurrency(proprietarioTotal), colunas[6].x + colunas[6].width / 2, footerY + 9, { align: 'center' as const });

    return footerY + 25;
  };

  const addExpensesSection = (doc: jsPDF, yPosition: number, despesas: Despesa[]) => {
    if (despesas.length === 0) return yPosition;

    let currentY = checkAndAddPage(doc, yPosition, 60);
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Despesas do Período', margin, currentY);
    currentY += 12;

    const despesasHeight = Math.min(despesas.length * 10 + 20, 80);
    drawCard(doc, margin, currentY, contentWidth, despesasHeight, [255, 255, 255]);
    
    doc.setFillColor(colors.dangerLight[0], colors.dangerLight[1], colors.dangerLight[2]);
    doc.rect(margin + 2, currentY + 2, contentWidth - 4, 14, 'F');
    
    doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', margin + 15, currentY + 11, { align: 'center' as const });
    doc.text('Descrição', margin + 40, currentY + 11);
    doc.text('Apartamento', margin + 120, currentY + 11, { align: 'center' as const });
    doc.text('Valor', margin + contentWidth - 15, currentY + 11, { align: 'right' as const });

    currentY += 18;

    doc.setFontSize(8);
    despesas.slice(0, 6).forEach((despesa, index) => {
      const rowY = currentY + (index * 10);
      
      if (index % 2 === 0) {
        doc.setFillColor(254, 248, 248);
        doc.rect(margin + 2, rowY - 2, contentWidth - 4, 10, 'F');
      }

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'normal');
      
      doc.text(despesa.data.toLocaleDateString('pt-BR'), margin + 15, rowY + 5, { align: 'center' as const });
      doc.text(despesa.descricao.length > 40 ? despesa.descricao.substring(0, 37) + '...' : despesa.descricao, margin + 32, rowY + 5);
      doc.text(despesa.apartamento || 'Geral', margin + 120, rowY + 5, { align: 'center' as const });
      
      doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(despesa.valor), margin + contentWidth - 15, rowY + 5, { align: 'right' as const });
    });

    const despesasTotal = despesas.reduce((sum, desp) => sum + desp.valor, 0);
    const totalY = currentY + Math.min(despesas.length, 6) * 10 + 3;
    doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.rect(margin + 2, totalY, contentWidth - 4, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL DAS DESPESAS', margin + contentWidth/2, totalY + 7, { align: 'center' as const });
    doc.text(formatCurrency(despesasTotal), margin + contentWidth - 15, totalY + 7, { align: 'right' as const });

    return totalY + 20;
  };

  const addExecutiveSummary = (doc: jsPDF, yPosition: number, locacoes: Locacao[], despesas: Despesa[]) => {
    let currentY = checkAndAddPage(doc, yPosition, 40);
    
    drawCard(doc, margin, currentY, contentWidth, 35, colors.primaryLight);
    
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Executivo', margin + 5, currentY + 8);
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const valorTotalLocacao = locacoes.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const proprietarioTotal = locacoes.reduce((sum, loc) => sum + loc.valorProprietario, 0);
    const despesasTotal = despesas.reduce((sum, desp) => sum + desp.valor, 0);
    const lucroLiquido = proprietarioTotal - despesasTotal;
    
    const resumo = [
      `→ Resultado: ${lucroLiquido >= 0 ? 'LUCRO' : 'PREJUÍZO'} de ${formatCurrency(Math.abs(lucroLiquido))}`,
      `→ Margem de lucro: ${valorTotalLocacao > 0 ? ((lucroLiquido / valorTotalLocacao) * 100).toFixed(1) : '0'}%`,
      `→ Ticket médio por locação: ${locacoes.length > 0 ? formatCurrency(valorTotalLocacao / locacoes.length) : 'R$ 0,00'}`,
      `→ Taxa de despesas: ${valorTotalLocacao > 0 ? ((despesasTotal / valorTotalLocacao) * 100).toFixed(1) : '0'}% sobre receita`
    ];

    resumo.forEach((linha, index) => {
      doc.text(linha, margin + 5, currentY + 16 + (index * 5));
    });

    return currentY + 50;
  };

  const addFooter = (doc: jsPDF, yPosition: number) => {
    let currentY = checkAndAddPage(doc, yPosition, 15);
    
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestão de Locações - Relatório gerado automaticamente', pageWidth/2, currentY + 8, { align: 'center' as const });
  };

  const generatePDF = async (
    locacoes: Locacao[], 
    despesas: Despesa[], 
    filtros: FiltrosLocacao
  ): Promise<jsPDF> => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let yPosition = addHeader(doc, filtros);
      yPosition = addMetricsSection(doc, yPosition, locacoes, despesas);
      yPosition = addLocationsTable(doc, yPosition, locacoes);
      yPosition = addExpensesSection(doc, yPosition, despesas);
      yPosition = addExecutiveSummary(doc, yPosition, locacoes, despesas);
      addFooter(doc, yPosition);

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
