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

    // Configurações básicas
    const margin = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;

    // Função auxiliar para adicionar nova página se necessário
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // HEADER MODERNO COM GRADIENTE
    // Background do header
    doc.setFillColor(37, 99, 235); // bg-blue-600
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Overlay com transparência
    doc.setFillColor(59, 130, 246, 0.1); // bg-blue-500 com transparência
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO', pageWidth / 2, 20, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Análise Completa de Locações e Despesas', pageWidth / 2, 30, { align: 'center' });
    
    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 
      pageWidth / 2, 40, { align: 'center' });

    yPosition = 60;

    // SEÇÃO DE FILTROS APLICADOS
    doc.setFillColor(248, 250, 252); // bg-slate-50
    doc.roundedRect(margin, yPosition, contentWidth, 20, 3, 3, 'F');
    
    doc.setDrawColor(226, 232, 240); // border-slate-200
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPosition, contentWidth, 20, 3, 3, 'S');
    
    doc.setTextColor(71, 85, 105); // text-slate-600
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 FILTROS APLICADOS', margin + 5, yPosition + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let filtrosTexto = '';
    if (filtros.apartamento) filtrosTexto += `Apartamento: ${filtros.apartamento} • `;
    if (filtros.ano) filtrosTexto += `Ano: ${filtros.ano} • `;
    if (filtros.mes) {
      const mesNome = meses.find(m => m.valor === filtros.mes)?.nome;
      filtrosTexto += `Mês: ${mesNome} • `;
    }
    if (!filtrosTexto) filtrosTexto = 'Nenhum filtro aplicado - Mostrando todos os registros';
    
    doc.text(filtrosTexto.replace(/ • $/, ''), margin + 5, yPosition + 15);
    yPosition += 30;

    // CALCULAR TODOS OS VALORES
    const valorTotalLocacao = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const proprietarioTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorProprietario, 0);
    const despesasTotal = despesasFiltradas.reduce((sum, desp) => sum + desp.valor, 0);
    const lucroLiquido = proprietarioTotal - despesasTotal;
    const margemLucro = valorTotalLocacao > 0 ? ((lucroLiquido / valorTotalLocacao) * 100) : 0;
    const roi = despesasTotal > 0 ? ((lucroLiquido / despesasTotal) * 100) : 0;

    // CARDS DE RESUMO FINANCEIRO MODERNOS
    const cardWidth = (contentWidth - 15) / 4;
    const cardHeight = 35;
    
    // Card 1 - Receitas
    doc.setFillColor(240, 253, 244); // bg-green-50
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(34, 197, 94); // border-green-500
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(21, 128, 61); // text-green-700
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('💰 RECEITAS TOTAIS', margin + 3, yPosition + 8);
    doc.setFontSize(14);
    doc.text(formatCurrency(valorTotalLocacao), margin + 3, yPosition + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${locacoesFiltradas.length} locações`, margin + 3, yPosition + 25);
    doc.text(`Média: ${locacoesFiltradas.length > 0 ? formatCurrency(valorTotalLocacao / locacoesFiltradas.length) : 'R$ 0,00'}`, margin + 3, yPosition + 30);

    // Card 2 - Despesas
    const card2X = margin + cardWidth + 5;
    doc.setFillColor(254, 242, 242); // bg-red-50
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(239, 68, 68); // border-red-500
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(185, 28, 28); // text-red-700
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('💸 DESPESAS TOTAIS', card2X + 3, yPosition + 8);
    doc.setFontSize(14);
    doc.text(formatCurrency(despesasTotal), card2X + 3, yPosition + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${despesasFiltradas.length} itens`, card2X + 3, yPosition + 25);
    doc.text(`Média: ${despesasFiltradas.length > 0 ? formatCurrency(despesasTotal / despesasFiltradas.length) : 'R$ 0,00'}`, card2X + 3, yPosition + 30);

    // Card 3 - Lucro
    const card3X = margin + (cardWidth + 5) * 2;
    const lucroColor = lucroLiquido >= 0 ? [219, 234, 254, 29, 78, 216] : [254, 242, 242, 185, 28, 28]; // blue ou red
    doc.setFillColor(lucroColor[0], lucroColor[1], lucroColor[2]); 
    doc.roundedRect(card3X, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(lucroColor[3], lucroColor[4], lucroColor[5]);
    doc.roundedRect(card3X, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(lucroColor[3], lucroColor[4], lucroColor[5]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(lucroLiquido >= 0 ? '📈 LUCRO LÍQUIDO' : '📉 PREJUÍZO', card3X + 3, yPosition + 8);
    doc.setFontSize(14);
    doc.text(formatCurrency(lucroLiquido), card3X + 3, yPosition + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Margem: ${margemLucro.toFixed(1)}%`, card3X + 3, yPosition + 25);
    doc.text(`ROI: ${roi.toFixed(1)}%`, card3X + 3, yPosition + 30);

    // Card 4 - Proprietário
    const card4X = margin + (cardWidth + 5) * 3;
    doc.setFillColor(237, 233, 254); // bg-violet-50
    doc.roundedRect(card4X, yPosition, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(139, 69, 193); // border-purple-500
    doc.roundedRect(card4X, yPosition, cardWidth, cardHeight, 2, 2, 'S');
    
    doc.setTextColor(109, 40, 217); // text-violet-700
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 PROPRIETÁRIO', card4X + 3, yPosition + 8);
    doc.setFontSize(14);
    doc.text(formatCurrency(proprietarioTotal), card4X + 3, yPosition + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Valor líquido', card4X + 3, yPosition + 25);
    const percentualProprietario = valorTotalLocacao > 0 ? ((proprietarioTotal / valorTotalLocacao) * 100) : 0;
    doc.text(`${percentualProprietario.toFixed(1)}% do total`, card4X + 3, yPosition + 30);

    yPosition += cardHeight + 20;

    // TABELA DE LOCAÇÕES DETALHADA
    if (locacoesFiltradas.length > 0) {
      checkAndAddPage(60);
      
      // Header da seção
      doc.setFillColor(37, 99, 235); // bg-blue-600
      doc.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🏠 DETALHAMENTO COMPLETO DAS LOCAÇÕES', margin + 5, yPosition + 10);
      yPosition += 20;

      // Cabeçalho da tabela
      doc.setFillColor(59, 130, 246); // bg-blue-500
      doc.roundedRect(margin, yPosition, contentWidth, 12, 1, 1, 'F');
      
      const colWidths = [18, 38, 22, 22, 22, 22, 22, 22, 12];
      let xPosition = margin + 2;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      const headers = ['Apt', 'Hóspede', 'Check-in', 'Check-out', 'Valor', 'Limpeza', 'Comissão', 'Proprietário', 'Dias'];
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition + 7);
        xPosition += colWidths[index];
      });

      yPosition += 14;

      // Dados da tabela
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55); // text-gray-800
      
      locacoesFiltradas.forEach((locacao, index) => {
        checkAndAddPage(10);

        // Linha alternada
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251); // bg-gray-50
          doc.roundedRect(margin, yPosition - 1, contentWidth, 9, 0.5, 0.5, 'F');
        }

        xPosition = margin + 2;
        doc.setFontSize(7);
        
        // Calcular dias de estadia
        const diasEstadia = Math.ceil((locacao.dataSaida.getTime() - locacao.dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
        
        const valores = [
          locacao.apartamento,
          locacao.hospede.substring(0, 20) + (locacao.hospede.length > 20 ? '...' : ''),
          locacao.dataEntrada.toLocaleDateString('pt-BR'),
          locacao.dataSaida.toLocaleDateString('pt-BR'),
          formatCurrency(locacao.valorLocacao),
          formatCurrency(locacao.taxaLimpeza),
          formatCurrency(locacao.comissao),
          formatCurrency(locacao.valorProprietario),
          diasEstadia.toString()
        ];

        valores.forEach((valor, colIndex) => {
          if (colIndex >= 4 && colIndex <= 7) { // Valores monetários
            doc.setTextColor(colIndex === 4 ? [34, 197, 94] : colIndex === 7 ? [139, 69, 193] : [239, 68, 68]);
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(31, 41, 55);
            doc.setFont('helvetica', 'normal');
          }
          doc.text(valor, xPosition, yPosition + 5);
          xPosition += colWidths[colIndex];
        });

        yPosition += 9;
      });

      // Total da tabela
      checkAndAddPage(15);
      doc.setFillColor(240, 253, 244); // bg-green-50
      doc.roundedRect(margin, yPosition, contentWidth, 12, 1, 1, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPosition, contentWidth, 12, 1, 1, 'S');
      
      doc.setTextColor(21, 128, 61); // text-green-700
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      
      xPosition = margin + colWidths[0] + colWidths[1] + 2;
      doc.text('TOTAIS:', xPosition, yPosition + 7);
      xPosition += colWidths[2] + colWidths[3];
      doc.text(formatCurrency(valorTotalLocacao), xPosition, yPosition + 7);
      xPosition += colWidths[4];
      doc.text(formatCurrency(limpezaTotal), xPosition, yPosition + 7);
      xPosition += colWidths[5];
      doc.text(formatCurrency(comissaoTotal), xPosition, yPosition + 7);
      xPosition += colWidths[6];
      doc.text(formatCurrency(proprietarioTotal), xPosition, yPosition + 7);

      yPosition += 20;
    }

    // TABELA DE DESPESAS DETALHADA
    if (despesasFiltradas.length > 0) {
      checkAndAddPage(60);

      // Header da seção de despesas
      doc.setFillColor(239, 68, 68); // bg-red-500
      doc.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('💰 DETALHAMENTO COMPLETO DAS DESPESAS', margin + 5, yPosition + 10);
      yPosition += 20;

      // Cabeçalho da tabela de despesas
      doc.setFillColor(248, 113, 113); // bg-red-400
      doc.roundedRect(margin, yPosition, contentWidth, 12, 1, 1, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Data', margin + 2, yPosition + 7);
      doc.text('Apartamento', margin + 25, yPosition + 7);
      doc.text('Descrição', margin + 50, yPosition + 7);
      doc.text('Valor', margin + 140, yPosition + 7);

      yPosition += 14;

      // Dados das despesas
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55); // text-gray-800
      
      despesasFiltradas.forEach((despesa, index) => {
        checkAndAddPage(10);

        if (index % 2 === 0) {
          doc.setFillColor(254, 242, 242); // bg-red-50
          doc.roundedRect(margin, yPosition - 1, contentWidth, 9, 0.5, 0.5, 'F');
        }

        doc.setFontSize(7);
        doc.setTextColor(31, 41, 55);
        doc.text(despesa.data.toLocaleDateString('pt-BR'), margin + 2, yPosition + 5);
        doc.text(despesa.apartamento || 'N/A', margin + 25, yPosition + 5);
        doc.text(despesa.descricao.substring(0, 50) + (despesa.descricao.length > 50 ? '...' : ''), margin + 50, yPosition + 5);
        
        doc.setTextColor(239, 68, 68); // text-red-500
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(despesa.valor), margin + 140, yPosition + 5);

        yPosition += 9;
      });

      // Total das despesas
      checkAndAddPage(15);
      doc.setFillColor(254, 242, 242); // bg-red-50
      doc.roundedRect(margin, yPosition, contentWidth, 12, 1, 1, 'F');
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPosition, contentWidth, 12, 1, 1, 'S');
      
      doc.setTextColor(185, 28, 28); // text-red-700
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TOTAL DESPESAS:', margin + 90, yPosition + 7);
      doc.text(formatCurrency(despesasTotal), margin + 140, yPosition + 7);

      yPosition += 20;
    }

    // SEÇÃO DE ANÁLISE E INSIGHTS
    checkAndAddPage(50);
    
    doc.setFillColor(79, 70, 229); // bg-indigo-600
    doc.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 ANÁLISE E INSIGHTS FINANCEIROS', margin + 5, yPosition + 10);
    yPosition += 20;

    // Background da análise
    doc.setFillColor(250, 250, 255); // bg-indigo-50
    doc.roundedRect(margin, yPosition, contentWidth, 40, 2, 2, 'F');
    doc.setDrawColor(165, 180, 252);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPosition, contentWidth, 40, 2, 2, 'S');

    doc.setTextColor(55, 65, 81); // text-gray-700
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const insights = [
      `• Performance Geral: ${lucroLiquido >= 0 ? 'POSITIVA' : 'NEGATIVA'} com ${lucroLiquido >= 0 ? 'lucro' : 'prejuízo'} de ${formatCurrency(Math.abs(lucroLiquido))}`,
      `• Margem de Lucro: ${margemLucro.toFixed(1)}% sobre o faturamento total`,
      `• Retorno sobre Investimento (ROI): ${roi.toFixed(1)}% sobre as despesas`,
      `• Ticket Médio por Locação: ${locacoesFiltradas.length > 0 ? formatCurrency(valorTotalLocacao / locacoesFiltradas.length) : 'R$ 0,00'}`,
      `• Custo Médio por Despesa: ${despesasFiltradas.length > 0 ? formatCurrency(despesasTotal / despesasFiltradas.length) : 'R$ 0,00'}`,
      `• Taxa de Ocupação: ${locacoesFiltradas.length} locações no período analisado`,
      `• Distribuição: ${((comissaoTotal / valorTotalLocacao) * 100).toFixed(1)}% comissão | ${((limpezaTotal / valorTotalLocacao) * 100).toFixed(1)}% limpeza | ${((proprietarioTotal / valorTotalLocacao) * 100).toFixed(1)}% proprietário`
    ];

    insights.forEach((insight, index) => {
      doc.text(insight, margin + 5, yPosition + 8 + (index * 5));
    });

    yPosition += 50;

    // FOOTER MODERNO
    checkAndAddPage(30);
    
    // Linha separadora
    doc.setDrawColor(203, 213, 225); // border-slate-300
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Informações do footer
    doc.setTextColor(148, 163, 184); // text-slate-400
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Relatório gerado automaticamente pelo sistema de gestão de locações', pageWidth / 2, yPosition, { align: 'center' });
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} - Hora: ${new Date().toLocaleTimeString('pt-BR')}`, 
      pageWidth / 2, yPosition + 5, { align: 'center' });
    
    if (filtros.apartamento) {
      const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
      if (apartamento?.proprietario) {
        doc.text(`Proprietário: ${apartamento.proprietario}`, pageWidth / 2, yPosition + 10, { align: 'center' });
      }
    }

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
