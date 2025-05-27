
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from '@/components/settings/CompanySettings';
import SystemSettings from '@/components/settings/SystemSettings';
import ApiTokensPanel from '@/components/settings/ApiTokensPanel';
import MobileAuthDocumentation from '@/components/settings/MobileAuthDocumentation';
import MobileOrderImportPanel from '@/components/settings/MobileOrderImportPanel';
import UnitsPanel from '@/components/settings/UnitsPanel';

export default function Settings() {
  return (
    <PageLayout title="Configurações">
      <div className="space-y-4">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-6 md:w-auto md:inline-flex">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="units">Unidades</TabsTrigger>
            <TabsTrigger value="api">API REST</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Auth</TabsTrigger>
            <TabsTrigger value="import">Importação Mobile</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-4">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="system" className="mt-4">
            <SystemSettings />
          </TabsContent>
          <TabsContent value="units" className="mt-4">
            <UnitsPanel />
          </TabsContent>
          <TabsContent value="api" className="mt-4">
            <ApiTokensPanel />
          </TabsContent>
          <TabsContent value="mobile" className="mt-4">
            <MobileAuthDocumentation />
          </TabsContent>
          <TabsContent value="import" className="mt-4">
            <MobileOrderImportPanel />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
