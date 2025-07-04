
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CampoTelefoneProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const CampoTelefone = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "(00) 00000-0000",
  required = false 
}: CampoTelefoneProps) => {
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
      <Label htmlFor="telefone" className="font-medium text-foreground">
        {label} {required && '*'}
      </Label>
      <Input
        id="telefone"
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="border-input focus:border-primary bg-background text-foreground"
      />
    </div>
  );
};
