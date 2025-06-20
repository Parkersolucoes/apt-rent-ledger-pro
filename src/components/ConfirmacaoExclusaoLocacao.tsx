
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Locacao } from '@/types/locacao';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ConfirmacaoExclusaoLocacaoProps {
  locacao: Locacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ConfirmacaoExclusaoLocacao = ({ 
  locacao, 
  open, 
  onOpenChange, 
  onConfirm 
}: ConfirmacaoExclusaoLocacaoProps) => {
  if (!locacao) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta locação?
            <br />
            <br />
            <strong>Apartamento:</strong> {locacao.apartamento}
            <br />
            <strong>Hóspede:</strong> {locacao.hospede}
            <br />
            <strong>Período:</strong> {formatDate(locacao.dataEntrada)} - {formatDate(locacao.dataSaida)}
            <br />
            <strong>Valor:</strong> {formatCurrency(locacao.valorLocacao)}
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
