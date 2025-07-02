import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { Trash2, Edit, Clock, Phone, Calendar, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface ListaAgendamentosProps {
  onEdit: () => void;
}

export const ListaAgendamentos = ({ onEdit }: ListaAgendamentosProps) => {
  const { agendamentos, loading, atualizarAgendamento, removerAgendamento } = useAgendamentos();

  const toggleStatus = async (id: string, status: boolean) => {
    await atualizarAgendamento(id, { status });
  };

  const formatarFrequencia = (frequencia: string) => {
    const map = {
      'diario': 'Diário',
      'semanal': 'Semanal', 
      'mensal': 'Mensal'
    };
    return map[frequencia as keyof typeof map] || frequencia;
  };

  const formatarTipoInformacao = (tipo: string) => {
    const map = {
      'entradas_saidas': 'Entradas e Saídas',
      'proximas_entradas': 'Próximas Entradas',
      'proximas_saidas': 'Próximas Saídas',
      'relatorio_semanal': 'Relatório Semanal'
    };
    return map[tipo as keyof typeof map] || tipo;
  };

  const formatarProximoEnvio = (data?: Date) => {
    if (!data) return 'Não agendado';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando agendamentos...</div>
        </CardContent>
      </Card>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum agendamento cadastrado ainda.</p>
            <Button onClick={onEdit} className="mt-4">
              Criar Primeiro Agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Agendamentos ({agendamentos.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {agendamentos.map((agendamento) => (
            <div
              key={agendamento.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{agendamento.nome}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatarFrequencia(agendamento.frequencia)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {agendamento.horario}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {agendamento.numero_whatsapp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={agendamento.status}
                    onCheckedChange={(checked) => toggleStatus(agendamento.id, checked)}
                  />
                  <Badge variant={agendamento.status ? "default" : "secondary"}>
                    {agendamento.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <MessageSquare className="h-4 w-4" />
                    Tipo de Informação
                  </div>
                  <div>{formatarTipoInformacao(agendamento.tipo_informacao)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Próximo Envio
                  </div>
                  <div>{formatarProximoEnvio(agendamento.proximo_envio)}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removerAgendamento(agendamento.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};