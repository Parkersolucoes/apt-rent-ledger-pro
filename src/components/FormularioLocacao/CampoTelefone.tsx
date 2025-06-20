
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CampoTelefoneProps {
  value: string;
  onChange: (value: string) => void;
}

export const CampoTelefone = ({ value, onChange }: CampoTelefoneProps) => {
  const formatTelefone = (input: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.substring(0, 11);
    
    // Aplica a formatação
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
    } else if (limited.length <= 11) {
      return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`;
    }
    
    return limited;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    onChange(formatted);
  };

  return (
    <div>
      <Label htmlFor="telefone" className="font-semibold text-white">Telefone</Label>
      <Input
        id="telefone"
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder="(00) 00000-0000"
        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
      />
    </div>
  );
};
