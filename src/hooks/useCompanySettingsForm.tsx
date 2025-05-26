
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from '@/hooks/useAppSettings';

interface CompanyData {
  name: string;
  address: string;
  phone: string;
  email: string;
  document: string;
  logo?: string;
  footer: string;
}

export const useCompanySettingsForm = () => {
  const { toast } = useToast();
  const { settings, updateSettings, isLoading } = useAppSettings();

  const [companyData, setCompanyData] = useState<CompanyData>(
    settings?.company || {
      name: '',
      address: '',
      phone: '',
      email: '',
      document: '',
      logo: '',
      footer: 'Para qualquer suporte: (11) 9999-8888'
    }
  );
  
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings?.company) {
      console.log('Updating company data from settings:', settings.company);
      setCompanyData(settings.company);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Field changed:', name, value);
    setCompanyData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, starting save process...');
    setIsSaving(true);

    try {
      console.log('Saving company data:', companyData);
      
      if (!updateSettings) {
        console.error('updateSettings function not available');
        throw new Error('Função updateSettings não disponível');
      }
      
      const result = await updateSettings({ company: companyData });
      console.log('Save result:', result);
      
      toast({
        title: "Dados salvos com sucesso",
        description: "Os dados da empresa foram atualizados."
      });
    } catch (error) {
      console.error('Error saving company data:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os dados da empresa."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    companyData,
    isSaving,
    isLoading,
    handleChange,
    handleSubmit,
    settings,
    updateSettings
  };
};
