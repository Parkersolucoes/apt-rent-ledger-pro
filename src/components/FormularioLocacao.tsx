
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocacoes } from '@/hooks/useLocacoes';
import { useApartamentos } from '@/hooks/useApartamentos';
import { formatDateInput, parseDateInput, calcularComissao } from '@/utils/formatters';
import { toast } from '@/hooks/use-toast';

export const FormularioLocacao = () => {
  const { adicionarLocacao } = useLocacoes();
  const { obterNumerosApartamentos } = useApartamentos();
  const [formData, setFormData] = useState({
    apartamento: '',
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    hospede: '',
    dataEntrada: '',
    dataSaida: '',
    valorLocacao: '',
    primeiroPagamento: '',
    segundoPagamento: '',
    taxaLimpeza: '100.00',
    proprietarioPago: false,
    dataPagamentoProprietario: '',
    observacoes: ''
  });

  const apartamentosDisponiveis = obterNumerosApartamentos();

  const formatCurrencyInput = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    // Converte para centavos
    const amount = parseFloat(numbers) / 100;
    // Formata para moeda brasileira
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrencyInput = (value: string) => {
    // Remove formatação e converte para número
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleCurrencyChange = (field: string, value: string) => {
    const formattedValue = formatCurrencyInput(value);
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Calcular segundo pagamento automaticamente quando sair do primeiro pagamento
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apartamento || !formData.hospede || !formData.dataEntrada || !formData.dataSaida || !formData.valorLocacao) {
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
    const comissao = calcularComissao(valorTotal);

    adicionarLocacao({
      apartamento: formData.apartamento,
      ano: formData.ano,
      mes: formData.mes,
      hospede: formData.hospede,
      dataEntrada: parseDateInput(formData.dataEntrada),
      dataSaida: parseDateInput(formData.dataSaida),
      valorLocacao,
      primeiroPagamento,
      segundoPagamento,
      valorFaltando,
      taxaLimpeza,
      comissao,
      dataPagamentoProprietario: formData.dataPagamentoProprietario ? parseDateInput(formData.dataPagamentoProprietario) : undefined,
      observacoes: formData.observacoes || undefined
    });

    toast({
      title: "Sucesso!",
      description: "Locação cadastrada com sucesso.",
    });

    // Reset form
    setFormData({
      apartamento: '',
      ano: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      hospede: '',
      dataEntrada: '',
      dataSaida: '',
      valorLocacao: '',
      primeiroPagamento: '',
      segundoPagamento: '',
      taxaLimpeza: '100,00',
      proprietarioPago: false,
      dataPagamentoProprietario: '',
      observacoes: ''
    });
  };

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Nova Locação</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="apartamento" className="text-blue-800 font-semibold">Apartamento *</Label>
                  <Select value={formData.apartamento} onValueChange={(value) => setFormData({...formData, apartamento: value})}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500">
                      <SelectValue placeholder="Selecione um apartamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartamentosDisponiveis.map((numero) => (
                        <SelectItem key={numero} value={numero}>
                          {numero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ano" className="text-blue-800 font-semibold">Ano *</Label>
                  <Input
                    id="ano"
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                    min="2020"
                    max="2030"
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="mes" className="text-blue-800 font-semibold">Mês *</Label>
                  <Select value={formData.mes.toString()} onValueChange={(value) => setFormData({...formData, mes: parseInt(value)})}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((mes) => (
                        <SelectItem key={mes.value} value={mes.value.toString()}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="hospede" className="text-blue-800 font-semibold">Nome do Hóspede *</Label>
                <Input
                  id="hospede"
                  value={formData.hospede}
                  onChange={(e) => setFormData({...formData, hospede: e.target.value})}
                  placeholder="Nome completo do hóspede"
                  className="border-blue-200 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataEntrada" className="text-blue-800 font-semibold">Data de Entrada *</Label>
                  <Input
                    id="dataEntrada"
                    type="date"
                    value={formData.dataEntrada}
                    onChange={(e) => setFormData({...formData, dataEntrada: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dataSaida" className="text-blue-800 font-semibold">Data de Saída *</Label>
                  <Input
                    id="dataSaida"
                    type="date"
                    value={formData.dataSaida}
                    onChange={(e) => setFormData({...formData, dataSaida: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="valorLocacao" className="text-blue-800 font-semibold">Valor da Locação *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-blue-600 font-semibold">R$</span>
                    <Input
                      id="valorLocacao"
                      value={formData.valorLocacao}
                      onChange={(e) => handleCurrencyChange('valorLocacao', e.target.value)}
                      placeholder="0,00"
                      className="border-blue-200 focus:border-blue-500 pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="primeiroPagamento" className="text-blue-800 font-semibold">1º Pagamento</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-blue-600 font-semibold">R$</span>
                    <Input
                      id="primeiroPagamento"
                      value={formData.primeiroPagamento}
                      onChange={(e) => handleCurrencyChange('primeiroPagamento', e.target.value)}
                      placeholder="0,00"
                      className="border-blue-200 focus:border-blue-500 pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="segundoPagamento" className="text-blue-800 font-semibold">2º Pagamento (Calculado)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-blue-600 font-semibold">R$</span>
                    <Input
                      id="segundoPagamento"
                      value={formData.segundoPagamento}
                      readOnly
                      className="border-blue-200 bg-blue-50 pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="taxaLimpeza" className="text-blue-800 font-semibold">Taxa de Limpeza (Fixo)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-blue-600 font-semibold">R$</span>
                    <Input
                      id="taxaLimpeza"
                      value={formData.taxaLimpeza}
                      readOnly
                      className="border-blue-200 bg-blue-50 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="proprietarioPago"
                    checked={formData.proprietarioPago}
                    onCheckedChange={(checked) => setFormData({...formData, proprietarioPago: !!checked})}
                  />
                  <Label htmlFor="proprietarioPago" className="text-blue-800 font-semibold">
                    Proprietário Pago
                  </Label>
                </div>

                <div>
                  <Label htmlFor="dataPagamentoProprietario" className="text-blue-800 font-semibold">Data de Pagamento ao Proprietário</Label>
                  <Input
                    id="dataPagamentoProprietario"
                    type="date"
                    value={formData.dataPagamentoProprietario}
                    onChange={(e) => setFormData({...formData, dataPagamentoProprietario: e.target.value})}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-blue-800 font-semibold">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações adicionais..."
                  rows={3}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 text-lg shadow-lg">
                Cadastrar Locação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
