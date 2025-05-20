
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Archive } from "lucide-react";
import MobileSyncPanel from './MobileSyncPanel';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
      
      {/* Card de manutenção do sistema */}
      <Card className="overflow-hidden border-none shadow-lg transition-all duration-200 hover:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b pb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/10 p-2.5">
              <Archive className="text-amber-500 h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Manutenção do Sistema
              </CardTitle>
              <CardDescription className="mt-1.5">
                Acesse as operações diárias e mensais de manutenção do sistema.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4 text-gray-600">
            Acesse as funções para criar backups, iniciar novos dias de trabalho e realizar o fechamento mensal.
          </p>
          <Link to="/system-maintenance">
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Archive className="mr-2 h-4 w-4" />
              Ir para Manutenção do Sistema
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
