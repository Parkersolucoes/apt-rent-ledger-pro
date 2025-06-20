
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, getMesNome } from '@/utils/formatters';
import { Locacao } from '@/types/locacao';
import { Calendar, House, User, Flag, Edit, Trash2 } from 'lucide-react';

interface ListagemLocacoesProps {
  locacoesFiltradas: Locacao[];
  onEditar: (locacao: Locacao) => void;
  onExcluir: (locacao: Locacao) => void;
}

export const ListagemLocacoes = ({ 
  locacoesFiltradas, 
  onEditar, 
  onExcluir 
}: ListagemLocacoesProps) => {
  return (
    <Card className="shadow-professional-lg">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>Locações ({locacoesFiltradas.length})</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            Total: {formatCurrency(locacoesFiltradas.reduce((acc, loc) => acc + loc.valorLocacao, 0))}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {locacoesFiltradas.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma locação encontrada com os filtros aplicados.
          </p>
        ) : (
          <div className="space-y-4">
            {locacoesFiltradas.map((locacao) => (
              <div
                key={locacao.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                  locacao.dataPagamentoProprietario 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <House className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{locacao.apartamento}</span>
                      <Badge variant="outline" className="border-primary text-primary">
                        {getMesNome(locacao.mes)} {locacao.ano}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-foreground">{locacao.hospede}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(locacao.dataEntrada)} - {formatDate(locacao.dataSaida)}
                      </span>
                    </div>
                    
                    {locacao.observacoes && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {locacao.observacoes}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Locação:</span>
                        <span className="font-medium text-foreground">{formatCurrency(locacao.valorLocacao)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Taxa Limpeza:</span>
                        <span className="font-medium text-foreground">{formatCurrency(locacao.taxaLimpeza)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>1º Pagto:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-green-600">{formatCurrency(locacao.primeiroPagamento)}</span>
                          {locacao.primeiroPagamentoPago && (
                            <Flag className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>2º Pagto:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-green-600">{formatCurrency(locacao.segundoPagamento)}</span>
                          {locacao.segundoPagamentoPago && (
                            <Flag className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Faltando:</span>
                        <span className={`font-medium ${locacao.valorFaltando > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(locacao.valorFaltando)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Comissão:</span>
                        <span className="font-medium text-primary">{formatCurrency(locacao.comissao)}</span>
                      </div>
                    </div>
                    
                    {locacao.dataPagamentoProprietario && (
                      <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm">
                        <span className="text-green-800">
                          Pago ao proprietário em: {formatDate(locacao.dataPagamentoProprietario)}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditar(locacao)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onExcluir(locacao)}
                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
