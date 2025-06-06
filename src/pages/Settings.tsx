
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from '@/components/settings/CompanySettings';
import SalesForceDataGenerator from '@/components/settings/SalesForceDataGenerator';

export default function Settings() {
  return (
    <PageLayout title="Configurações">
      <div className="space-y-4">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="salesforce">Gerar Dados Força de Vendas</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-4">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="salesforce" className="mt-4">
            <SalesForceDataGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
