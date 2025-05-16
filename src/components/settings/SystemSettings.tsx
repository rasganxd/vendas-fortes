
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, Server } from "lucide-react";
import { useAppContext } from '@/hooks/useAppContext';
import { toast } from "@/components/ui/use-toast";
import MobileSyncPanel from './MobileSyncPanel';
import { initializeFirestore } from '@/services/firebase/initializeFirestore';

export default function SystemSettings() {
  const { clearCache } = useAppContext();
  const [isClearing, setIsClearing] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(false);
  
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      toast({
        title: "Cache limpo",
        description: "O cache do sistema foi limpo com sucesso."
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o cache do sistema.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleInitializeFirestore = async () => {
    setIsInitializing(true);
    try {
      await initializeFirestore();
      toast({
        title: "Firestore inicializado",
        description: "As coleções do Firestore foram inicializadas com sucesso."
      });
    } catch (error) {
      console.error('Error initializing Firestore:', error);
      toast({
        title: "Erro",
        description: "Não foi possível inicializar as coleções do Firestore.",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };
  
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
          <div>
            <h3 className="text-md font-medium mb-4">Cache e Armazenamento</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">
                Limpar o cache pode resolver problemas de desempenho ou exibição incorreta de dados.
              </p>
              <Button 
                variant="outline"
                onClick={handleClearCache}
                disabled={isClearing}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={isClearing ? "animate-spin" : ""} />
                {isClearing ? "Limpando..." : "Limpar Cache"}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-md font-medium mb-4">Banco de Dados Firebase</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">
                Inicialize as coleções do Firebase para garantir que todas estejam criadas corretamente.
              </p>
              <Button 
                variant="outline"
                onClick={handleInitializeFirestore}
                disabled={isInitializing}
                className="flex items-center gap-2"
              >
                <Server size={16} className={isInitializing ? "animate-spin" : ""} />
                {isInitializing ? "Inicializando..." : "Inicializar Coleções Firebase"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <MobileSyncPanel />
    </div>
  );
}
