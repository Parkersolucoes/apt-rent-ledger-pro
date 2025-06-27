
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plus, List, MessageCircle, CreditCard } from 'lucide-react';

interface ConfirmacaoNovoRegistroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  onNovoRegistro: () => void;
  onIrParaLista: () => void;
  showWhatsAppButton?: boolean;
  onEnviarWhatsApp?: () => void;
  showLinkPagamentoButton?: boolean;
  onGerarLinkPagamento?: () => void;
}

export const ConfirmacaoNovoRegistro = ({ 
  open, 
  onOpenChange, 
  titulo, 
  descricao, 
  onNovoRegistro, 
  onIrParaLista,
  showWhatsAppButton = false,
  onEnviarWhatsApp,
  showLinkPagamentoButton = false,
  onGerarLinkPagamento
}: ConfirmacaoNovoRegistroProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl">{titulo}</DialogTitle>
          <DialogDescription className="text-base">
            {descricao}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          {showWhatsAppButton && onEnviarWhatsApp && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onEnviarWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </Button>
          )}
          {showLinkPagamentoButton && onGerarLinkPagamento && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onGerarLinkPagamento}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Gerar Link de Pagamento
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onNovoRegistro}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
          <Button 
            className="w-full"
            onClick={onIrParaLista}
          >
            <List className="h-4 w-4 mr-2" />
            Ver Lista
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
