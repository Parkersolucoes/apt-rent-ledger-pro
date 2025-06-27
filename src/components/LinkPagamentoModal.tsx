
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Locacao } from '@/types/locacao';

interface LinkPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locacao: Locacao | null;
}

export const LinkPagamentoModal = ({
  open,
  onOpenChange,
  locacao
}: LinkPagamentoModalProps) => {
  const [valor, setValor] = useState('');
  const [linkGerado, setLinkGerado] = useState('');
  const [gerando, setGerando] = useState(false);
  const { configuracoes } = useConfiguracoes();

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrencyInput = (value: string) => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleValorChange = (value: string) => {
    const formattedValue = formatCurrencyInput(value);
    setValor(formattedValue);
  };

  const gerarLinkPagamento = async () => {
    if (!valor || parseCurrencyInput(valor) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido",
        variant: "destructive"
      });
      return;
    }

    if (!configuracoes.mercadopago_access_token) {
      toast({
        title: "Configuração Incompleta",
        description: "Configure as credenciais do Mercado Pago nas configurações do sistema",
        variant: "destructive"
      });
      return;
    }

    setGerando(true);
    try {
      const valorNum = parseCurrencyInput(valor);
      
      const preferenceData = {
        items: [
          {
            title: `Locação - ${locacao?.hospede || 'Hóspede'} - Apto ${locacao?.apartamento || ''}`,
            unit_price: valorNum,
            quantity: 1
          }
        ],
        payer: {
          name: locacao?.hospede || 'Hóspede',
          phone: {
            number: locacao?.telefone?.replace(/\D/g, '') || ''
          }
        },
        back_urls: {
          success: `${window.location.origin}/pagamento-sucesso`,
          failure: `${window.location.origin}/pagamento-falha`,
          pending: `${window.location.origin}/pagamento-pendente`
        },
        auto_return: "approved"
      };

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${configuracoes.mercadopago_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar link de pagamento');
      }

      const data = await response.json();
      setLinkGerado(data.init_point);

      toast({
        title: "Sucesso!",
        description: "Link de pagamento gerado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar link de pagamento. Verifique as configurações.",
        variant: "destructive"
      });
    } finally {
      setGerando(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGerado);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência",
    });
  };

  const abrirLink = () => {
    window.open(linkGerado, '_blank');
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setValor('');
      setLinkGerado('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gerar Link de Pagamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {locacao && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">Locação: {locacao.hospede}</p>
              <p className="text-sm text-muted-foreground">Apartamento: {locacao.apartamento}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="valor">Valor do Pagamento</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="valor"
                value={valor}
                onChange={(e) => handleValorChange(e.target.value)}
                placeholder="0,00"
                className="pl-8"
              />
            </div>
          </div>

          {linkGerado && (
            <div className="space-y-2">
              <Label>Link de Pagamento Gerado</Label>
              <div className="bg-muted p-3 rounded-lg break-all text-sm">
                {linkGerado}
              </div>
              <div className="flex gap-2">
                <Button onClick={copiarLink} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button onClick={abrirLink} variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button 
              onClick={gerarLinkPagamento} 
              disabled={gerando || !valor}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {gerando ? 'Gerando...' : 'Gerar Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
