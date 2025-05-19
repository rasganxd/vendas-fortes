
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import MobileSyncPanel from './MobileSyncPanel';

export default function SystemSettings() {
  return (
    <div className="space-y-8">
      {/* Cabeçalho principal com descrição */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configurações do Sistema</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações técnicas e sincronização da sua aplicação.
        </p>
      </div>
      
      {/* Card de sincronização móvel com visual melhorado */}
      <Card className="overflow-hidden border-none shadow-lg transition-all duration-200 hover:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Smartphone className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Sincronização Móvel
              </CardTitle>
              <CardDescription className="mt-1.5">
                Gerencie a conexão e sincronização com dispositivos móveis.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <MobileSyncPanel />
        </CardContent>
      </Card>
    </div>
  );
}
