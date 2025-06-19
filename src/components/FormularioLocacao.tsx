import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    taxaLimpeza: '',
    dataPagamentoProprietario: '',
    observacoes: ''
  });

  const apartamentosDisponiveis = obterNumerosApartamentos();

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

    const valorLocacao = parseFloat(formData.valorLocacao);
    const primeiroPagamento = parseFloat(formData.primeiroPagamento) || 0;
    const segundoPagamento = parseFloat(formData.segundoPagamento) || 0;
    const taxaLimpeza = parseFloat(formData.taxaLimpeza) || 0;
    
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
      taxaLimpeza: '',
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
    <Card>
      <CardHeader>
        <CardTitle>Nova Locação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="apartamento">Apartamento *</Label>
              <Select value={formData.apartamento} onValueChange={(value) => setFormData({...formData, apartamento: value})}>
                <SelectTrigger>
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
              <Label htmlFor="ano">Ano *</Label>
              <Input
                id="ano"
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                min="2020"
                max="2030"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="mes">Mês *</Label>
              <Select value={formData.mes.toString()} onValueChange={(value) => setFormData({...formData, mes: parseInt(value)})}>
                <SelectTrigger>
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
            <Label htmlFor="hospede">Nome do Hóspede *</Label>
            <Input
              id="hospede"
              value={formData.hospede}
              onChange={(e) => setFormData({...formData, hospede: e.target.value})}
              placeholder="Nome completo do hóspede"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataEntrada">Data de Entrada *</Label>
              <Input
                id="dataEntrada"
                type="date"
                value={formData.dataEntrada}
                onChange={(e) => setFormData({...formData, dataEntrada: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dataSaida">Data de Saída *</Label>
              <Input
                id="dataSaida"
                type="date"
                value={formData.dataSaida}
                onChange={(e) => setFormData({...formData, dataSaida: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="valorLocacao">Valor da Locação (R$) *</Label>
              <Input
                id="valorLocacao"
                type="number"
                step="0.01"
                value={formData.valorLocacao}
                onChange={(e) => setFormData({...formData, valorLocacao: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="primeiroPagamento">1º Pagamento (R$)</Label>
              <Input
                id="primeiroPagamento"
                type="number"
                step="0.01"
                value={formData.primeiroPagamento}
                onChange={(e) => setFormData({...formData, primeiroPagamento: e.target.value})}
                placeholder="0,00"
              />
            </div>
            
            <div>
              <Label htmlFor="segundoPagamento">2º Pagamento (R$)</Label>
              <Input
                id="segundoPagamento"
                type="number"
                step="0.01"
                value={formData.segundoPagamento}
                onChange={(e) => setFormData({...formData, segundoPagamento: e.target.value})}
                placeholder="0,00"
              />
            </div>
            
            <div>
              <Label htmlFor="taxaLimpeza">Taxa de Limpeza (R$)</Label>
              <Input
                id="taxaLimpeza"
                type="number"
                step="0.01"
                value={formData.taxaLimpeza}
                onChange={(e) => setFormData({...formData, taxaLimpeza: e.target.value})}
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dataPagamentoProprietario">Data de Pagamento ao Proprietário</Label>
            <Input
              id="dataPagamentoProprietario"
              type="date"
              value={formData.dataPagamentoProprietario}
              onChange={(e) => setFormData({...formData, dataPagamentoProprietario: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Cadastrar Locação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
