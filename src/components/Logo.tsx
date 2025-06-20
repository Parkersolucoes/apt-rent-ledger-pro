
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Building } from 'lucide-react';

interface LogoProps {
  className?: string;
  showFallback?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', showFallback = true, size = 'md' }: LogoProps) => {
  const { logoUrl } = useConfiguracoes();

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12', 
    lg: 'h-16'
  };

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="Logo da empresa" 
        className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      />
    );
  }

  if (showFallback) {
    return (
      <div className={`${sizeClasses[size]} flex items-center gap-2 ${className}`}>
        <Building className="h-6 w-6 text-primary" />
        <span className="font-bold text-primary">Sistema de Locações</span>
      </div>
    );
  }

  return null;
};
