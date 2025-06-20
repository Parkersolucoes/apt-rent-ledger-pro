
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDespesas } from '@/hooks/useDespesas';
import { useApartamentos } from '@/hooks/useApartamentos';
import { toast } from '@/hooks/use-toast';
import { parseDateInput } from '@/utils/formatters';

export const FormularioDespesa = () => {
  const { adicionarDespesa } = useDespesas();
  const { obterNumerosApartamentos } = useApartamentos();
  const [formData, setFormData] = useState({
    apartamento: '',
    valor: '',
    descricao: '',
    data: ''
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

  const handleCurrencyChange = (value: string) => {
    const formattedValue = formatCurrencyInput(value);
    setFormData(prev => ({
      ...prev,
      valor: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apartamento || !formData.valor || !formData.descricao || !formData.data) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const valorNum = parseCurrencyInput(formData.valor);
    
    if (valorNum <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    await adicionarDespesa({
      apartamento: formData.apartamento,
      valor: valorNum,
      descricao: formData.descricao,
      data: parseDateInput(formData.data)
    });

    toast({
      title: "Sucesso!",
      description: "Despesa cadastrada com sucesso.",
    });

    // Reset form
    setFormData({
      apartamento: '',
      valor: '',
      descricao: '',
      data: ''
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Nova Despesa</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="apartamento" className="font-semibold">Apartamento *</Label>
                <Select value={formData.apartamento} onValueChange={(value) => setFormData({...formData, apartamento: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um apartamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartamentosDisponiveis.map((numero) => (
                      <SelectItem key={numero} value={numero}>
                        Apartamento {numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor" className="font-semibold">Valor *</Label>
                <Input
                  id="valor"
                  type="text"
                  value={formData.valor}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  placeholder="0,00"
                  className="text-right"
                />
              </div>

              <div>
                <Label htmlFor="descricao" className="font-semibold">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição da despesa..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="data" className="font-semibold">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full font-semibold py-3 text-lg">
                Cadastrar Despesa
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
