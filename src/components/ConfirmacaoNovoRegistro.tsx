
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ConfirmacaoNovoRegistroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  onNovoRegistro: () => void;
  onIrParaLista: () => void;
}

export const ConfirmacaoNovoRegistro = ({
  open,
  onOpenChange,
  titulo,
  descricao,
  onNovoRegistro,
  onIrParaLista
}: ConfirmacaoNovoRegistroProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <DialogTitle className="text-green-700">{titulo}</DialogTitle>
          </div>
          <DialogDescription className="text-center pt-4">
            {descricao}
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Deseja criar um novo registro?
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={onIrParaLista}
            className="w-full sm:w-auto"
          >
            Não, ir para lista
          </Button>
          <Button 
            onClick={onNovoRegistro}
            className="w-full sm:w-auto"
          >
            Sim, criar novo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
