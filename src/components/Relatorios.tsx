
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RelatorioSimplificado } from './Relatorios/RelatorioSimplificado';
import { useLocacoes } from '@/hooks/useLocacoes';
import { useDespesas } from '@/hooks/useDespesas';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useModelosMensagem } from '@/hooks/useModelosMensagem';
import { enviarPDFWhatsApp, formatarTelefone } from '@/utils/whatsapp';
import { CampoTelefone } from './CampoTelefone';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';
import { FileText, MessageCircle, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import { FiltrosLocacao } from '@/types/locacao';

export const Relatorios = () => {
  const { locacoes, filtrarLocacoes } = useLocacoes();
  const { despesas } = useDespesas();
  const { apartamentos } = useApartamentos();
  const { configEvolution } = useConfiguracoes();
  const { modelos, processarTemplate } = useModelosMensagem();
  const { toast } = useToast();

  const [filtros, setFiltros] = useState<FiltrosLocacao>({});
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [telefoneDestino, setTelefoneDestino] = useState('');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

  const anos = Array.from(new Set(locacoes.map(l => l.ano).filter(Boolean))).sort((a, b) => (b || 0) - (a || 0));
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

  const apartamentosDisponiveis = Array.from(new Set(locacoes.map(l => l.apartamento))).sort();
  const locacoesFiltradas = filtrarLocacoes(filtros);
  
  // Filtrar despesas com base nos mesmos critérios
  const despesasFiltradas = despesas.filter(despesa => {
    if (filtros.apartamento && despesa.apartamento !== filtros.apartamento) return false;
    if (filtros.ano && despesa.data.getFullYear() !== filtros.ano) return false;
    if (filtros.mes && despesa.data.getMonth() + 1 !== filtros.mes) return false;
    return true;
  });

  // Função para gerar variáveis do template
  const gerarVariaveisTemplate = () => {
    const valorTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const proprietarioTotal = valorTotal - comissaoTotal - limpezaTotal;
    
    let periodo = '';
    if (filtros.ano && filtros.mes) {
      const mesNome = meses.find(m => m.valor === filtros.mes)?.nome;
      periodo = `${mesNome} ${filtros.ano}`;
    } else if (filtros.ano) {
      periodo = `Ano ${filtros.ano}`;
    } else {
      periodo = 'Todos os períodos';
    }

    const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
    
    return {
      nome_proprietario: apartamento?.proprietario || 'Proprietário',
      apartamento: filtros.apartamento || 'Todos',
      valor_total: formatCurrency(valorTotal),
      comissao_total: formatCurrency(comissaoTotal),
      limpeza_total: formatCurrency(limpezaTotal),
      valor_proprietario: formatCurrency(proprietarioTotal),
      total_locacoes: locacoesFiltradas.length.toString(),
      periodo: periodo
    };
  };

  // Efeito para preencher automaticamente o telefone quando um apartamento for selecionado
  useEffect(() => {
    if (filtros.apartamento && showWhatsAppModal) {
      const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
      if (apartamento?.telefoneProprietario && !telefoneDestino) {
        setTelefoneDestino(apartamento.telefoneProprietario);
      }
    }
  }, [filtros.apartamento, showWhatsAppModal, apartamentos, telefoneDestino]);

  // Efeito para atualizar mensagem quando modelo for selecionado
  useEffect(() => {
    if (modeloSelecionado && modeloSelecionado !== 'personalizada') {
      const modelo = modelos.find(m => m.id === modeloSelecionado);
      if (modelo) {
        const variaveis = gerarVariaveisTemplate();
        const mensagemProcessada = processarTemplate(modelo.conteudo, variaveis);
        setMensagemPersonalizada(mensagemProcessada);
      }
    } else if (modeloSelecionado === 'personalizada') {
      setMensagemPersonalizada('');
    }
  }, [modeloSelecionado, modelos, filtros, locacoesFiltradas]);

  const gerarRelatorioPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurações profissionais otimizadas
    const margin = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    let currentPage = 1;

    // Função auxiliar para adicionar nova página se necessário
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        currentPage++;
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Função para desenhar linha separadora
    const drawSeparator = (y: number, color = [200, 200, 200]) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
    };

    // CABEÇALHO ELEGANTE E COMPACTO
    // Fundo azul elegante
    doc.setFillColor(30, 64, 175); // Blue-800
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Accent strip
    doc.setFillColor(59, 130, 246); // Blue-500
    doc.rect(0, 40, pageWidth, 5, 'F');

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO', margin, 18);
    
    // Subtítulo
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
    doc.text(periodoTexto, margin, 28);
    
    // Data de geração
    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 
      pageWidth - margin, 18, { align: 'right' });

    yPosition = 55;

    // CALCULAR VALORES FINANCEIROS
    const valorTotalLocacao = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const proprietarioTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorProprietario, 0);
    const despesasTotal = despesasFiltradas.reduce((sum, desp) => sum + desp.valor, 0);
    const lucroLiquido = proprietarioTotal - despesasTotal;
    const margemLucro = valorTotalLocacao > 0 ? ((lucroLiquido / valorTotalLocacao) * 100) : 0;

    // RESUMO EXECUTIVO EM GRID COMPACTO
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO EXECUTIVO', margin, yPosition);
    yPosition += 8;

    drawSeparator(yPosition);
    yPosition += 5;

    // Grid 2x2 de métricas
    const cardWidth = (contentWidth - 5) / 2;
    const cardHeight = 25;
    
    // Card 1 - Receitas
    doc.setFillColor(240, 253, 244); // Green-50
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(34, 197, 94); // Green-500
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(21, 128, 61); // Green-700
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEITAS TOTAIS', margin + 3, yPosition + 7);
    doc.setFontSize(16);
    doc.text(formatCurrency(valorTotalLocacao), margin + 3, yPosition + 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${locacoesFiltradas.length} locações | Média: ${locacoesFiltradas.length > 0 ? formatCurrency(valorTotalLocacao / locacoesFiltradas.length) : 'R$ 0,00'}`, margin + 3, yPosition + 21);

    // Card 2 - Despesas
    const card2X = margin + cardWidth + 5;
    doc.setFillColor(254, 242, 242); // Red-50
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(239, 68, 68); // Red-500
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(185, 28, 28); // Red-700
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DESPESAS TOTAIS', card2X + 3, yPosition + 7);
    doc.setFontSize(16);
    doc.text(formatCurrency(despesasTotal), card2X + 3, yPosition + 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${despesasFiltradas.length} despesas | Média: ${despesasFiltradas.length > 0 ? formatCurrency(despesasTotal / despesasFiltradas.length) : 'R$ 0,00'}`, card2X + 3, yPosition + 21);

    yPosition += cardHeight + 5;

    // Card 3 - Lucro/Prejuízo
    const lucroColor = lucroLiquido >= 0 ? [219, 234, 254] : [254, 242, 242]; // Blue-50 ou Red-50
    const lucroBorder = lucroLiquido >= 0 ? [59, 130, 246] : [239, 68, 68]; // Blue-500 ou Red-500
    const lucroText = lucroLiquido >= 0 ? [30, 64, 175] : [185, 28, 28]; // Blue-800 ou Red-700
    
    doc.setFillColor(lucroColor[0], lucroColor[1], lucroColor[2]);
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(lucroBorder[0], lucroBorder[1], lucroBorder[2]);
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(lucroText[0], lucroText[1], lucroText[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(lucroLiquido >= 0 ? 'LUCRO LÍQUIDO' : 'PREJUÍZO', margin + 3, yPosition + 7);
    doc.setFontSize(16);
    doc.text(formatCurrency(Math.abs(lucroLiquido)), margin + 3, yPosition + 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Margem: ${margemLucro.toFixed(1)}% | ROI: ${despesasTotal > 0 ? ((lucroLiquido / despesasTotal) * 100).toFixed(1) : '0'}%`, margin + 3, yPosition + 21);

    // Card 4 - Proprietário
    doc.setFillColor(237, 233, 254); // Violet-50
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(139, 69, 193); // Purple-600
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(109, 40, 217); // Purple-700
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('VALOR PROPRIETÁRIO', card2X + 3, yPosition + 7);
    doc.setFontSize(16);
    doc.text(formatCurrency(proprietarioTotal), card2X + 3, yPosition + 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const percentualProprietario = valorTotalLocacao > 0 ? ((proprietarioTotal / valorTotalLocacao) * 100) : 0;
    doc.text(`${percentualProprietario.toFixed(1)}% do faturamento bruto`, card2X + 3, yPosition + 21);

    yPosition += cardHeight + 15;

    // TABELA DE LOCAÇÕES REDESENHADA COM MELHOR ALINHAMENTO
    if (locacoesFiltradas.length > 0) {
      checkAndAddPage(60);
      
      // Título da seção
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALHAMENTO DAS LOCAÇÕES', margin, yPosition);
      yPosition += 8;

      drawSeparator(yPosition, [51, 65, 85]);
      yPosition += 5;

      // Cabeçalho da tabela otimizado com larguras precisas
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.roundedRect(margin, yPosition, contentWidth, 16, 1, 1, 'F');
      doc.setDrawColor(203, 213, 225); // Slate-300
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPosition, contentWidth, 16, 1, 1, 'S');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      
      // Definição das colunas com larguras balanceadas
      const cols = [
        { x: margin + 2, w: 16, h: 'Apartamento', align: 'center' as const },
        { x: margin + 20, w: 40, h: 'Hóspede', align: 'left' as const },
        { x: margin + 62, w: 20, h: 'Check-in', align: 'center' as const },
        { x: margin + 84, w: 20, h: 'Check-out', align: 'center' as const },
        { x: margin + 106, w: 22, h: 'Valor Locação', align: 'right' as const },
        { x: margin + 130, w: 18, h: 'Limpeza', align: 'right' as const },
        { x: margin + 150, w: 20, h: 'Comissão', align: 'right' as const },
        { x: margin + 172, w: 23, h: 'Proprietário', align: 'right' as const }
      ];

      // Desenhar linhas verticais dos cabeçalhos
      doc.setDrawColor(203, 213, 225);
      cols.forEach((col, index) => {
        if (index > 0) {
          doc.line(col.x - 1, yPosition + 1, col.x - 1, yPosition + 15);
        }
        
        // Posicionar texto do cabeçalho conforme alinhamento
        let textX = col.x + 2; // padrão left
        if (col.align === 'center') {
          textX = col.x + (col.w / 2);
        } else if (col.align === 'right') {
          textX = col.x + col.w - 2;
        }
        
        doc.text(col.h, textX, yPosition + 10, { align: col.align });
      });

      yPosition += 19;

      // Dados da tabela com melhor formatação
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      
      locacoesFiltradas.forEach((locacao, index) => {
        checkAndAddPage(12);

        const rowHeight = 11;

        // Fundo alternado para linhas
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251); // Gray-50
          doc.roundedRect(margin, yPosition - 1, contentWidth, rowHeight, 0.5, 0.5, 'F');
        }

        // Bordas da linha
        doc.setDrawColor(229, 231, 235); // Gray-200
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPosition - 1, contentWidth, rowHeight, 0.5, 0.5, 'S');

        // Linhas verticais
        cols.forEach((col, colIndex) => {
          if (colIndex > 0) {
            doc.line(col.x - 1, yPosition - 1, col.x - 1, yPosition + rowHeight - 1);
          }
        });

        doc.setFontSize(7.5);
        
        // Função para truncar texto mantendo qualidade
        const truncateText = (text: string, maxWidth: number, fontSize: number = 7.5) => {
          const textWidth = doc.getTextWidth(text);
          if (textWidth <= maxWidth) return text;
          
          const avgCharWidth = textWidth / text.length;
          const maxChars = Math.floor(maxWidth / avgCharWidth) - 3;
          return text.substring(0, Math.max(1, maxChars)) + '...';
        };

        // Preparar valores com formatação adequada
        const valores = [
          locacao.apartamento,
          truncateText(locacao.hospede, cols[1].w - 4),
          locacao.dataEntrada.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          locacao.dataSaida.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          formatCurrency(locacao.valorLocacao),
          formatCurrency(locacao.taxaLimpeza),
          formatCurrency(locacao.comissao),
          formatCurrency(locacao.valorProprietario)
        ];

        // Renderizar cada valor na sua respectiva coluna
        valores.forEach((valor, colIndex) => {
          const col = cols[colIndex];
          let textX = col.x + 2; // padrão left
          
          if (col.align === 'center') {
            textX = col.x + (col.w / 2);
          } else if (col.align === 'right') {
            textX = col.x + col.w - 2;
          }

          // Cor diferenciada para valores monetários
          if (colIndex >= 4) {
            doc.setTextColor(21, 128, 61); // Green-700
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(31, 41, 55);
            doc.setFont('helvetica', 'normal');
          }

          doc.text(valor, textX, yPosition + 7, { align: col.align });
        });

        yPosition += rowHeight;
      });

      // Linha de totais redesenhada
      checkAndAddPage(16);
      yPosition += 3;
      
      const totalRowHeight = 14;
      doc.setFillColor(240, 253, 244); // Green-50
      doc.roundedRect(margin, yPosition, contentWidth, totalRowHeight, 1, 1, 'F');
      doc.setDrawColor(34, 197, 94); // Green-500
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPosition, contentWidth, totalRowHeight, 1, 1, 'S');
      
      // Linhas verticais na linha de totais (apenas nas colunas de valores)
      for (let i = 4; i < cols.length; i++) {
        doc.setDrawColor(34, 197, 94);
        doc.line(cols[i].x - 1, yPosition + 1, cols[i].x - 1, yPosition + totalRowHeight - 1);
      }
      
      doc.setTextColor(21, 128, 61);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      
      // Label "TOTAIS:" posicionada corretamente
      doc.text('TOTAIS:', cols[3].x + cols[3].w - 2, yPosition + 8, { align: 'right' });
      
      // Calcular totais
      const totalValorLocacao = locacoesFiltradas.reduce((acc, loc) => acc + loc.valorLocacao, 0);
      const totalLimpeza = locacoesFiltradas.reduce((acc, loc) => acc + loc.taxaLimpeza, 0);
      const totalComissao = locacoesFiltradas.reduce((acc, loc) => acc + loc.comissao, 0);
      const totalProprietario = locacoesFiltradas.reduce((acc, loc) => acc + loc.valorProprietario, 0);
      
      // Valores totais alinhados corretamente
      doc.text(formatCurrency(totalValorLocacao), cols[4].x + cols[4].w - 2, yPosition + 8, { align: 'right' });
      doc.text(formatCurrency(totalLimpeza), cols[5].x + cols[5].w - 2, yPosition + 8, { align: 'right' });
      doc.text(formatCurrency(totalComissao), cols[6].x + cols[6].w - 2, yPosition + 8, { align: 'right' });
      doc.text(formatCurrency(totalProprietario), cols[7].x + cols[7].w - 2, yPosition + 8, { align: 'right' });

      yPosition += totalRowHeight + 15;
    }

    // TABELA DE DESPESAS OTIMIZADA
    if (despesasFiltradas.length > 0) {
      checkAndAddPage(60);

      // Título da seção
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALHAMENTO DAS DESPESAS', margin, yPosition);
      yPosition += 8;

      drawSeparator(yPosition, [51, 65, 85]);
      yPosition += 5;

      // Cabeçalho da tabela
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPosition, contentWidth, 14, 1, 1, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPosition, contentWidth, 14, 1, 1, 'S');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      
      // Colunas para despesas
      const despCols = [
        { x: margin + 2, w: 20, h: 'Data', align: 'center' as const },
        { x: margin + 24, w: 25, h: 'Apartamento', align: 'center' as const },
        { x: margin + 51, w: 95, h: 'Descrição', align: 'left' as const },
        { x: margin + 148, w: 27, h: 'Valor', align: 'right' as const }
      ];

      despCols.forEach((col, index) => {
        if (index > 0) {
          doc.line(col.x - 1, yPosition, col.x - 1, yPosition + 14);
        }
        
        let textX = col.x + 2; // padrão left
        if (col.align === 'center') {
          textX = col.x + (col.w / 2);
        } else if (col.align === 'right') {
          textX = col.x + col.w - 2;
        }
        
        doc.text(col.h, textX, yPosition + 9, { align: col.align });
      });

      yPosition += 17;

      // Dados das despesas
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      
      despesasFiltradas.forEach((despesa, index) => {
        checkAndAddPage(12);

        const rowHeight = 10;

        if (index % 2 === 0) {
          doc.setFillColor(254, 242, 242); // Red-50
          doc.roundedRect(margin, yPosition - 1, contentWidth, rowHeight, 0.5, 0.5, 'F');
        }

        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPosition - 1, contentWidth, rowHeight, 0.5, 0.5, 'S');

        despCols.forEach((col, colIndex) => {
          if (colIndex > 0) {
            doc.line(col.x - 1, yPosition - 1, col.x - 1, yPosition + rowHeight - 1);
          }
        });

        doc.setFontSize(8);
        
        const despesaValues = [
          despesa.data.toLocaleDateString('pt-BR'),
          despesa.apartamento || 'Geral',
          despesa.descricao.length > 55 ? despesa.descricao.substring(0, 52) + '...' : despesa.descricao,
          formatCurrency(despesa.valor)
        ];

        despesaValues.forEach((valor, colIndex) => {
          const col = despCols[colIndex];
          let textX = col.x + 2; // padrão left
          
          if (col.align === 'center') {
            textX = col.x + (col.w / 2);
          } else if (col.align === 'right') {
            textX = col.x + col.w - 2;
          }

          if (colIndex === 3) { // Valor
            doc.setTextColor(185, 28, 28); // Red-700
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(31, 41, 55);
            doc.setFont('helvetica', 'normal');
          }

          doc.text(valor, textX, yPosition + 6, { align: col.align });
        });

        yPosition += rowHeight;
      });

      // Total das despesas
      checkAndAddPage(14);
      yPosition += 2;
      
      const totalDespHeight = 12;
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, yPosition, contentWidth, totalDespHeight, 1, 1, 'F');
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPosition, contentWidth, totalDespHeight, 1, 1, 'S');
      
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TOTAL DAS DESPESAS:', despCols[2].x + despCols[2].w - 2, yPosition + 7, { align: 'right' });
      doc.text(formatCurrency(despesasTotal), despCols[3].x + despCols[3].w - 2, yPosition + 7, { align: 'right' });

      yPosition += totalDespHeight + 15;
    }

    // ANÁLISE COMPACTA E PROFISSIONAL
    checkAndAddPage(35);
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE E INDICADORES', margin, yPosition);
    yPosition += 8;

    drawSeparator(yPosition, [51, 65, 85]);
    yPosition += 5;

    // Box de análise compacto
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPosition, contentWidth, 30, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPosition, contentWidth, 30, 2, 2, 'S');

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const insights = [
      `• Status: ${lucroLiquido >= 0 ? 'POSITIVO' : 'NEGATIVO'} com ${formatCurrency(Math.abs(lucroLiquido))}`,
      `• Margem de Lucro: ${margemLucro.toFixed(1)}% sobre faturamento`,
      `• Eficiência: ${locacoesFiltradas.length} locações geraram ${formatCurrency(valorTotalLocacao)}`,
      `• Controle de Custos: ${despesasFiltradas.length} despesas = ${formatCurrency(despesasTotal)}`,
      `• Ticket Médio: ${locacoesFiltradas.length > 0 ? formatCurrency(valorTotalLocacao / locacoesFiltradas.length) : 'R$ 0,00'} por locação`,
      `• Distribuição: ${((proprietarioTotal / valorTotalLocacao) * 100).toFixed(1)}% proprietário | ${((comissaoTotal / valorTotalLocacao) * 100).toFixed(1)}% comissão | ${((limpezaTotal / valorTotalLocacao) * 100).toFixed(1)}% limpeza`
    ];

    insights.forEach((insight, index) => {
      doc.text(insight, margin + 3, yPosition + 5 + (index * 4));
    });

    yPosition += 40;

    // RODAPÉ ELEGANTE
    checkAndAddPage(15);
    
    drawSeparator(yPosition, [51, 65, 85]);
    yPosition += 5;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPosition, contentWidth, 12, 1, 1, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Relatório gerado automaticamente pelo Sistema de Gestão de Locações', pageWidth / 2, yPosition + 5, { align: 'center' });
    doc.text(`${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} | Página ${currentPage}`, 
      pageWidth / 2, yPosition + 9, { align: 'center' });

    return doc;
  };

  const handleExportarPDF = () => {
    const doc = gerarRelatorioPDF();
    doc.save('relatorio-locacoes.pdf');
    
    toast({
      title: "Sucesso!",
      description: "Relatório exportado com sucesso.",
    });
  };

  const handleAbrirModalWhatsApp = () => {
    setShowWhatsAppModal(true);
    // Resetar seleções ao abrir modal
    setModeloSelecionado('');
    setMensagemPersonalizada('');
    
    // Preencher automaticamente o telefone se um apartamento estiver selecionado
    if (filtros.apartamento) {
      const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
      if (apartamento?.telefoneProprietario) {
        setTelefoneDestino(apartamento.telefoneProprietario);
      }
    }
  };

  const preencherTelefoneProprietario = () => {
    if (filtros.apartamento) {
      const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
      if (apartamento?.telefoneProprietario) {
        setTelefoneDestino(apartamento.telefoneProprietario);
        toast({
          title: "Telefone preenchido",
          description: `Telefone do proprietário do apartamento ${filtros.apartamento} foi preenchido automaticamente.`,
        });
      } else {
        toast({
          title: "Aviso",
          description: `O apartamento ${filtros.apartamento} não possui telefone do proprietário cadastrado.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Aviso",
        description: "Selecione um apartamento específico nos filtros para preencher automaticamente o telefone do proprietário.",
        variant: "destructive",
      });
    }
  };

  const handleEnviarWhatsApp = async () => {
    if (!configEvolution.apiUrl || !configEvolution.apiKey || !configEvolution.instanceName) {
      toast({
        title: "Erro",
        description: "Configure primeiro as credenciais da Evolution API nas configurações.",
        variant: "destructive",
      });
      return;
    }

    if (!telefoneDestino.trim()) {
      toast({
        title: "Erro",
        description: "Informe o número de telefone para envio.",
        variant: "destructive",
      });
      return;
    }

    if (!mensagemPersonalizada.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um modelo ou escreva uma mensagem personalizada.",
        variant: "destructive",
      });
      return;
    }

    setEnviandoWhatsApp(true);

    try {
      const doc = gerarRelatorioPDF();
      const pdfBlob = doc.output('blob');

      // Gerar nome do arquivo
      let nomeArquivo = 'relatorio-locacoes';
      if (filtros.apartamento) nomeArquivo += `-apt-${filtros.apartamento}`;
      if (filtros.ano) nomeArquivo += `-${filtros.ano}`;
      if (filtros.mes) {
        const mesNome = meses.find(m => m.valor === filtros.mes)?.nome;
        nomeArquivo += `-${mesNome}`;
      }
      nomeArquivo += '.pdf';

      await enviarPDFWhatsApp(
        configEvolution,
        telefoneDestino,
        pdfBlob,
        nomeArquivo,
        mensagemPersonalizada
      );

      toast({
        title: "Sucesso!",
        description: "Relatório enviado por WhatsApp com sucesso.",
      });

      setShowWhatsAppModal(false);
      setTelefoneDestino('');
      setMensagemPersonalizada('');
      setModeloSelecionado('');
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar relatório por WhatsApp. Verifique as configurações da Evolution API.",
        variant: "destructive",
      });
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-page p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h2>
            <p className="text-muted-foreground">
              Visualize e exporte relatórios detalhados das locações
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportarPDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={handleAbrirModalWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>

        <Card className="shadow-professional-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-xl">Filtros do Relatório</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="apartamento">Apartamento</Label>
                <Select 
                  value={filtros.apartamento || 'todos'} 
                  onValueChange={(value) => setFiltros({...filtros, apartamento: value === 'todos' ? undefined : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {apartamentosDisponiveis.map((apt) => (
                      <SelectItem key={apt} value={apt}>Apartamento {apt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ano">Ano</Label>
                <Select 
                  value={filtros.ano?.toString() || 'todos'} 
                  onValueChange={(value) => setFiltros({...filtros, ano: value === 'todos' ? undefined : parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano?.toString() || ''}>{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mes">Mês</Label>
                <Select 
                  value={filtros.mes?.toString() || 'todos'} 
                  onValueChange={(value) => setFiltros({...filtros, mes: value === 'todos' ? undefined : parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {meses.map((mes) => (
                      <SelectItem key={mes.valor} value={mes.valor.toString()}>{mes.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFiltros({})}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <RelatorioSimplificado 
          locacoes={locacoesFiltradas} 
          despesas={despesasFiltradas}
          filtros={filtros}
        />

        <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enviar Relatório por WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="telefone">Número do WhatsApp</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={preencherTelefoneProprietario}
                  >
                    Usar telefone do proprietário
                  </Button>
                </div>
                <CampoTelefone
                  label=""
                  value={telefoneDestino}
                  onChange={setTelefoneDestino}
                  placeholder="(00) 00000-0000"
                  required
                />
                {filtros.apartamento && (
                  <p className="text-sm text-muted-foreground">
                    {apartamentos.find(apt => apt.numero === filtros.apartamento)?.telefoneProprietario
                      ? `Telefone do proprietário será preenchido automaticamente para o apartamento ${filtros.apartamento}`
                      : `Apartamento ${filtros.apartamento} não possui telefone do proprietário cadastrado`
                    }
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo de Mensagem</Label>
                <Select value={modeloSelecionado} onValueChange={setModeloSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo ou escreva personalizada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personalizada">Mensagem Personalizada</SelectItem>
                    {modelos.filter(m => m.ativo).map((modelo) => (
                      <SelectItem key={modelo.id} value={modelo.id}>
                        {modelo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  value={mensagemPersonalizada}
                  onChange={(e) => setMensagemPersonalizada(e.target.value)}
                  placeholder="Digite uma mensagem personalizada ou selecione um modelo acima"
                  rows={6}
                />
                {modeloSelecionado && modeloSelecionado !== 'personalizada' && (
                  <p className="text-sm text-muted-foreground">
                    Mensagem foi preenchida com base no modelo selecionado. Você pode editá-la se necessário.
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowWhatsAppModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEnviarWhatsApp} disabled={enviandoWhatsApp}>
                  <Send className="h-4 w-4 mr-2" />
                  {enviandoWhatsApp ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
