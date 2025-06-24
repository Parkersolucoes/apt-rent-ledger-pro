
import jsPDF from 'jspdf';
import { Contrato } from '@/types/contrato';

export const generateContractPDF = (contrato: Contrato): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações básicas
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Função para adicionar texto com quebra de linha
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }

    const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
    doc.text(splitText, margin, yPosition);
    yPosition += splitText.length * lineHeight;
  };

  // Título do documento
  addText(contrato.titulo, 16, true);
  yPosition += 10;

  // Conteúdo do contrato
  const linhas = contrato.conteudo.split('\n');
  linhas.forEach(linha => {
    if (linha.trim() === '') {
      yPosition += lineHeight / 2;
    } else {
      addText(linha, 11);
    }
  });

  // Informações adicionais
  yPosition += 20;
  addText('INFORMAÇÕES DO CONTRATO:', 12, true);
  yPosition += 5;
  
  addText(`Status: ${contrato.status.toUpperCase()}`);
  addText(`Data de Criação: ${new Date(contrato.data_criacao).toLocaleDateString()}`);
  
  if (contrato.data_assinatura) {
    addText(`Data de Assinatura: ${new Date(contrato.data_assinatura).toLocaleDateString()}`);
  }
  
  if (contrato.data_vencimento) {
    addText(`Data de Vencimento: ${new Date(contrato.data_vencimento).toLocaleDateString()}`);
  }
  
  if (contrato.percentual_comissao) {
    addText(`Percentual de Comissão: ${contrato.percentual_comissao}%`);
  }
  
  if (contrato.valor_mensal) {
    addText(`Valor Mensal: R$ ${contrato.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  }

  if (contrato.observacoes) {
    yPosition += 10;
    addText('OBSERVAÇÕES:', 12, true);
    yPosition += 5;
    addText(contrato.observacoes);
  }

  return doc;
};
