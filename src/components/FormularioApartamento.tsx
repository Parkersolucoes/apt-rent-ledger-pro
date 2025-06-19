
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
    endereco: apartamento?.endereco || '',
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
          endereco: '',
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {apartamento ? 'Editar Apartamento' : 'Novo Apartamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número do Apartamento *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                placeholder="Ex: 101, 201A, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proprietario">Proprietário</Label>
              <Input
                id="proprietario"
                value={formData.proprietario}
                onChange={(e) => setFormData(prev => ({ ...prev, proprietario: e.target.value }))}
                placeholder="Nome do proprietário"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Endereço completo do apartamento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do apartamento (quartos, banheiros, características, etc.)"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
            />
            <Label htmlFor="ativo">Apartamento ativo</Label>
          </div>

          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {apartamento ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
