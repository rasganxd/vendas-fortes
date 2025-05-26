
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from '@/components/settings/CompanySettings';
import SystemSettings from '@/components/settings/SystemSettings';
import ApiTokensPanel from '@/components/settings/ApiTokensPanel';

export default function Settings() {
  return (
    <PageLayout title="Configurações">
      <div className="space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="api">API REST</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-6">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="system" className="mt-6">
            <SystemSettings />
          </TabsContent>
          <TabsContent value="api" className="mt-6">
            <ApiTokensPanel />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
