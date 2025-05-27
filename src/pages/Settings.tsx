
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from '@/components/settings/CompanySettings';
import SystemSettings from '@/components/settings/SystemSettings';
import ApiTokensPanel from '@/components/settings/ApiTokensPanel';
import MobileAuthDocumentation from '@/components/settings/MobileAuthDocumentation';
import CompactMobileSyncPanel from '@/components/settings/CompactMobileSyncPanel';

export default function Settings() {
  return (
    <PageLayout title="Configurações">
      <div className="space-y-4">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-5 md:w-auto md:inline-flex">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="mobile-sync">Sinc. Mobile</TabsTrigger>
            <TabsTrigger value="api">API REST</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Auth</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-4">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="system" className="mt-4">
            <SystemSettings />
          </TabsContent>
          <TabsContent value="mobile-sync" className="mt-4">
            <div className="max-w-4xl">
              <CompactMobileSyncPanel salesRepId="default-sales-rep" />
            </div>
          </TabsContent>
          <TabsContent value="api" className="mt-4">
            <ApiTokensPanel />
          </TabsContent>
          <TabsContent value="mobile" className="mt-4">
            <MobileAuthDocumentation />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
