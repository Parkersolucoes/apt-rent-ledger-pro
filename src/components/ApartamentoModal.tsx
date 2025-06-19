
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLocacoes } from '@/hooks/useLocacoes';
import { formatCurrency, formatDate, getMesNome } from '@/utils/formatters';
import { Calendar, User, Wallet } from 'lucide-react';

interface ApartamentoModalProps {
  apartamento: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApartamentoModal = ({ apartamento, open, onOpenChange }: ApartamentoModalProps) => {
  const { locacoes } = useLocacoes();

  if (!apartamento) return null;

  const locacoesApartamento = locacoes.filter(loc => loc.apartamento === apartamento);
  const totalFaturamento = locacoesApartamento.reduce((acc, loc) => acc + loc.valorLocacao, 0);
  const totalComissao = locacoesApartamento.reduce((acc, loc) => acc + loc.comissao, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Apartamento {apartamento}</span>
            <Badge variant="secondary">
              {locacoesApartamento.length} locações
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total de Locações</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {locacoesApartamento.length}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Faturamento</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(totalFaturamento)}
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">Comissões</span>
              </div>
              <div className="text-2xl font-bold text-teal-900">
                {formatCurrency(totalComissao)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Histórico de Locações</h3>
            {locacoesApartamento.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma locação encontrada para este apartamento.
              </p>
            ) : (
              <div className="space-y-3">
                {locacoesApartamento
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((locacao) => (
                    <div
                      key={locacao.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span className="font-semibold">{locacao.hospede}</span>
                            <Badge variant="outline">
                              {getMesNome(locacao.mes)} {locacao.ano}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">
                              {formatDate(locacao.dataEntrada)} - {formatDate(locacao.dataSaida)}
                            </span>
                          </div>
                          
                          {locacao.observacoes && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {locacao.observacoes}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span>Locação:</span>
                              <span className="font-medium">{formatCurrency(locacao.valorLocacao)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxa Limpeza:</span>
                              <span className="font-medium">{formatCurrency(locacao.taxaLimpeza)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>1º Pagto:</span>
                              <span className="font-medium text-green-600">{formatCurrency(locacao.primeiroPagamento)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2º Pagto:</span>
                              <span className="font-medium text-green-600">{formatCurrency(locacao.segundoPagamento)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Faltando:</span>
                              <span className={`font-medium ${locacao.valorFaltando > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(locacao.valorFaltando)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Comissão:</span>
                              <span className="font-medium text-blue-600">{formatCurrency(locacao.comissao)}</span>
                            </div>
                          </div>
                          
                          {locacao.dataPagamentoProprietario && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                              <span className="text-green-700">
                                Pago ao proprietário em: {formatDate(locacao.dataPagamentoProprietario)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
