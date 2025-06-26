
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDisponibilidade } from '@/hooks/useDisponibilidade';
import { useApartamentos } from '@/hooks/useApartamentos';

interface NovaReservaModalProps {
  children?: React.ReactNode;
}

export const NovaReservaModal = ({ children }: NovaReservaModalProps) => {
  const [open, setOpen] = useState(false);
  const [apartamentoNumero, setApartamentoNumero] = useState('');
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [status, setStatus] = useState<'disponivel' | 'ocupado' | 'bloqueado' | 'manutencao'>('ocupado');
  const [hospede, setHospede] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const { criarDisponibilidade } = useDisponibilidade();
  const { apartamentos } = useApartamentos();

  const apartamentosAtivos = apartamentos.filter(apt => apt.ativo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apartamentoNumero || !dataInicio || !dataFim) {
      return;
    }

    try {
      await criarDisponibilidade.mutateAsync({
        apartamento_numero: apartamentoNumero,
        data_inicio: format(dataInicio, 'yyyy-MM-dd'),
        data_fim: format(dataFim, 'yyyy-MM-dd'),
        status,
        hospede: hospede || undefined,
        valor_diaria: valorDiaria ? parseFloat(valorDiaria) : undefined,
        observacoes: observacoes || undefined,
      });

      // Limpar formulário
      setApartamentoNumero('');
      setDataInicio(undefined);
      setDataFim(undefined);
      setStatus('ocupado');
      setHospede('');
      setValorDiaria('');
      setObservacoes('');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apartamento">Apartamento</Label>
            <Select value={apartamentoNumero} onValueChange={setApartamentoNumero} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um apartamento" />
              </SelectTrigger>
              <SelectContent>
                {apartamentosAtivos.map((apartamento) => (
                  <SelectItem key={apartamento.id} value={apartamento.numero}>
                    Apto {apartamento.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospede">Hóspede</Label>
            <Input
              id="hospede"
              value={hospede}
              onChange={(e) => setHospede(e.target.value)}
              placeholder="Nome do hóspede (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor Diária (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valorDiaria}
              onChange={(e) => setValorDiaria(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criarDisponibilidade.isPending}>
              {criarDisponibilidade.isPending ? 'Salvando...' : 'Salvar Reserva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
