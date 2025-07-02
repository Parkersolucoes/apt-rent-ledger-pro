import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { FileText, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

export const LogsAgendamentos = () => {
  const { agendamentos, logs, carregarLogs } = useAgendamentos();
  const [filtroAgendamento, setFiltroAgendamento] = useState<string>('todos');
  const [filtroSucesso, setFiltroSucesso] = useState<string>('todos');

  useEffect(() => {
    carregarLogs();
  }, []);

  const logsFiltrados = logs.filter(log => {
    if (filtroAgendamento !== 'todos' && log.agendamento_id !== filtroAgendamento) {
      return false;
    }
    if (filtroSucesso !== 'todos') {
      const sucesso = filtroSucesso === 'sucesso';
      if (log.sucesso !== sucesso) {
        return false;
      }
    }
    return true;
  });

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const getAgendamentoNome = (agendamentoId: string) => {
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    return agendamento?.nome || 'Agendamento removido';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Logs de Envios
        </CardTitle>
        
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filtroAgendamento} onValueChange={setFiltroAgendamento}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Agendamentos</SelectItem>
                {agendamentos.map(agendamento => (
                  <SelectItem key={agendamento.id} value={agendamento.id}>
                    {agendamento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={filtroSucesso} onValueChange={setFiltroSucesso}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="sucesso">Sucesso</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => carregarLogs(filtroAgendamento === 'todos' ? undefined : filtroAgendamento)}
          >
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logsFiltrados.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum log encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logsFiltrados.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{getAgendamentoNome(log.agendamento_id)}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatarData(log.data_envio)}
                    </div>
                  </div>
                  <Badge variant={log.sucesso ? "default" : "destructive"}>
                    {log.sucesso ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {log.sucesso ? 'Sucesso' : 'Erro'}
                  </Badge>
                </div>

                {log.mensagem_enviada && (
                  <div className="p-3 bg-muted rounded text-sm">
                    <div className="font-medium mb-1">Mensagem Enviada:</div>
                    <div className="whitespace-pre-wrap">{log.mensagem_enviada}</div>
                  </div>
                )}

                {log.erro && (
                  <div className="p-3 bg-destructive/10 rounded text-sm">
                    <div className="font-medium mb-1 text-destructive">Erro:</div>
                    <div className="text-destructive">{log.erro}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};