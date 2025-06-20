
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useConfiguracoes = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const carregarLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'logo_empresa')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar logo:', error);
        return;
      }

      if (data?.valor) {
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(data.valor);
        setLogoUrl(publicUrlData.publicUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
    }
  };

  const salvarLogo = async (file: File) => {
    setIsLoading(true);
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      // Fazer upload do arquivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Atualizar a configuração no banco
      const { error: updateError } = await supabase
        .from('configuracoes_sistema')
        .update({ valor: fileName })
        .eq('chave', 'logo_empresa');

      if (updateError) {
        throw updateError;
      }

      // Atualizar a URL da logo
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);
      
      setLogoUrl(publicUrlData.publicUrl);

      toast({
        title: "Sucesso!",
        description: "Logo da empresa salva com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar logo:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a logo da empresa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarLogo();
  }, []);

  return {
    logoUrl,
    salvarLogo,
    isLoading,
    recarregarLogo: carregarLogo
  };
};
