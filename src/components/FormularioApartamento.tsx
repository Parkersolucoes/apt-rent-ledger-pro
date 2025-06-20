
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
import { CampoTelefone } from './CampoTelefone';
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
    telefoneProprietario: apartamento?.telefoneProprietario || '',
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
          telefoneProprietario: '',
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
    <Card className="w-full max-w-2xl mx-auto shadow-professional-lg border">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-xl">
          {apartamento ? 'Editar Apartamento' : 'Novo Apartamento'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-foreground font-medium">Número do Apartamento *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                placeholder="Ex: 101, 201A, etc."
                required
                className="border-input focus:border-primary bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proprietario" className="text-foreground font-medium">Proprietário</Label>
              <Input
                id="proprietario"
                value={formData.proprietario}
                onChange={(e) => setFormData(prev => ({ ...prev, proprietario: e.target.value }))}
                placeholder="Nome do proprietário"
                className="border-input focus:border-primary bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <CampoTelefone
              label="Telefone do Proprietário"
              value={formData.telefoneProprietario}
              onChange={(value) => setFormData(prev => ({ ...prev, telefoneProprietario: value }))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-foreground font-medium">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição do apartamento (quartos, banheiros, características, etc.)"
              rows={3}
              className="border-input focus:border-primary bg-background text-foreground"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
            />
            <Label htmlFor="ativo" className="text-foreground font-medium">Apartamento ativo</Label>
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
