
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import MobileSyncPanel from './MobileSyncPanel';

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="text-primary" size={20} />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Gerencie configurações técnicas do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System settings content can be added here in the future if needed */}
        </CardContent>
      </Card>
      
      <MobileSyncPanel />
    </div>
  );
}
