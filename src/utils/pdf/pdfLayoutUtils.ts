
import jsPDF from 'jspdf';
import { colors, pdfDimensions } from './pdfStyles';

export const drawCard = (doc: jsPDF, x: number, y: number, width: number, height: number, color = colors.grayLight) => {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, width, height, 2, 2, 'F');
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2, 2, 'S');
};

export const checkAndAddPage = (doc: jsPDF, yPosition: number, requiredSpace: number) => {
  if (yPosition + requiredSpace > pdfDimensions.pageHeight - 20) {
    doc.addPage();
    return pdfDimensions.margin;
  }
  return yPosition;
};
