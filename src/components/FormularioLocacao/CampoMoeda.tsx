
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CampoMoedaProps {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
}

export const CampoMoeda = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder = "0,00", 
  required = false,
  readOnly = false,
  className = ""
}: CampoMoedaProps) => {
  const formatCurrencyInput = (inputValue: string) => {
    const numbers = inputValue.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !readOnly) {
      const formattedValue = formatCurrencyInput(e.target.value);
      onChange(formattedValue);
    }
  };

  return (
    <div>
      <Label htmlFor={id} className="text-slate-200 font-semibold">
        {label} {required && '*'}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-blue-400 font-semibold">R$</span>
        <Input
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`border-slate-600 focus:border-blue-500 pl-10 bg-slate-700 text-slate-200 ${readOnly ? 'bg-slate-600' : ''} ${className}`}
          required={required}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};
