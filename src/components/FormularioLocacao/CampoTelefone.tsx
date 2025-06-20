
import { CampoTelefone as CampoTelefoneBase } from '../CampoTelefone';

interface CampoTelefoneProps {
  value: string;
  onChange: (value: string) => void;
}

export const CampoTelefone = ({ value, onChange }: CampoTelefoneProps) => {
  return (
    <CampoTelefoneBase
      label="Telefone"
      value={value}
      onChange={onChange}
      placeholder="(00) 00000-0000"
    />
  );
};
