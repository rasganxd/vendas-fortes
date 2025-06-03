
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from '@/components/settings/CompanySettings';
import SalesForceDataGenerator from '@/components/settings/SalesForceDataGenerator';
import MobileSyncDashboard from '@/components/settings/MobileSyncDashboard';

export default function Settings() {
  return (
    <PageLayout title="Configurações">
      <div className="space-y-4">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="salesforce">Gerar Dados Força de Vendas</TabsTrigger>
            <TabsTrigger value="sync">Sincronização Mobile</TabsTrigger>
            <TabsTrigger value="local-server">Servidor Local</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-4">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="salesforce" className="mt-4">
            <SalesForceDataGenerator />
          </TabsContent>
          <TabsContent value="sync" className="mt-4">
            <MobileSyncDashboard />
          </TabsContent>
          <TabsContent value="local-server" className="mt-4">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Servidor de Sincronização Local</h2>
              <p className="text-gray-600">
                Configure e gerencie o servidor local para sincronização com aplicativos mobile.
              </p>
              <MobileSyncDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
