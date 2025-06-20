
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useToast } from '@/hooks/use-toast';
import { Apartamento } from '@/types/apartamento';
import { Save, X } from 'lucide-react';

interface FormularioApartamentoProps {
  apartamento?: Apartamento;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FormularioApartamento = ({ apartamento, onSuccess, onCancel }: FormularioApartamentoProps) => {
  const { adicionarApartamento, atualizarApartamento } = useApartamentos();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    numero: apartamento?.numero || '',
    descricao: apartamento?.descricao || '',
    proprietario: apartamento?.proprietario || '',
    ativo: apartamento?.ativo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      toast({
        title: "Erro",
        description: "O número do apartamento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (apartamento) {
        atualizarApartamento(apartamento.id, formData);
        toast({
          title: "Sucesso",
          description: "Apartamento atualizado com sucesso!",
        });
      } else {
        adicionarApartamento(formData);
        toast({
          title: "Sucesso",
          description: "Apartamento cadastrado com sucesso!",
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        // Limpar formulário se não há callback
        setFormData({
          numero: '',
          descricao: '',
          proprietario: '',
          ativo: true
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar apartamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-slate-800/95 backdrop-blur-sm border border-slate-600">
      <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
        <CardTitle className="text-xl text-blue-50">
          {apartamento ? 'Editar Apartamento' : 'Novo Apartamento'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-slate-200">Número do Apartamento *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                placeholder="Ex: 101, 201A, etc."
                required
                className="border-slate-600 focus:border-blue-500 bg-slate-700 text-slate-200 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proprietario" className="text-slate-200">Proprietário</Label>
              <Input
                id="proprietario"
                value={formData.proprietario}
                onChange={(e) => setFormData(prev => ({ ...prev, proprietario: e.target.value }))}
                placeholder="Nome do proprietário"
                className="border-slate-600 focus:border-blue-500 bg-slate-700 text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-slate-200">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do apartamento (quartos, banheiros, características, etc.)"
              rows={3}
              className="border-slate-600 focus:border-blue-500 bg-slate-700 text-slate-200 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
            />
            <Label htmlFor="ativo" className="text-slate-200">Apartamento ativo</Label>
          </div>

          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="border-slate-500 bg-slate-600 text-slate-200 hover:bg-slate-500">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button type="submit" className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900">
              <Save className="h-4 w-4 mr-2" />
              {apartamento ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
