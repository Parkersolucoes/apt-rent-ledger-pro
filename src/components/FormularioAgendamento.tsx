import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Clock, Phone, Calendar, MessageSquare } from 'lucide-react';

interface FormularioAgendamentoProps {
  onSuccess: () => void;
}

export const FormularioAgendamento = ({ onSuccess }: FormularioAgendamentoProps) => {
  const { adicionarAgendamento } = useAgendamentos();
  const { configuracoes } = useConfiguracoes();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    frequencia: 'diario' as const,
    horario: '08:00',
    numero_whatsapp: configuracoes.whatsapp_agendamentos || '',
    tipo_informacao: 'entradas_saidas' as const,
    status: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.horario || !formData.numero_whatsapp) {
      return;
    }

    setLoading(true);
    try {
      // Calcular próximo envio baseado na frequência e horário
      const agora = new Date();
      const proximoEnvio = new Date();
      const [horas, minutos] = formData.horario.split(':').map(Number);
      
      proximoEnvio.setHours(horas, minutos, 0, 0);
      
      // Se o horário já passou hoje, agendar para amanhã
      if (proximoEnvio <= agora) {
        proximoEnvio.setDate(proximoEnvio.getDate() + 1);
      }

      await adicionarAgendamento({
        ...formData,
        proximo_envio: proximoEnvio
      });

      // Reset form
      setFormData({
        nome: '',
        frequencia: 'diario',
        horario: '08:00',
        numero_whatsapp: configuracoes.whatsapp_agendamentos || '',
        tipo_informacao: 'entradas_saidas',
        status: true
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Novo Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Agendamento</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Relatório Diário de Check-ins"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select 
                value={formData.frequencia} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequencia: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">
                <Clock className="h-4 w-4 inline mr-1" />
                Horário
              </Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario}
                onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_whatsapp">
              <Phone className="h-4 w-4 inline mr-1" />
              Número WhatsApp
            </Label>
            <Input
              id="numero_whatsapp"
              value={formData.numero_whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_whatsapp: e.target.value }))}
              placeholder="5511999999999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Tipo de Informação
            </Label>
            <Select 
              value={formData.tipo_informacao} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_informacao: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entradas_saidas">Entradas e Saídas do Dia</SelectItem>
                <SelectItem value="proximas_entradas">Próximas Entradas</SelectItem>
                <SelectItem value="proximas_saidas">Próximas Saídas</SelectItem>
                <SelectItem value="relatorio_semanal">Relatório Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
            />
            <Label htmlFor="status">Agendamento Ativo</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Agendamento'}
            </Button>
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};