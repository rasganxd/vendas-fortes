
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import { useCompanySettingsForm } from '@/hooks/useCompanySettingsForm';
import { CompanyBasicInfo } from './CompanyBasicInfo';
import { CompanyFooterSection } from './CompanyFooterSection';
import { CompanyFormActions } from './CompanyFormActions';

export default function CompanySettings() {
  const {
    companyData,
    isSaving,
    isLoading,
    handleChange,
    handleSubmit,
    settings,
    updateSettings
  } = useCompanySettingsForm();

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

  console.log('Rendering CompanySettings with:', { 
    settings: settings?.id ? 'loaded' : 'not loaded', 
    updateSettings: !!updateSettings, 
    companyData: companyData.name ? 'has data' : 'empty' 
  });

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
          <CompanyBasicInfo 
            companyData={companyData}
            onChange={handleChange}
          />
          
          <CompanyFooterSection 
            footer={companyData.footer}
            onChange={handleChange}
          />

          <CompanyFormActions isSaving={isSaving} />
        </form>
      </CardContent>
    </Card>
  );
}
