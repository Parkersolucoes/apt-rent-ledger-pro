
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModelosMensagem } from '@/hooks/useModelosMensagem';
import { useApartamentos } from '@/hooks/useApartamentos';
import { useEmpresa } from '@/hooks/useEmpresa';
import { Contrato } from '@/types/contrato';
import { Send } from 'lucide-react';

interface EmailModalContratoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato;
  onEnviar: (email: string, assunto: string, mensagem: string) => void;
  enviando: boolean;
}

export const EmailModalContrato = ({
  open,
  onOpenChange,
  contrato,
  onEnviar,
  enviando
}: EmailModalContratoProps) => {
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState(`Contrato: ${contrato.titulo}`);
  const [mensagem, setMensagem] = useState('');
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  
  const { modelos, processarTemplate } = useModelosMensagem();
  const { apartamentos } = useApartamentos();
  const { empresa } = useEmpresa();

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
      endereco_apartamento: apartamento?.endereco || '',
      empresa_nome: empresa?.nome || '',
      empresa_cnpj: empresa?.cnpj || '',
      empresa_endereco: empresa?.endereco || '',
      empresa_telefone: empresa?.telefone || '',
      empresa_email: empresa?.email || '',
      empresa_responsavel: empresa?.responsavel || ''
    };
  };

  const handleModeloChange = async (modeloId: string) => {
    setModeloSelecionado(modeloId);
    const modelo = modelos.find(m => m.id === modeloId);
    if (modelo) {
      const variaveis = gerarVariaveisTemplate();
      const mensagemProcessada = await processarTemplate(modelo.conteudo, variaveis);
      setMensagem(mensagemProcessada);
    }
  };

  const preencherEmailProprietario = () => {
    // Since emailProprietario doesn't exist in Apartamento type, 
    // we'll use a placeholder or ask user to enter manually
    const apartamento = apartamentos.find(apt => apt.numero === contrato.apartamento_numero);
    if (apartamento?.proprietario) {
      // We can set a placeholder based on proprietario name
      setEmail(`${apartamento.proprietario.toLowerCase().replace(/\s+/g, '.')}@email.com`);
    }
  };

  const handleEnviar = () => {
    if (email.trim() && assunto.trim() && mensagem.trim()) {
      onEnviar(email, assunto, mensagem);
      onOpenChange(false);
      // Resetar formulário
      setEmail('');
      setAssunto(`Contrato: ${contrato.titulo}`);
      setMensagem('');
      setModeloSelecionado('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Contrato por E-mail</DialogTitle>
          <DialogDescription>
            Envie o contrato "{contrato.titulo}" em PDF por e-mail
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail do Destinatário</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={preencherEmailProprietario}
                className="w-full"
              >
                Sugerir E-mail do Proprietário
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Assunto do e-mail"
            />
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
              rows={8}
              placeholder="Digite a mensagem que acompanhará o PDF..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Variáveis disponíveis: nome_proprietario, apartamento, titulo_contrato, empresa_nome, empresa_responsavel
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEnviar} disabled={enviando || !email.trim() || !assunto.trim() || !mensagem.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {enviando ? 'Enviando...' : 'Enviar E-mail'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
