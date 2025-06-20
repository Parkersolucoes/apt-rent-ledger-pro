
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampoTelefone } from '@/components/CampoTelefone';
import { Send } from 'lucide-react';
import { FiltrosLocacao } from '@/types/locacao';
import { Apartamento } from '@/types/apartamento';
import { ModeloMensagem } from '@/types/modeloMensagem';

interface WhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: FiltrosLocacao;
  apartamentos: Apartamento[];
  modelos: ModeloMensagem[];
  onEnviar: (telefone: string, mensagem: string) => Promise<void>;
  onProcessarTemplate: (template: string, variaveis: Record<string, string>) => string;
  gerarVariaveisTemplate: () => Record<string, string>;
  enviando: boolean;
}

export const WhatsAppModal = ({
  open,
  onOpenChange,
  filtros,
  apartamentos,
  modelos,
  onEnviar,
  onProcessarTemplate,
  gerarVariaveisTemplate,
  enviando
}: WhatsAppModalProps) => {
  const [telefoneDestino, setTelefoneDestino] = useState('');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('');

  // Efeito para preencher automaticamente o telefone quando um apartamento for selecionado
  useEffect(() => {
    if (filtros.apartamento && open) {
      const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
      if (apartamento?.telefoneProprietario && !telefoneDestino) {
        setTelefoneDestino(apartamento.telefoneProprietario);
      }
    }
  }, [filtros.apartamento, open, apartamentos, telefoneDestino]);

  // Efeito para atualizar mensagem quando modelo for selecionado
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
  }, [modeloSelecionado, modelos, onProcessarTemplate, gerarVariaveisTemplate]);

  const preencherTelefoneProprietario = () => {
    if (filtros.apartamento) {
      const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
      if (apartamento?.telefoneProprietario) {
        setTelefoneDestino(apartamento.telefoneProprietario);
      }
    }
  };

  const handleEnviar = async () => {
    await onEnviar(telefoneDestino, mensagemPersonalizada);
    onOpenChange(false);
    setTelefoneDestino('');
    setMensagemPersonalizada('');
    setModeloSelecionado('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen) {
      // Resetar seleções ao abrir modal
      setModeloSelecionado('');
      setMensagemPersonalizada('');
      
      // Preencher automaticamente o telefone se um apartamento estiver selecionado
      if (filtros.apartamento) {
        const apartamento = apartamentos.find(apt => apt.numero === filtros.apartamento);
        if (apartamento?.telefoneProprietario) {
          setTelefoneDestino(apartamento.telefoneProprietario);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Relatório por WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="telefone">Número do WhatsApp</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={preencherTelefoneProprietario}
              >
                Usar telefone do proprietário
              </Button>
            </div>
            <CampoTelefone
              label=""
              value={telefoneDestino}
              onChange={setTelefoneDestino}
              placeholder="(00) 00000-0000"
              required
            />
            {filtros.apartamento && (
              <p className="text-sm text-muted-foreground">
                {apartamentos.find(apt => apt.numero === filtros.apartamento)?.telefoneProprietario
                  ? `Telefone do proprietário será preenchido automaticamente para o apartamento ${filtros.apartamento}`
                  : `Apartamento ${filtros.apartamento} não possui telefone do proprietário cadastrado`
                }
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
              rows={6}
            />
            {modeloSelecionado && modeloSelecionado !== 'personalizada' && (
              <p className="text-sm text-muted-foreground">
                Mensagem foi preenchida com base no modelo selecionado. Você pode editá-la se necessário.
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEnviar} disabled={enviando}>
              <Send className="h-4 w-4 mr-2" />
              {enviando ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
