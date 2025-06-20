
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampoTelefone } from '@/components/CampoTelefone';
import { Send } from 'lucide-react';
import { ModeloMensagem } from '@/types/modeloMensagem';
import { Locacao } from '@/types/locacao';
import { Apartamento } from '@/types/apartamento';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface WhatsAppModalLocacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locacao: Locacao | null;
  apartamentos: Apartamento[];
  modelos: ModeloMensagem[];
  onProcessarTemplate: (template: string, variaveis: Record<string, string>) => string;
  onEnviar: (telefone: string, mensagem: string) => Promise<void>;
  enviando: boolean;
}

export const WhatsAppModalLocacao = ({
  open,
  onOpenChange,
  locacao,
  apartamentos,
  modelos,
  onProcessarTemplate,
  onEnviar,
  enviando
}: WhatsAppModalLocacaoProps) => {
  const [telefoneDestino, setTelefoneDestino] = useState('');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('');

  // Preencher automaticamente o telefone do hóspede quando o modal abrir
  useEffect(() => {
    if (open && locacao?.telefone) {
      setTelefoneDestino(locacao.telefone);
    }
  }, [open, locacao]);

  // Gerar variáveis do template baseado na locação
  const gerarVariaveisTemplate = (): Record<string, string> => {
    if (!locacao) return {};

    const apartamento = apartamentos.find(apt => apt.numero === locacao.apartamento);
    const valorTotal = locacao.valorLocacao + locacao.taxaLimpeza;

    return {
      hospede: locacao.hospede || '',
      apartamento: locacao.apartamento || '',
      data_entrada: formatDate(locacao.dataEntrada),
      data_saida: formatDate(locacao.dataSaida),
      valor_total: formatCurrency(valorTotal),
      comissao_total: formatCurrency(locacao.comissao || 0),
      limpeza_total: formatCurrency(locacao.taxaLimpeza || 0),
      valor_proprietario: formatCurrency(locacao.valorProprietario || 0),
      descricao_apartamento: apartamento?.descricao || 'Apartamento confortável e bem localizado.',
      nome_proprietario: apartamento?.proprietario || ''
    };
  };

  // Atualizar mensagem quando modelo for selecionado
  useEffect(() => {
    if (modeloSelecionado && modeloSelecionado !== 'personalizada') {
      const modelo = modelos.find(m => m.id === modeloSelecionado);
      if (modelo) {
        const variaveis = gerarVariaveisTemplate();
        const mensagemProcessada = onProcessarTemplate(modelo.conteudo, variaveis);
        setMensagemPersonalizada(mensagemProcessada);
      }
    } else if (modeloSelecionado === 'personalizada') {
      setMensagemPersonalizada('');
    }
  }, [modeloSelecionado, modelos, onProcessarTemplate, locacao]);

  const handleEnviar = async () => {
    if (!mensagemPersonalizada.trim() || !telefoneDestino.trim()) return;
    
    await onEnviar(telefoneDestino, mensagemPersonalizada);
    onOpenChange(false);
    setTelefoneDestino('');
    setMensagemPersonalizada('');
    setModeloSelecionado('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setModeloSelecionado('');
      setMensagemPersonalizada('');
      setTelefoneDestino('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Confirmação por WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Número do WhatsApp</Label>
            <CampoTelefone
              label=""
              value={telefoneDestino}
              onChange={setTelefoneDestino}
              placeholder="(00) 00000-0000"
              required
            />
            {locacao?.telefone && (
              <p className="text-sm text-muted-foreground">
                Telefone do hóspede preenchido automaticamente
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo de Mensagem</Label>
            <Select value={modeloSelecionado} onValueChange={setModeloSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo ou escreva personalizada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personalizada">Mensagem Personalizada</SelectItem>
                {modelos.filter(m => m.ativo).map((modelo) => (
                  <SelectItem key={modelo.id} value={modelo.id}>
                    {modelo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagemPersonalizada}
              onChange={(e) => setMensagemPersonalizada(e.target.value)}
              placeholder="Digite uma mensagem personalizada ou selecione um modelo acima"
              rows={8}
            />
            {modeloSelecionado && modeloSelecionado !== 'personalizada' && (
              <p className="text-sm text-muted-foreground">
                Mensagem foi preenchida com base no modelo selecionado. Você pode editá-la se necessário.
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Pular
            </Button>
            <Button 
              onClick={handleEnviar} 
              disabled={enviando || !mensagemPersonalizada.trim() || !telefoneDestino.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {enviando ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
