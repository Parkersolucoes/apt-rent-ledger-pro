
import { useState } from 'react';
import jsPDF from 'jspdf';
import { Locacao } from '@/types/locacao';
import { Despesa } from '@/types/despesa';
import { FiltrosLocacao } from '@/types/locacao';
import { addHeader } from '@/utils/pdf/pdfHeaderSection';
import { addMetricsSection } from '@/utils/pdf/pdfMetricsSection';
import { addLocationsTable } from '@/utils/pdf/pdfLocationsTable';
import { addExpensesSection } from '@/utils/pdf/pdfExpensesSection';

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (
    locacoes: Locacao[], 
    despesas: Despesa[], 
    filtros: FiltrosLocacao
  ): Promise<jsPDF> => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
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
