
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from '@/components/settings/CompanySettings';
import SalesForceDataGenerator from '@/components/settings/SalesForceDataGenerator';
import ApiTokensPanel from '@/components/settings/ApiTokensPanel';
import MobileOrderImportPanel from '@/components/settings/MobileOrderImportPanel';

export default function Settings() {
  return (
    <PageLayout title="Configurações">
      <div className="space-y-4">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="salesforce">Gerar Dados Força de Vendas</TabsTrigger>
            <TabsTrigger value="api">API REST & Mobile</TabsTrigger>
            <TabsTrigger value="import">Importação Mobile</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-4">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="salesforce" className="mt-4">
            <SalesForceDataGenerator />
          </TabsContent>
          <TabsContent value="api" className="mt-4">
            <ApiTokensPanel />
          </TabsContent>
          <TabsContent value="import" className="mt-4">
            <MobileOrderImportPanel />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
