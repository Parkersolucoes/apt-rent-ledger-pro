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

    // Configurar margens
    const margin = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);

    let yPosition = margin;

    // Header mais sutil com gradiente suave
    doc.setFillColor(248, 250, 252); // bg-slate-50
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Borda inferior do header
    doc.setDrawColor(226, 232, 240); // border-slate-200
    doc.setLineWidth(0.5);
    doc.line(0, 45, pageWidth, 45);

    // Título principal
    doc.setTextColor(51, 65, 85); // text-slate-700
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO DE LOCAÇÕES', pageWidth / 2, yPosition + 18, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // text-slate-500
    doc.text('Análise Detalhada de Performance', pageWidth / 2, yPosition + 30, { align: 'center' });
    
    yPosition = 55;

    // Seção de filtros aplicados com background mais sutil
    doc.setFillColor(241, 245, 249); // bg-slate-100
    doc.rect(margin, yPosition, contentWidth, 18, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // text-slate-600
    doc.text('FILTROS APLICADOS', margin + 5, yPosition + 7);
    
    yPosition += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // text-slate-500
    
    let filtrosTexto = '';
    if (filtros.apartamento) filtrosTexto += `Apartamento ${filtros.apartamento} • `;
    if (filtros.ano) filtrosTexto += `Ano ${filtros.ano} • `;
    if (filtros.mes) {
      const mesNome = meses.find(m => m.valor === filtros.mes)?.nome;
      filtrosTexto += `Mês ${mesNome} • `;
    }
    if (!filtrosTexto) filtrosTexto = 'Todos os registros';
    
    doc.text(filtrosTexto, margin + 5, yPosition + 7);
    yPosition += 25;

    // Calcular valores para os cards do resumo
    const valorTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const comissaoTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.comissao, 0);
    const limpezaTotal = locacoesFiltradas.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const proprietarioTotal = valorTotal - comissaoTotal - limpezaTotal;
    const despesasTotal = despesasFiltradas.reduce((sum, desp) => sum + desp.valor, 0);
    const lucroLiquido = proprietarioTotal - despesasTotal;

    // Cards do resumo financeiro com cores mais sutis
    const cardWidth = (contentWidth - 15) / 4;
    const cardHeight = 28;
    
    // Card 1 - Receitas (Verde mais suave)
    doc.setFillColor(220, 252, 231); // bg-green-100
    doc.rect(margin, yPosition, cardWidth, cardHeight, 'F');
    doc.setDrawColor(34, 197, 94); // border-green-500
    doc.setLineWidth(0.8);
    doc.rect(margin, yPosition, cardWidth, cardHeight);
    
    doc.setTextColor(21, 128, 61); // text-green-700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEITAS TOTAIS', margin + 3, yPosition + 7);
    doc.setFontSize(13);
    doc.text(formatCurrency(valorTotal), margin + 3, yPosition + 16);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${locacoesFiltradas.length} locações`, margin + 3, yPosition + 23);

    // Card 2 - Despesas (Vermelho mais suave)
    const card2X = margin + cardWidth + 5;
    doc.setFillColor(254, 226, 226); // bg-red-100
    doc.rect(card2X, yPosition, cardWidth, cardHeight, 'F');
    doc.setDrawColor(239, 68, 68); // border-red-500
    doc.rect(card2X, yPosition, cardWidth, cardHeight);
    
    doc.setTextColor(185, 28, 28); // text-red-700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DESPESAS TOTAIS', card2X + 3, yPosition + 7);
    doc.setFontSize(13);
    doc.text(formatCurrency(despesasTotal), card2X + 3, yPosition + 16);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${despesasFiltradas.length} itens`, card2X + 3, yPosition + 23);

    // Card 3 - Lucro (Azul mais suave)
    const card3X = margin + (cardWidth + 5) * 2;
    doc.setFillColor(219, 234, 254); // bg-blue-100
    doc.rect(card3X, yPosition, cardWidth, cardHeight, 'F');
    doc.setDrawColor(59, 130, 246); // border-blue-500
    doc.rect(card3X, yPosition, cardWidth, cardHeight);
    
    doc.setTextColor(29, 78, 216); // text-blue-700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('LUCRO LÍQUIDO', card3X + 3, yPosition + 7);
    doc.setFontSize(13);
    doc.text(formatCurrency(lucroLiquido), card3X + 3, yPosition + 16);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const margem = valorTotal > 0 ? `${((lucroLiquido / valorTotal) * 100).toFixed(1)}%` : '0%';
    doc.text(`Margem: ${margem}`, card3X + 3, yPosition + 23);

    // Card 4 - Proprietário (Roxo mais suave)
    const card4X = margin + (cardWidth + 5) * 3;
    doc.setFillColor(237, 233, 254); // bg-violet-100
    doc.rect(card4X, yPosition, cardWidth, cardHeight, 'F');
    doc.setDrawColor(168, 85, 247); // border-purple-500
    doc.rect(card4X, yPosition, cardWidth, cardHeight);
    
    doc.setTextColor(109, 40, 217); // text-violet-700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPRIETÁRIO', card4X + 3, yPosition + 7);
    doc.setFontSize(13);
    doc.text(formatCurrency(proprietarioTotal), card4X + 3, yPosition + 16);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Valor líquido', card4X + 3, yPosition + 23);

    yPosition += cardHeight + 20;

    // Tabela de locações com header mais sutil
    if (locacoesFiltradas.length > 0) {
      // Header da seção
      doc.setFillColor(71, 85, 105); // bg-slate-600
      doc.rect(margin, yPosition, contentWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('💰 DETALHAMENTO DAS LOCAÇÕES', margin + 5, yPosition + 8);
      yPosition += 15;

      // Cabeçalho da tabela
      doc.setFillColor(148, 163, 184); // bg-slate-400
      doc.rect(margin, yPosition, contentWidth, 10, 'F');
      
      const colWidths = [20, 45, 30, 25, 25, 25, 20];
      let xPosition = margin + 2;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Apt', xPosition, yPosition + 6);
      xPosition += colWidths[0];
      doc.text('Hóspede', xPosition, yPosition + 6);
      xPosition += colWidths[1];
      doc.text('Entrada', xPosition, yPosition + 6);
      xPosition += colWidths[2];
      doc.text('Valor', xPosition, yPosition + 6);
      xPosition += colWidths[3];
      doc.text('Comissão', xPosition, yPosition + 6);
      xPosition += colWidths[4];
      doc.text('Limpeza', xPosition, yPosition + 6);
      xPosition += colWidths[5];
      doc.text('Proprietário', xPosition, yPosition + 6);

      yPosition += 12;

      // Dados da tabela com linhas alternadas mais sutis
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81); // text-gray-700
      
      locacoesFiltradas.forEach((locacao, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin + 20;
        }

        // Linha alternada mais sutil
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251); // bg-gray-50
          doc.rect(margin, yPosition - 2, contentWidth, 8, 'F');
        }

        xPosition = margin + 2;
        doc.setFontSize(7);
        doc.text(locacao.apartamento, xPosition, yPosition + 3);
        xPosition += colWidths[0];
        doc.text(locacao.hospede.substring(0, 25), xPosition, yPosition + 3);
        xPosition += colWidths[1];
        doc.text(locacao.dataEntrada.toLocaleDateString('pt-BR'), xPosition, yPosition + 3);
        xPosition += colWidths[2];
        doc.text(formatCurrency(locacao.valorLocacao), xPosition, yPosition + 3);
        xPosition += colWidths[3];
        doc.text(formatCurrency(locacao.comissao), xPosition, yPosition + 3);
        xPosition += colWidths[4];
        doc.text(formatCurrency(locacao.taxaLimpeza), xPosition, yPosition + 3);
        xPosition += colWidths[5];
        doc.text(formatCurrency(locacao.valorProprietario), xPosition, yPosition + 3);

        yPosition += 8;
      });

      // Total da tabela com cor mais sutil
      doc.setFillColor(220, 252, 231); // bg-green-100
      doc.rect(margin, yPosition, contentWidth, 10, 'F');
      doc.setTextColor(21, 128, 61); // text-green-700
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      
      xPosition = margin + colWidths[0] + colWidths[1] + 2;
      doc.text('TOTAL:', xPosition, yPosition + 6);
      xPosition += colWidths[2];
      doc.text(formatCurrency(valorTotal), xPosition, yPosition + 6);
      xPosition += colWidths[3];
      doc.text(formatCurrency(comissaoTotal), xPosition, yPosition + 6);
      xPosition += colWidths[4];
      doc.text(formatCurrency(limpezaTotal), xPosition, yPosition + 6);
      xPosition += colWidths[5];
      doc.text(formatCurrency(proprietarioTotal), xPosition, yPosition + 6);

      yPosition += 15;
    }

    // Seção de despesas se houver (cores mais sutis)
    if (despesasFiltradas.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin + 20;
      }

      // Header da seção de despesas
      doc.setFillColor(185, 28, 28); // bg-red-700 mais suave
      doc.rect(margin, yPosition, contentWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('💸 DETALHAMENTO DAS DESPESAS', margin + 5, yPosition + 8);
      yPosition += 15;

      // Cabeçalho da tabela de despesas
      doc.setFillColor(239, 68, 68); // bg-red-500 mais suave
      doc.rect(margin, yPosition, contentWidth, 10, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Data', margin + 2, yPosition + 6);
      doc.text('Descrição', margin + 25, yPosition + 6);
      doc.text('Valor', margin + 140, yPosition + 6);

      yPosition += 12;

      // Dados das despesas
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81); // text-gray-700
      
      despesasFiltradas.forEach((despesa, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin + 20;
        }

        if (index % 2 === 0) {
          doc.setFillColor(254, 242, 242); // bg-red-50
          doc.rect(margin, yPosition - 2, contentWidth, 8, 'F');
        }

        doc.setFontSize(7);
        doc.text(despesa.data.toLocaleDateString('pt-BR'), margin + 2, yPosition + 3);
        doc.text(despesa.descricao.substring(0, 60), margin + 25, yPosition + 3);
        doc.text(formatCurrency(despesa.valor), margin + 140, yPosition + 3);

        yPosition += 8;
      });

      // Total das despesas
      doc.setFillColor(254, 226, 226); // bg-red-100
      doc.rect(margin, yPosition, contentWidth, 10, 'F');
      doc.setTextColor(185, 28, 28); // text-red-700
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TOTAL DESPESAS:', margin + 80, yPosition + 6);
      doc.text(formatCurrency(despesasTotal), margin + 140, yPosition + 6);
    }

    // Footer com informações adicionais
    doc.setTextColor(156, 163, 175); // text-gray-400
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 
      pageWidth / 2, pageHeight - 10, { align: 'center' });

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
