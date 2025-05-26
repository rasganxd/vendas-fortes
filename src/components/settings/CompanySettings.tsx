
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building } from "lucide-react";
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

export default function CompanySettings() {
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
  React.useEffect(() => {
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
        description: "Ocorreu um erro ao salvar os dados da empresa."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Carregando configurações...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('Rendering CompanySettings with:', { settings, updateSettings: !!updateSettings, companyData });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-gray-500" />
          <div>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>
              Configure os dados da empresa para impressão em pedidos, boletos e notas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                name="name"
                value={companyData.name}
                onChange={handleChange}
                placeholder="Nome da sua empresa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CNPJ</Label>
              <Input
                id="document"
                name="document"
                value={companyData.document}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              value={companyData.address}
              onChange={handleChange}
              placeholder="Endereço completo"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={companyData.phone}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={companyData.email}
                onChange={handleChange}
                placeholder="contato@suaempresa.com.br"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer">Texto de Rodapé para Impressão</Label>
            <Textarea
              id="footer"
              name="footer"
              value={companyData.footer}
              onChange={handleChange}
              placeholder="Texto que aparecerá no rodapé de documentos impressos"
              className="h-20"
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-sales-800 hover:bg-sales-700"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar dados da empresa"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
