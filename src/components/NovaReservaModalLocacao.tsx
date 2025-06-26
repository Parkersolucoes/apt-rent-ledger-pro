
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FormularioLocacao } from './FormularioLocacao';

interface NovaReservaModalLocacaoProps {
  children?: React.ReactNode;
}

export const NovaReservaModalLocacao = ({ children }: NovaReservaModalLocacaoProps) => {
  const [open, setOpen] = useState(false);

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
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <FormularioLocacao />
        </div>
      </DialogContent>
    </Dialog>
  );
};
