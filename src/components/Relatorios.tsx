
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

    // Configurações básicas melhoradas
    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    let currentPage = 1;

    // Função auxiliar para adicionar nova página se necessário
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 25) {
        doc.addPage();
        currentPage++;
        yPosition = margin;
        return true;
      }
      return false;
    };

    // CABEÇALHO PROFISSIONAL MODERNO
    // Fundo do cabeçalho com gradiente simulado
    doc.setFillColor(30, 58, 138); // bg-blue-900
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Adicionar efeito de profundidade
    doc.setFillColor(59, 130, 246); // bg-blue-500 com overlay
    doc.rect(0, 50, pageWidth, 10, 'F');

    // Logo placeholder (se disponível)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 15, 30, 25, 3, 3, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('LOGO', margin + 15, 30, { align: 'center' });

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO', margin + 40, 25);
    
    // Subtítulo elegante
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Análise Completa de Locações e Despesas', margin + 40, 35);
    
    // Informações do período
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
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
    doc.text(periodoTexto, margin + 40, 45);
    
    // Data de geração no canto direito
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 25, { align: 'right' });
    doc.text(`${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin, 32, { align: 'right' });

    yPosition = 80;

    // CALCULAR VALORES FINANCEIROS
    const valorTotalLocacao = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const proprietarioTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorProprietario, 0);
    const despesasTotal = despesasFiltradas.reduce((sum, desp) => sum + desp.valor, 0);
    const lucroLiquido = proprietarioTotal - despesasTotal;
    const margemLucro = valorTotalLocacao > 0 ? ((lucroLiquido / valorTotalLocacao) * 100) : 0;

    // SEÇÃO DE RESUMO EXECUTIVO COM CARDS GRANDES
    doc.setFillColor(248, 250, 252); // bg-slate-50
    doc.roundedRect(margin, yPosition, contentWidth, 15, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPosition, contentWidth, 15, 3, 3, 'S');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('💼 RESUMO EXECUTIVO', margin + 8, yPosition + 10);
    yPosition += 25;

    // Cards financeiros maiores e mais espaçados
    const cardWidth = (contentWidth - 10) / 2;
    const cardHeight = 45;
    
    // Card 1 - Receitas (lado esquerdo, superior)
    doc.setFillColor(240, 253, 244); // bg-green-50
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(2);
    doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 4, 4, 'S');
    
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('💰 RECEITAS TOTAIS', margin + 5, yPosition + 12);
    doc.setFontSize(22);
    doc.text(formatCurrency(valorTotalLocacao), margin + 5, yPosition + 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${locacoesFiltradas.length} locações realizadas`, margin + 5, yPosition + 33);
    doc.text(`Ticket médio: ${locacoesFiltradas.length > 0 ? formatCurrency(valorTotalLocacao / locacoesFiltradas.length) : 'R$ 0,00'}`, margin + 5, yPosition + 40);

    // Card 2 - Despesas (lado direito, superior)
    const card2X = margin + cardWidth + 10;
    doc.setFillColor(254, 242, 242); // bg-red-50
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 4, 4, 'S');
    
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('💸 DESPESAS TOTAIS', card2X + 5, yPosition + 12);
    doc.setFontSize(22);
    doc.text(formatCurrency(despesasTotal), card2X + 5, yPosition + 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${despesasFiltradas.length} itens de despesa`, card2X + 5, yPosition + 33);
    doc.text(`Custo médio: ${despesasFiltradas.length > 0 ? formatCurrency(despesasTotal / despesasFiltradas.length) : 'R$ 0,00'}`, card2X + 5, yPosition + 40);

    yPosition += cardHeight + 15;

    // Card 3 - Lucro (lado esquerdo, inferior)
    if (lucroLiquido >= 0) {
      doc.setFillColor(219, 234, 254); // bg-blue-50
      doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 4, 4, 'F');
      doc.setDrawColor(29, 78, 216);
      doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 4, 4, 'S');
      doc.setTextColor(29, 78, 216);
    } else {
      doc.setFillColor(254, 242, 242); // bg-red-50
      doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 4, 4, 'F');
      doc.setDrawColor(185, 28, 28);
      doc.roundedRect(margin, yPosition, cardWidth, cardHeight, 4, 4, 'S');
      doc.setTextColor(185, 28, 28);
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(lucroLiquido >= 0 ? '📈 LUCRO LÍQUIDO' : '📉 PREJUÍZO', margin + 5, yPosition + 12);
    doc.setFontSize(22);
    doc.text(formatCurrency(Math.abs(lucroLiquido)), margin + 5, yPosition + 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Margem: ${margemLucro.toFixed(1)}%`, margin + 5, yPosition + 33);
    doc.text(`ROI: ${despesasTotal > 0 ? ((lucroLiquido / despesasTotal) * 100).toFixed(1) : '0'}%`, margin + 5, yPosition + 40);

    // Card 4 - Proprietário (lado direito, inferior)
    doc.setFillColor(237, 233, 254); // bg-violet-50
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(139, 69, 193);
    doc.roundedRect(card2X, yPosition, cardWidth, cardHeight, 4, 4, 'S');
    
    doc.setTextColor(109, 40, 217);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 VALOR PROPRIETÁRIO', card2X + 5, yPosition + 12);
    doc.setFontSize(22);
    doc.text(formatCurrency(proprietarioTotal), card2X + 5, yPosition + 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Valor líquido total', card2X + 5, yPosition + 33);
    const percentualProprietario = valorTotalLocacao > 0 ? ((proprietarioTotal / valorTotalLocacao) * 100) : 0;
    doc.text(`${percentualProprietario.toFixed(1)}% do faturamento`, card2X + 5, yPosition + 40);

    yPosition += cardHeight + 25;

    // TABELA DE LOCAÇÕES MELHORADA
    if (locacoesFiltradas.length > 0) {
      checkAndAddPage(80);
      
      // Título da seção
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(margin, yPosition, contentWidth, 18, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('🏠 DETALHAMENTO DAS LOCAÇÕES', margin + 8, yPosition + 12);
      yPosition += 25;

      // Cabeçalho da tabela mais espaçado
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(margin, yPosition, contentWidth, 16, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      // Colunas otimizadas para melhor legibilidade
      const colPositions = [
        { x: margin + 3, width: 25, header: 'Apartamento' },
        { x: margin + 30, width: 40, header: 'Hóspede' },
        { x: margin + 72, width: 25, header: 'Check-in' },
        { x: margin + 99, width: 25, header: 'Check-out' },
        { x: margin + 126, width: 22, header: 'Valor' },
        { x: margin + 150, width: 18, header: 'Limpeza' },
        { x: margin + 170, width: 20, header: 'Proprietário' }
      ];

      colPositions.forEach(col => {
        doc.text(col.header, col.x, yPosition + 10);
      });

      yPosition += 20;

      // Dados da tabela com melhor espaçamento
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      
      locacoesFiltradas.forEach((locacao, index) => {
        checkAndAddPage(14);

        // Linha zebrada
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.roundedRect(margin, yPosition - 2, contentWidth, 12, 1, 1, 'F');
        }

        doc.setFontSize(9);
        
        const valores = [
          locacao.apartamento,
          locacao.hospede.length > 25 ? locacao.hospede.substring(0, 22) + '...' : locacao.hospede,
          locacao.dataEntrada.toLocaleDateString('pt-BR'),
          locacao.dataSaida.toLocaleDateString('pt-BR'),
          formatCurrency(locacao.valorLocacao),
          formatCurrency(locacao.taxaLimpeza),
          formatCurrency(locacao.valorProprietario)
        ];

        valores.forEach((valor, colIndex) => {
          if (colIndex >= 4) { // Valores monetários
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(31, 41, 55);
            doc.setFont('helvetica', 'normal');
          }
          doc.text(valor, colPositions[colIndex].x, yPosition + 7);
        });

        yPosition += 12;
      });

      // Linha de totais destacada
      checkAndAddPage(18);
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, yPosition, contentWidth, 16, 2, 2, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPosition, contentWidth, 16, 2, 2, 'S');
      
      doc.setTextColor(21, 128, 61);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      
      doc.text('TOTAIS GERAIS:', margin + 72, yPosition + 10);
      doc.text(formatCurrency(valorTotalLocacao), margin + 126, yPosition + 10);
      doc.text(formatCurrency(limpezaTotal), margin + 150, yPosition + 10);
      doc.text(formatCurrency(proprietarioTotal), margin + 170, yPosition + 10);

      yPosition += 25;
    }

    // TABELA DE DESPESAS MELHORADA
    if (despesasFiltradas.length > 0) {
      checkAndAddPage(80);

      // Título da seção de despesas
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(margin, yPosition, contentWidth, 18, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('💰 DETALHAMENTO DAS DESPESAS', margin + 8, yPosition + 12);
      yPosition += 25;

      // Cabeçalho da tabela de despesas
      doc.setFillColor(248, 113, 113);
      doc.roundedRect(margin, yPosition, contentWidth, 16, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Data', margin + 5, yPosition + 10);
      doc.text('Apartamento', margin + 35, yPosition + 10);
      doc.text('Descrição', margin + 70, yPosition + 10);
      doc.text('Valor', margin + 150, yPosition + 10);

      yPosition += 20;

      // Dados das despesas
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      
      despesasFiltradas.forEach((despesa, index) => {
        checkAndAddPage(14);

        if (index % 2 === 0) {
          doc.setFillColor(254, 242, 242);
          doc.roundedRect(margin, yPosition - 2, contentWidth, 12, 1, 1, 'F');
        }

        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        doc.text(despesa.data.toLocaleDateString('pt-BR'), margin + 5, yPosition + 7);
        doc.text(despesa.apartamento || 'N/A', margin + 35, yPosition + 7);
        doc.text(despesa.descricao.length > 40 ? despesa.descricao.substring(0, 37) + '...' : despesa.descricao, margin + 70, yPosition + 7);
        
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(despesa.valor), margin + 150, yPosition + 7);

        yPosition += 12;
      });

      // Total das despesas
      checkAndAddPage(18);
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, yPosition, contentWidth, 16, 2, 2, 'F');
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(1);
      doc.roundedRect(margin, yPosition, contentWidth, 16, 2, 2, 'S');
      
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TOTAL DAS DESPESAS:', margin + 100, yPosition + 10);
      doc.text(formatCurrency(despesasTotal), margin + 150, yPosition + 10);

      yPosition += 25;
    }

    // ANÁLISE PROFISSIONAL
    checkAndAddPage(60);
    
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(margin, yPosition, contentWidth, 18, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 ANÁLISE E INDICADORES FINANCEIROS', margin + 8, yPosition + 12);
    yPosition += 25;

    // Caixa de análise
    doc.setFillColor(250, 250, 255);
    doc.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'F');
    doc.setDrawColor(165, 180, 252);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPosition, contentWidth, 50, 3, 3, 'S');

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const insights = [
      `• Status Financeiro: ${lucroLiquido >= 0 ? 'POSITIVO' : 'NEGATIVO'} com resultado de ${formatCurrency(Math.abs(lucroLiquido))}`,
      `• Margem de Lucro: ${margemLucro.toFixed(1)}% sobre o faturamento bruto`,
      `• Eficiência Operacional: ${locacoesFiltradas.length} locações geraram ${formatCurrency(valorTotalLocacao)}`,
      `• Controle de Custos: ${despesasFiltradas.length} despesas totalizaram ${formatCurrency(despesasTotal)}`,
      `• Performance por Locação: Ticket médio de ${locacoesFiltradas.length > 0 ? formatCurrency(valorTotalLocacao / locacoesFiltradas.length) : 'R$ 0,00'}`,
      `• Distribuição de Receitas: ${((proprietarioTotal / valorTotalLocacao) * 100).toFixed(1)}% proprietário | ${((comissaoTotal / valorTotalLocacao) * 100).toFixed(1)}% comissão | ${((limpezaTotal / valorTotalLocacao) * 100).toFixed(1)}% limpeza`
    ];

    insights.forEach((insight, index) => {
      doc.text(insight, margin + 8, yPosition + 10 + (index * 7));
    });

    yPosition += 60;

    // RODAPÉ PROFISSIONAL
    checkAndAddPage(35);
    
    // Linha separadora elegante
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Informações do rodapé
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPosition, contentWidth, 20, 2, 2, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Relatório gerado automaticamente pelo Sistema de Gestão de Locações', pageWidth / 2, yPosition + 8, { align: 'center' });
    doc.text(`${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} | Página ${currentPage}`, 
      pageWidth / 2, yPosition + 15, { align: 'center' });

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
