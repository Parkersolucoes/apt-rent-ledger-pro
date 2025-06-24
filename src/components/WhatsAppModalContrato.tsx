
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModelosMensagem } from '@/hooks/useModelosMensagem';
import { useApartamentos } from '@/hooks/useApartamentos';
import { Contrato } from '@/types/contrato';
import { Send } from 'lucide-react';

interface WhatsAppModalContratoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato;
  onEnviar: (telefone: string, mensagem: string) => void;
  enviando: boolean;
}

export const WhatsAppModalContrato = ({
  open,
  onOpenChange,
  contrato,
  onEnviar,
  enviando
}: WhatsAppModalContratoProps) => {
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  
  const { modelos, processarTemplate } = useModelosMensagem();
  const { apartamentos } = useApartamentos();

  const gerarVariaveisTemplate = () => {
    const apartamento = apartamentos.find(apt => apt.numero === contrato.apartamento_numero);
    
    return {
      nome_proprietario: contrato.proprietario_nome,
      apartamento: contrato.apartamento_numero || 'N/A',
      titulo_contrato: contrato.titulo,
      status_contrato: contrato.status,
      data_criacao: new Date(contrato.data_criacao).toLocaleDateString(),
      percentual_comissao: contrato.percentual_comissao?.toString() || '0',
      valor_mensal: contrato.valor_mensal?.toString() || '0',
      telefone_proprietario: apartamento?.telefoneProprietario || '',
      endereco_apartamento: apartamento?.endereco || ''
    };
  };

  const handleModeloChange = (modeloId: string) => {
    setModeloSelecionado(modeloId);
    const modelo = modelos.find(m => m.id === modeloId);
    if (modelo) {
      const variaveis = gerarVariaveisTemplate();
      const mensagemProcessada = processarTemplate(modelo.conteudo, variaveis);
      setMensagem(mensagemProcessada);
    }
  };

  const preencherTelefoneProprietario = () => {
    const apartamento = apartamentos.find(apt => apt.numero === contrato.apartamento_numero);
    if (apartamento?.telefoneProprietario) {
      setTelefone(apartamento.telefoneProprietario);
    }
  };

  const handleEnviar = () => {
    if (telefone.trim() && mensagem.trim()) {
      onEnviar(telefone, mensagem);
      onOpenChange(false);
      // Resetar formulário
      setTelefone('');
      setMensagem('');
      setModeloSelecionado('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Contrato por WhatsApp</DialogTitle>
          <DialogDescription>
            Envie o contrato "{contrato.titulo}" em PDF por WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Número do WhatsApp</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={preencherTelefoneProprietario}
                className="w-full"
              >
                Usar Tel. do Proprietário
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="modelo">Modelo de Mensagem (Opcional)</Label>
            <Select value={modeloSelecionado} onValueChange={handleModeloChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelos.map((modelo) => (
                  <SelectItem key={modelo.id} value={modelo.id}>
                    {modelo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={6}
              placeholder="Digite a mensagem que acompanhará o PDF..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Variáveis disponíveis: nome_proprietario, apartamento, titulo_contrato, status_contrato
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEnviar} disabled={enviando || !telefone.trim() || !mensagem.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {enviando ? 'Enviando...' : 'Enviar WhatsApp'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
