
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plus, List, MessageCircle } from 'lucide-react';

interface ConfirmacaoNovoRegistroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  onNovoRegistro: () => void;
  onIrParaLista: () => void;
  showWhatsAppButton?: boolean;
  onEnviarWhatsApp?: () => void;
}

export const ConfirmacaoNovoRegistro = ({
  open,
  onOpenChange,
  titulo,
  descricao,
  onNovoRegistro,
  onIrParaLista,
  showWhatsAppButton = false,
  onEnviarWhatsApp
}: ConfirmacaoNovoRegistroProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-green-800">
                {titulo}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-gray-600">{descricao}</p>
          
          <div className="space-y-3">
            {showWhatsAppButton && onEnviarWhatsApp && (
              <Button 
                onClick={onEnviarWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar confirmação via WhatsApp
              </Button>
            )}
            
            <Button 
              onClick={onNovoRegistro}
              variant="outline" 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Nova Locação
            </Button>
            
            <Button 
              onClick={onIrParaLista}
              variant="outline" 
              className="w-full"
            >
              <List className="h-4 w-4 mr-2" />
              Ver Lista de Locações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
