
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CompanySettings from '@/components/settings/CompanySettings';
import ApiTokensPanel from '@/components/settings/ApiTokensPanel';
import MobileSyncPanel from '@/components/settings/MobileSyncPanel';
import MobileOrderImportPanel from '@/components/settings/MobileOrderImportPanel';
import SyncUpdateMonitor from '@/components/settings/SyncUpdateMonitor';
import PageLayout from '@/components/layout/PageLayout';
import { Settings as SettingsIcon, Building, Smartphone, Download, Activity } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');

  return (
    <PageLayout title="Configurações do Sistema">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="mobile-sync" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Sync Mobile
            </TabsTrigger>
            <TabsTrigger value="mobile-orders" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Pedidos Mobile
            </TabsTrigger>
            <TabsTrigger value="sync-monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitor Sync
            </TabsTrigger>
            <TabsTrigger value="api-tokens" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Empresa</CardTitle>
                <CardDescription>
                  Configure as informações básicas da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanySettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile-sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sincronização Mobile</CardTitle>
                <CardDescription>
                  Monitore e configure a sincronização com dispositivos móveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileSyncPanel salesRepId="" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importação de Pedidos Mobile</CardTitle>
                <CardDescription>
                  Configure e monitore a importação de pedidos do aplicativo móvel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileOrderImportPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync-monitor" className="space-y-4">
            <SyncUpdateMonitor />
          </TabsContent>

          <TabsContent value="api-tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tokens de API</CardTitle>
                <CardDescription>
                  Gerencie os tokens de acesso para integração com APIs externas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiTokensPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
