import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocacoes } from '@/hooks/useLocacoes';
import { useDespesas } from '@/hooks/useDespesas';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CalendarIcon, FileText, Mail, Download } from 'lucide-react';
import { RelatorioDetalhado } from './Relatorios/RelatorioDetalhado';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface FiltrosRelatorio {
  apartamento: string;
  dataInicio: Date;
  dataFim: Date;
}

export const Relatorios = () => {
  const { locacoes, obterApartamentos } = useLocacoes();
  const { despesas } = useDespesas();
  const { logoUrl } = useConfiguracoes();
  const { toast } = useToast();
  
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    apartamento: '',
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    dataFim: new Date()
  });
  
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);
  const [emailDestino, setEmailDestino] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  const apartamentos = obterApartamentos();

  const gerarRelatorio = () => {
    if (!filtros.apartamento || !filtros.dataInicio || !filtros.dataFim) {
      return;
    }
    setMostrarRelatorio(true);
  };

  const exportarPDF = async () => {
    const relatorioElement = document.querySelector('.relatorio-detalhado') as HTMLElement;
    if (!relatorioElement) {
      toast({
        title: "Erro",
        description: "Relatório não encontrado para exportação.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Temporarily modify styles for better PDF capture
      const originalStyle = relatorioElement.style.cssText;
      relatorioElement.style.cssText = `
        ${originalStyle}
        background: white !important;
        color: black !important;
        width: 210mm !important;
        min-height: 297mm !important;
        padding: 5mm !important;
        box-shadow: none !important;
        border: none !important;
        font-size: 10px !important;
        line-height: 1.3 !important;
      `;

      // Apply specific styles to nested elements for PDF
      const cards = relatorioElement.querySelectorAll('.border-slate-200');
      cards.forEach(card => {
        (card as HTMLElement).style.border = '1px solid #ccc';
        (card as HTMLElement).style.boxShadow = 'none';
        (card as HTMLElement).style.background = 'white';
        (card as HTMLElement).style.marginBottom = '6px';
      });

      const headers = relatorioElement.querySelectorAll('[class*="bg-gradient"]');
      headers.forEach(header => {
        (header as HTMLElement).style.background = '#f8f9fa !important';
        (header as HTMLElement).style.color = '#000 !important';
        (header as HTMLElement).style.border = '1px solid #ccc';
        (header as HTMLElement).style.padding = '6px';
      });

      // Optimize table styles for PDF
      const tables = relatorioElement.querySelectorAll('table');
      tables.forEach(table => {
        (table as HTMLElement).style.fontSize = '9px';
        (table as HTMLElement).style.lineHeight = '1.2';
      });

      // Capture the element as canvas
      const canvas = await html2canvas(relatorioElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      });

      // Create PDF with minimal margins
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 200; // Reduced width for minimal margins (5mm each side)
      const pageHeight = 287; // Reduced height for minimal margins (5mm each side)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 5; // Start with 5mm margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = `relatorio-${filtros.apartamento}-${formatDate(filtros.dataInicio).replace(/\//g, '-')}-${formatDate(filtros.dataFim).replace(/\//g, '-')}.pdf`;
      
      // Download the PDF
      pdf.save(filename);

      // Restore original styles
      relatorioElement.style.cssText = originalStyle;
      cards.forEach(card => {
        (card as HTMLElement).style.cssText = '';
      });
      headers.forEach(header => {
        (header as HTMLElement).style.cssText = '';
      });
      tables.forEach(table => {
        (table as HTMLElement).style.cssText = '';
      });

      toast({
        title: "PDF exportado com sucesso!",
        description: `O arquivo ${filename} foi baixado.`,
      });

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive",
      });
      
      // Restore original styles in case of error
      relatorioElement.style.cssText = '';
    }
  };

  const enviarPorEmail = async () => {
    if (!emailDestino || !filtros.apartamento) return;
    
    setEnviandoEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: {
          email: emailDestino,
          apartamento: filtros.apartamento,
          dataInicio: filtros.dataInicio.toISOString(),
          dataFim: filtros.dataFim.toISOString(),
          totalReceitas,
          totalDespesas,
          lucroLiquido,
          locacoes: locacoesPeriodo,
          despesas: despesasPeriodo
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email enviado com sucesso!",
        description: `O relatório foi enviado para ${emailDestino}`,
      });

      setEmailDestino('');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: "Erro ao enviar email",
        description: "Verifique as configurações de SMTP na aba Configurações.",
        variant: "destructive",
      });
    } finally {
      setEnviandoEmail(false);
    }
  };

  // Filtrar dados do período
  const locacoesPeriodo = locacoes.filter(loc => {
    if (filtros.apartamento && loc.apartamento !== filtros.apartamento) return false;
    
    const dataEntrada = new Date(loc.dataEntrada);
    const dataSaida = new Date(loc.dataSaida);
    
    return (dataEntrada >= filtros.dataInicio && dataEntrada <= filtros.dataFim) ||
           (dataSaida >= filtros.dataInicio && dataSaida <= filtros.dataFim) ||
           (dataEntrada <= filtros.dataInicio && dataSaida >= filtros.dataFim);
  });

  const despesasPeriodo = despesas.filter(desp => {
    if (filtros.apartamento && desp.apartamento !== filtros.apartamento) return false;
    
    const dataDesp = new Date(desp.data);
    return dataDesp >= filtros.dataInicio && dataDesp <= filtros.dataFim;
  });

  const totalReceitas = locacoesPeriodo.reduce((acc, loc) => acc + loc.valorLocacao, 0);
  const totalDespesas = despesasPeriodo.reduce((acc, desp) => acc + desp.valor, 0);
  const lucroLiquido = totalReceitas - totalDespesas;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Relatórios</h1>
        </div>

        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gerar Relatório Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Seleção de Apartamento */}
              <div className="space-y-2">
                <Label htmlFor="apartamento">Apartamento</Label>
                <Select value={filtros.apartamento} onValueChange={(value) => setFiltros({...filtros, apartamento: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um apartamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartamentos.map(apt => (
                      <SelectItem key={apt} value={apt}>{apt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtros.dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dataInicio ? formatDate(filtros.dataInicio) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtros.dataInicio}
                      onSelect={(date) => date && setFiltros({...filtros, dataInicio: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtros.dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dataFim ? formatDate(filtros.dataFim) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtros.dataFim}
                      onSelect={(date) => date && setFiltros({...filtros, dataFim: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={gerarRelatorio}
                disabled={!filtros.apartamento || !filtros.dataInicio || !filtros.dataFim}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>

              {mostrarRelatorio && (
                <>
                  <Button onClick={exportarPDF} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="email@exemplo.com"
                      value={emailDestino}
                      onChange={(e) => setEmailDestino(e.target.value)}
                      className="w-48"
                    />
                    <Button 
                      onClick={enviarPorEmail}
                      disabled={!emailDestino || enviandoEmail}
                      variant="outline"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {enviandoEmail ? 'Enviando...' : 'Enviar Email'}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Resumo Rápido */}
            {mostrarRelatorio && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(totalReceitas)}
                    </div>
                    <div className="text-sm text-green-600">Total Receitas</div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">
                      {formatCurrency(totalDespesas)}
                    </div>
                    <div className="text-sm text-red-600">Total Despesas</div>
                  </CardContent>
                </Card>

                <Card className={`${lucroLiquido >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      {formatCurrency(lucroLiquido)}
                    </div>
                    <div className={`text-sm ${lucroLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      Lucro Líquido
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Relatório Detalhado */}
        {mostrarRelatorio && (
          <div className="relatorio-detalhado">
            <RelatorioDetalhado 
              apartamento={filtros.apartamento}
              dataInicio={filtros.dataInicio}
              dataFim={filtros.dataFim}
              locacoes={locacoesPeriodo}
              despesas={despesasPeriodo}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              lucroLiquido={lucroLiquido}
              logoUrl={logoUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
};
