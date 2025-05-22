
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from '@/components/settings/CompanySettings';
import SystemSettings from '@/components/settings/SystemSettings';

export default function Settings() {
  return (
    <PageLayout title="Configurações">
      <div className="space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-6">
            <CompanySettings />
          </TabsContent>
          <TabsContent value="system" className="mt-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
