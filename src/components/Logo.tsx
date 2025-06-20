
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Building } from 'lucide-react';

interface LogoProps {
  className?: string;
  showFallback?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo = ({ className = '', showFallback = true, size = 'md' }: LogoProps) => {
  const { logoUrl } = useConfiguracoes();

  const sizeClasses = {
    sm: 'h-6',
    md: 'h-10', 
    lg: 'h-14',
    xl: 'h-20'
  };

  if (logoUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src={logoUrl} 
          alt="Logo da empresa" 
          className={`${sizeClasses[size]} w-auto object-contain max-w-xs`}
        />
      </div>
    );
  }

  if (showFallback) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <span className="font-bold text-primary text-lg">Sistema de Locações</span>
      </div>
    );
  }

  return null;
};
