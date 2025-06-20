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

    // Configurações do layout moderno
    const colors = {
      primary: [37, 99, 235], // Blue-600
      primaryLight: [219, 234, 254], // Blue-100
      success: [34, 197, 94], // Green-500
      successLight: [240, 253, 244], // Green-50
      danger: [239, 68, 68], // Red-500
      dangerLight: [254, 242, 242], // Red-50
      gray: [107, 114, 128], // Gray-500
      grayLight: [249, 250, 251], // Gray-50
      dark: [17, 24, 39], // Gray-900
      border: [229, 231, 235] // Gray-200
    };

    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Função para adicionar nova página
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Função para desenhar card moderno
    const drawCard = (x: number, y: number, width: number, height: number, color = colors.grayLight) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x, y, width, height, 3, 3, 'F');
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, width, height, 3, 3, 'S');
    };

    // === CABEÇALHO MODERNO ===
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
    doc.text(dataGeracao, pageWidth - margin, 25, { align: 'right' });

    yPosition = 70;

    // === CÁLCULOS FINANCEIROS ===
    const valorTotalLocacao = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const proprietarioTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorProprietario, 0);
    const despesasTotal = despesasFiltradas.reduce((sum, desp) => sum + desp.valor, 0);
    const lucroLiquido = proprietarioTotal - despesasTotal;

    // === SEÇÃO DE MÉTRICAS ===
    const metricas = [
      { 
        titulo: 'Receita Total', 
        valor: formatCurrency(valorTotalLocacao), 
        subtitulo: `${locacoesFiltradas.length} locações`,
        cor: colors.success,
        corFundo: colors.successLight
      },
      { 
        titulo: 'Despesas', 
        valor: formatCurrency(despesasTotal), 
        subtitulo: `${despesasFiltradas.length} itens`,
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

      // Card background
      drawCard(x, y, cardWidth, cardHeight, metrica.corFundo);
      
      // Ícone/indicador colorido
      doc.setFillColor(metrica.cor[0], metrica.cor[1], metrica.cor[2]);
      doc.circle(x + 6, y + 8, 2, 'F');
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(metrica.titulo.toUpperCase(), x + 12, y + 6);
      
      // Valor principal
      doc.setTextColor(metrica.cor[0], metrica.cor[1], metrica.cor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(metrica.valor, x + 12, y + 15);
      
      // Subtítulo
      doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(metrica.subtitulo, x + 12, y + 22);
    });

    yPosition += (cardHeight * 2) + 25;

    // === TABELA DE LOCAÇÕES MODERNA ===
    if (locacoesFiltradas.length > 0) {
      checkAndAddPage(80);
      
      // Título da seção
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalhamento das Locações', margin, yPosition);
      yPosition += 12;

      // Container da tabela
      const tableHeight = Math.min(locacoesFiltradas.length * 12 + 30, 120);
      drawCard(margin, yPosition, contentWidth, tableHeight, [255, 255, 255]);
      
      // Cabeçalho da tabela
      doc.setFillColor(colors.grayLight[0], colors.grayLight[1], colors.grayLight[2]);
      doc.rect(margin + 2, yPosition + 2, contentWidth - 4, 16, 'F');
      
      // Definição das colunas com espaçamento otimizado
      const colunas = [
        { label: 'Apto', x: margin + 5, width: 20, align: 'center' as const },
        { label: 'Hóspede', x: margin + 27, width: 50, align: 'left' as const },
        { label: 'Check-in', x: margin + 79, width: 25, align: 'center' as const },
        { label: 'Check-out', x: margin + 106, width: 25, align: 'center' as const },
        { label: 'Valor', x: margin + 133, width: 22, align: 'right' as const },
        { label: 'Comissão', x: margin + 157, width: 22, align: 'right' as const },
        { label: 'Líquido', x: margin + 181, width: 22, align: 'right' as const }
      ];

      // Headers
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      colunas.forEach(col => {
        let textX = col.x;
        if (col.align === 'center') {
          textX = col.x + col.width / 2;
        } else if (col.align === 'right') {
          textX = col.x + col.width - 2;
        } else {
          textX = col.x + 2;
        }
        doc.text(col.label, textX, yPosition + 12, { align: col.align });
      });

      yPosition += 20;

      // Dados das locações
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      locacoesFiltradas.slice(0, 8).forEach((locacao, index) => {
        const rowY = yPosition + (index * 12);
        
        // Fundo alternado
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin + 2, rowY - 2, contentWidth - 4, 12, 'F');
        }

        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        const dados = [
          locacao.apartamento,
          locacao.hospede.length > 30 ? locacao.hospede.substring(0, 27) + '...' : locacao.hospede,
          locacao.dataEntrada.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          locacao.dataSaida.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          formatCurrency(locacao.valorLocacao),
          formatCurrency(locacao.comissao),
          formatCurrency(locacao.valorProprietario)
        ];

        dados.forEach((dado, colIndex) => {
          const col = colunas[colIndex];
          let textX = col.x;
          
          if (col.align === 'center') {
            textX = col.x + col.width / 2;
          } else if (col.align === 'right') {
            textX = col.x + col.width - 2;
          } else {
            textX = col.x + 2;
          }
          
          // Destaque para valores monetários
          if (colIndex >= 4) {
            doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            doc.setFont('helvetica', 'normal');
          }
          
          doc.text(dado, textX, rowY + 5, { align: col.align });
        });
      });

      // Footer da tabela com totais
      const footerY = yPosition + Math.min(locacoesFiltradas.length, 8) * 12 + 5;
      doc.setFillColor(colors.successLight[0], colors.successLight[1], colors.successLight[2]);
      doc.rect(margin + 2, footerY, contentWidth - 4, 14, 'F');
      
      doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      // Label "TOTAIS"
      const totalLabelX = colunas[3].x + colunas[3].width - 2;
      doc.text('TOTAIS', totalLabelX, footerY + 9, { align: 'right' as const });
      
      // Valores dos totais
      const totalValorX = colunas[4].x + colunas[4].width - 2;
      const totalComissaoX = colunas[5].x + colunas[5].width - 2;
      const totalLiquidoX = colunas[6].x + colunas[6].width - 2;
      
      doc.text(formatCurrency(valorTotalLocacao), totalValorX, footerY + 9, { align: 'right' as const });
      doc.text(formatCurrency(comissaoTotal), totalComissaoX, footerY + 9, { align: 'right' as const });
      doc.text(formatCurrency(proprietarioTotal), totalLiquidoX, footerY + 9, { align: 'right' as const });

      yPosition = footerY + 25;
    }

    // === DESPESAS ===
    if (despesasFiltradas.length > 0) {
      checkAndAddPage(60);
      
      // Título
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Despesas do Período', margin, yPosition);
      yPosition += 12;

      // Container
      const despesasHeight = Math.min(despesasFiltradas.length * 10 + 20, 80);
      drawCard(margin, yPosition, contentWidth, despesasHeight, [255, 255, 255]);
      
      // Cabeçalho
      doc.setFillColor(colors.dangerLight[0], colors.dangerLight[1], colors.dangerLight[2]);
      doc.rect(margin + 2, yPosition + 2, contentWidth - 4, 14, 'F');
      
      doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Data', margin + 15, yPosition + 11, { align: 'center' });
      doc.text('Descrição', margin + 40, yPosition + 11);
      doc.text('Apartamento', margin + 120, yPosition + 11, { align: 'center' });
      doc.text('Valor', margin + contentWidth - 15, yPosition + 11, { align: 'right' });

      yPosition += 18;

      // Dados das despesas
      doc.setFontSize(8);
      despesasFiltradas.slice(0, 6).forEach((despesa, index) => {
        const rowY = yPosition + (index * 10);
        
        if (index % 2 === 0) {
          doc.setFillColor(254, 248, 248);
          doc.rect(margin + 2, rowY - 2, contentWidth - 4, 10, 'F');
        }

        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFont('helvetica', 'normal');
        
        doc.text(despesa.data.toLocaleDateString('pt-BR'), margin + 15, rowY + 5, { align: 'center' });
        doc.text(despesa.descricao.length > 40 ? despesa.descricao.substring(0, 37) + '...' : despesa.descricao, margin + 32, rowY + 5);
        doc.text(despesa.apartamento || 'Geral', margin + 120, rowY + 5, { align: 'center' });
        
        doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(despesa.valor), margin + contentWidth - 15, rowY + 5, { align: 'right' });
      });

      // Total das despesas
      const totalY = yPosition + Math.min(despesasFiltradas.length, 6) * 10 + 3;
      doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.rect(margin + 2, totalY, contentWidth - 4, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL DAS DESPESAS', margin + contentWidth/2, totalY + 7, { align: 'center' });
      doc.text(formatCurrency(despesasTotal), margin + contentWidth - 15, totalY + 7, { align: 'right' });

      yPosition = totalY + 20;
    }

    // === ANÁLISE FINAL ===
    checkAndAddPage(40);
    
    drawCard(margin, yPosition, contentWidth, 35, colors.primaryLight);
    
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Executivo', margin + 5, yPosition + 8);
    
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const resumo = [
      `→ Resultado: ${lucroLiquido >= 0 ? 'LUCRO' : 'PREJUÍZO'} de ${formatCurrency(Math.abs(lucroLiquido))}`,
      `→ Margem de lucro: ${valorTotalLocacao > 0 ? ((lucroLiquido / valorTotalLocacao) * 100).toFixed(1) : '0'}%`,
      `→ Ticket médio por locação: ${locacoesFiltradas.length > 0 ? formatCurrency(valorTotalLocacao / locacoesFiltradas.length) : 'R$ 0,00'}`,
      `→ Taxa de despesas: ${valorTotalLocacao > 0 ? ((despesasTotal / valorTotalLocacao) * 100).toFixed(1) : '0'}% sobre receita`
    ];

    resumo.forEach((linha, index) => {
      doc.text(linha, margin + 5, yPosition + 16 + (index * 5));
    });

    // === RODAPÉ ===
    yPosition += 50;
    checkAndAddPage(15);
    
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestão de Locações - Relatório gerado automaticamente', pageWidth/2, yPosition + 8, { align: 'center' });

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
