
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLocacoes } from '@/hooks/useLocacoes';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useWebhook } from '@/hooks/useWebhook';
import { parseDateInput, calcularComissao, calcularValorProprietario } from '@/utils/formatters';
import { toast } from '@/hooks/use-toast';
import { CamposBasicos } from './FormularioLocacao/CamposBasicos';
import { CamposDatas } from './FormularioLocacao/CamposDatas';
import { CamposValores } from './FormularioLocacao/CamposValores';
import { CamposCalculados } from './FormularioLocacao/CamposCalculados';
import { CamposPagamento } from './FormularioLocacao/CamposPagamento';
import { ConfirmacaoNovoRegistro } from './ConfirmacaoNovoRegistro';

export const FormularioLocacao = () => {
  const { adicionarLocacao } = useLocacoes();
  const { obterNumerosApartamentos } = useApartamentos();
  const { sendLocacaoCriada } = useWebhook();
  const navigate = useNavigate();
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  
  const [formData, setFormData] = useState({
    apartamento: '',
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    hospede: '',
    dataEntrada: '',
    dataSaida: '',
    valorLocacao: '',
    primeiroPagamento: '',
    primeiroPagamentoPago: false,
    primeiroPagamentoForma: 'Dinheiro',
    segundoPagamento: '',
    segundoPagamentoPago: false,
    segundoPagamentoForma: 'Dinheiro',
    taxaLimpeza: '100,00',
    proprietarioPago: false,
    dataPagamentoProprietario: '',
    observacoes: ''
  });

  const apartamentosDisponiveis = obterNumerosApartamentos();

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrencyInput = (value: string) => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Cálculos automatizados
  const valorLocacao = parseCurrencyInput(formData.valorLocacao);
  const taxaLimpeza = parseCurrencyInput(formData.taxaLimpeza);
  const comissao = calcularComissao(valorLocacao, taxaLimpeza);
  const valorProprietario = calcularValorProprietario(valorLocacao, taxaLimpeza, comissao);

  const handleCurrencyChange = (field: string, value: string) => {
    const formattedValue = formatCurrencyInput(value);
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    if (field === 'primeiroPagamento') {
      const valorLocacao = parseCurrencyInput(formData.valorLocacao);
      const taxaLimpeza = parseCurrencyInput(formData.taxaLimpeza);
      const primeiroPagamento = parseCurrencyInput(formattedValue);
      const valorTotal = valorLocacao + taxaLimpeza;
      const segundoPagamento = Math.max(0, valorTotal - primeiroPagamento);
      
      setFormData(prev => ({
        ...prev,
        primeiroPagamento: formattedValue,
        segundoPagamento: segundoPagamento.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      apartamento: '',
      ano: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      hospede: '',
      dataEntrada: '',
      dataSaida: '',
      valorLocacao: '',
      primeiroPagamento: '',
      primeiroPagamentoPago: false,
      primeiroPagamentoForma: 'Dinheiro',
      segundoPagamento: '',
      segundoPagamentoPago: false,
      segundoPagamentoForma: 'Dinheiro',
      taxaLimpeza: '100,00',
      proprietarioPago: false,
      dataPagamentoProprietario: '',
      observacoes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apartamento || !formData.hospede || !formData.dataEntrada || !formData.dataSaida || !formData.valorLocacao) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const valorLocacaoNum = parseCurrencyInput(formData.valorLocacao);
    const primeiroPagamento = parseCurrencyInput(formData.primeiroPagamento);
    const segundoPagamento = parseCurrencyInput(formData.segundoPagamento);
    const taxaLimpezaNum = parseCurrencyInput(formData.taxaLimpeza);
    
    const valorTotal = valorLocacaoNum + taxaLimpezaNum;
    const valorFaltando = valorTotal - primeiroPagamento - segundoPagamento;
    const comissaoCalculada = calcularComissao(valorLocacaoNum, taxaLimpezaNum);
    const valorProprietarioCalculado = calcularValorProprietario(valorLocacaoNum, taxaLimpezaNum, comissaoCalculada);

    const novaLocacao = {
      apartamento: formData.apartamento,
      ano: formData.ano,
      mes: formData.mes,
      hospede: formData.hospede,
      dataEntrada: parseDateInput(formData.dataEntrada),
      dataSaida: parseDateInput(formData.dataSaida),
      valorLocacao: valorLocacaoNum,
      primeiroPagamento,
      primeiroPagamentoPago: formData.primeiroPagamentoPago,
      primeiroPagamentoForma: formData.primeiroPagamentoForma,
      segundoPagamento,
      segundoPagamentoPago: formData.segundoPagamentoPago,
      segundoPagamentoForma: formData.segundoPagamentoForma,
      valorFaltando,
      taxaLimpeza: taxaLimpezaNum,
      comissao: comissaoCalculada,
      valorProprietario: valorProprietarioCalculado,
      dataPagamentoProprietario: formData.dataPagamentoProprietario ? parseDateInput(formData.dataPagamentoProprietario) : undefined,
      observacoes: formData.observacoes || undefined
    };

    try {
      await adicionarLocacao(novaLocacao);

      // Enviar webhook de nova locação
      sendLocacaoCriada({
        ...novaLocacao,
        id: 'novo',
        createdAt: new Date()
      });

      // Mostrar diálogo de confirmação em vez de toast e reset direto
      setShowConfirmacao(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar a locação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleNovoRegistro = () => {
    setShowConfirmacao(false);
    resetForm();
    toast({
      title: "Pronto!",
      description: "Formulário limpo para nova locação.",
    });
  };

  const handleIrParaLista = () => {
    setShowConfirmacao(false);
    navigate('/locacoes');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Nova Locação</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CamposBasicos
                apartamento={formData.apartamento}
                ano={formData.ano}
                mes={formData.mes}
                hospede={formData.hospede}
                apartamentosDisponiveis={apartamentosDisponiveis}
                onApartamentoChange={(value) => setFormData({...formData, apartamento: value})}
                onAnoChange={(value) => setFormData({...formData, ano: value})}
                onMesChange={(value) => setFormData({...formData, mes: value})}
                onHospedeChange={(value) => setFormData({...formData, hospede: value})}
              />

              <CamposDatas
                dataEntrada={formData.dataEntrada}
                dataSaida={formData.dataSaida}
                onDataEntradaChange={(value) => setFormData({...formData, dataEntrada: value})}
                onDataSaidaChange={(value) => setFormData({...formData, dataSaida: value})}
              />

              <CamposValores
                valorLocacao={formData.valorLocacao}
                primeiroPagamento={formData.primeiroPagamento}
                primeiroPagamentoPago={formData.primeiroPagamentoPago}
                primeiroPagamentoForma={formData.primeiroPagamentoForma}
                segundoPagamento={formData.segundoPagamento}
                segundoPagamentoPago={formData.segundoPagamentoPago}
                segundoPagamentoForma={formData.segundoPagamentoForma}
                taxaLimpeza={formData.taxaLimpeza}
                onValorLocacaoChange={(value) => handleCurrencyChange('valorLocacao', value)}
                onPrimeiroPagamentoChange={(value) => handleCurrencyChange('primeiroPagamento', value)}
                onPrimeiroPagamentoPagoChange={(checked) => setFormData({...formData, primeiroPagamentoPago: checked})}
                onPrimeiroPagamentoFormaChange={(value) => setFormData({...formData, primeiroPagamentoForma: value})}
                onSegundoPagamentoPagoChange={(checked) => setFormData({...formData, segundoPagamentoPago: checked})}
                onSegundoPagamentoFormaChange={(value) => setFormData({...formData, segundoPagamentoForma: value})}
              />

              <CamposCalculados
                valorLocacao={formData.valorLocacao}
                taxaLimpeza={formData.taxaLimpeza}
                comissao={comissao}
                valorProprietario={valorProprietario}
              />

              <div>
                <Label htmlFor="observacoes" className="font-semibold">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <CamposPagamento
                proprietarioPago={formData.proprietarioPago}
                dataPagamentoProprietario={formData.dataPagamentoProprietario}
                onProprietarioPagoChange={(checked) => setFormData({...formData, proprietarioPago: checked})}
                onDataPagamentoProprietarioChange={(value) => setFormData({...formData, dataPagamentoProprietario: value})}
              />

              <Button type="submit" className="w-full font-semibold py-3 text-lg">
                Cadastrar Locação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmacaoNovoRegistro
        open={showConfirmacao}
        onOpenChange={setShowConfirmacao}
        titulo="Locação cadastrada com sucesso!"
        descricao="A locação foi salva no sistema e está disponível na lista de locações."
        onNovoRegistro={handleNovoRegistro}
        onIrParaLista={handleIrParaLista}
      />
    </div>
  );
};
