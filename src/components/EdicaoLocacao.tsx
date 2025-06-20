import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLocacoes } from '@/hooks/useLocacoes';
import { useApartamentos } from '@/hooks/useApartamentos';
import { parseDateInput, calcularComissao, formatDateForInput } from '@/utils/formatters';
import { toast } from '@/hooks/use-toast';
import { CamposBasicos } from './FormularioLocacao/CamposBasicos';
import { CamposDatas } from './FormularioLocacao/CamposDatas';
import { CamposValores } from './FormularioLocacao/CamposValores';
import { CamposPagamento } from './FormularioLocacao/CamposPagamento';
import { Locacao } from '@/types/locacao';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EdicaoLocacaoProps {
  locacao: Locacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EdicaoLocacao = ({ locacao, open, onOpenChange }: EdicaoLocacaoProps) => {
  const { atualizarLocacao } = useLocacoes();
  const { obterNumerosApartamentos } = useApartamentos();
  const [formData, setFormData] = useState({
    apartamento: '',
    hospede: '',
    telefone: '',
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

  useEffect(() => {
    if (locacao) {
      setFormData({
        apartamento: locacao.apartamento,
        hospede: locacao.hospede,
        telefone: locacao.telefone || '',
        dataEntrada: formatDateForInput(locacao.dataEntrada),
        dataSaida: formatDateForInput(locacao.dataSaida),
        valorLocacao: locacao.valorLocacao.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        primeiroPagamento: locacao.primeiroPagamento.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        primeiroPagamentoPago: locacao.primeiroPagamentoPago,
        primeiroPagamentoForma: locacao.primeiroPagamentoForma || 'Dinheiro',
        segundoPagamento: locacao.segundoPagamento.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        segundoPagamentoPago: locacao.segundoPagamentoPago,
        segundoPagamentoForma: locacao.segundoPagamentoForma || 'Dinheiro',
        taxaLimpeza: locacao.taxaLimpeza.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        proprietarioPago: !!locacao.dataPagamentoProprietario,
        dataPagamentoProprietario: locacao.dataPagamentoProprietario ? formatDateForInput(locacao.dataPagamentoProprietario) : '',
        observacoes: locacao.observacoes || ''
      });
    }
  }, [locacao]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locacao || !formData.apartamento || !formData.hospede || !formData.dataEntrada || !formData.dataSaida || !formData.valorLocacao) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const valorLocacao = parseCurrencyInput(formData.valorLocacao);
    const primeiroPagamento = parseCurrencyInput(formData.primeiroPagamento);
    const segundoPagamento = parseCurrencyInput(formData.segundoPagamento);
    const taxaLimpeza = parseCurrencyInput(formData.taxaLimpeza);
    
    const valorTotal = valorLocacao + taxaLimpeza;
    const valorFaltando = valorTotal - primeiroPagamento - segundoPagamento;
    const comissao = calcularComissao(valorLocacao, taxaLimpeza);

    // Calculate ano and mes from dataEntrada
    const dataEntrada = parseDateInput(formData.dataEntrada);
    const ano = dataEntrada.getFullYear();
    const mes = dataEntrada.getMonth() + 1;

    await atualizarLocacao(locacao.id, {
      apartamento: formData.apartamento,
      ano: ano,
      mes: mes,
      hospede: formData.hospede,
      telefone: formData.telefone || undefined,
      dataEntrada: dataEntrada,
      dataSaida: parseDateInput(formData.dataSaida),
      valorLocacao,
      primeiroPagamento,
      primeiroPagamentoPago: formData.primeiroPagamentoPago,
      primeiroPagamentoForma: formData.primeiroPagamentoForma,
      segundoPagamento,
      segundoPagamentoPago: formData.segundoPagamentoPago,
      segundoPagamentoForma: formData.segundoPagamentoForma,
      valorFaltando,
      taxaLimpeza,
      comissao,
      dataPagamentoProprietario: formData.dataPagamentoProprietario ? parseDateInput(formData.dataPagamentoProprietario) : undefined,
      observacoes: formData.observacoes || undefined
    });

    toast({
      title: "Sucesso!",
      description: "Locação atualizada com sucesso.",
    });

    onOpenChange(false);
  };

  if (!locacao) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Locação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <CamposBasicos
            apartamento={formData.apartamento}
            hospede={formData.hospede}
            telefone={formData.telefone}
            apartamentosDisponiveis={apartamentosDisponiveis}
            onApartamentoChange={(value) => setFormData({...formData, apartamento: value})}
            onHospedeChange={(value) => setFormData({...formData, hospede: value})}
            onTelefoneChange={(value) => setFormData({...formData, telefone: value})}
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

          <CamposPagamento
            proprietarioPago={formData.proprietarioPago}
            dataPagamentoProprietario={formData.dataPagamentoProprietario}
            onProprietarioPagoChange={(checked) => setFormData({...formData, proprietarioPago: checked})}
            onDataPagamentoProprietarioChange={(value) => setFormData({...formData, dataPagamentoProprietario: value})}
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

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="font-semibold">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
