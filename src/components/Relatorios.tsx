
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RelatorioSimplificado } from './Relatorios/RelatorioSimplificado';
import { FiltrosRelatorio } from './Relatorios/FiltrosRelatorio';
import { WhatsAppModal } from './Relatorios/WhatsAppModal';
import { useLocacoes } from '@/hooks/useLocacoes';
import { useDespesas } from '@/hooks/useDespesas';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useModelosMensagem } from '@/hooks/useModelosMensagem';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { enviarPDFWhatsApp } from '@/utils/whatsapp';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';
import { FileText, MessageCircle } from 'lucide-react';
import { FiltrosLocacao } from '@/types/locacao';

export const Relatorios = () => {
  const { locacoes, filtrarLocacoes } = useLocacoes();
  const { despesas } = useDespesas();
  const { apartamentos } = useApartamentos();
  const { configEvolution } = useConfiguracoes();
  const { modelos, processarTemplate } = useModelosMensagem();
  const { generatePDF } = usePDFGenerator();
  const { toast } = useToast();

  const [filtros, setFiltros] = useState<FiltrosLocacao>({});
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
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

  const handleExportarPDF = async () => {
    try {
      const doc = await generatePDF(locacoesFiltradas, despesasFiltradas, filtros);
      doc.save('relatorio-locacoes.pdf');
      
      toast({
        title: "Sucesso!",
        description: "Relatório exportado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório PDF.",
        variant: "destructive",
      });
    }
  };

  const handleEnviarWhatsApp = async (telefoneDestino: string, mensagemPersonalizada: string) => {
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
      const doc = await generatePDF(locacoesFiltradas, despesasFiltradas, filtros);
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
            <Button onClick={() => setShowWhatsAppModal(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>

        <FiltrosRelatorio
          filtros={filtros}
          onFiltrosChange={setFiltros}
          apartamentosDisponiveis={apartamentosDisponiveis}
          anos={anos}
        />

        <RelatorioSimplificado 
          locacoes={locacoesFiltradas} 
          despesas={despesasFiltradas}
          filtros={filtros}
        />

        <WhatsAppModal
          open={showWhatsAppModal}
          onOpenChange={setShowWhatsAppModal}
          filtros={filtros}
          apartamentos={apartamentos}
          modelos={modelos}
          onEnviar={handleEnviarWhatsApp}
          onProcessarTemplate={processarTemplate}
          gerarVariaveisTemplate={gerarVariaveisTemplate}
          enviando={enviandoWhatsApp}
        />
      </div>
    </div>
  );
};
