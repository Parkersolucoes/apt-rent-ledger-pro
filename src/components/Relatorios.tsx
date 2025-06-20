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

  const exportarPDF = () => {
    // Aplicar estilos específicos para impressão
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .relatorio-impressao, .relatorio-impressao * { visibility: visible; }
        .relatorio-impressao { position: absolute; left: 0; top: 0; width: 100%; }
        @page { size: A4; margin: 1cm; }
      }
    `;
    document.head.appendChild(style);
    
    // Adicionar classe para impressão
    const relatorioElement = document.querySelector('.relatorio-detalhado');
    if (relatorioElement) {
      relatorioElement.classList.add('relatorio-impressao');
    }
    
    window.print();
    
    // Remover estilos após impressão
    setTimeout(() => {
      document.head.removeChild(style);
      if (relatorioElement) {
        relatorioElement.classList.remove('relatorio-impressao');
      }
    }, 1000);
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
