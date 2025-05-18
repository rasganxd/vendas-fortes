
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, Server, AlertTriangle, Check } from "lucide-react";
import { useAppContext } from '@/hooks/useAppContext';
import { toast } from "sonner";
import MobileSyncPanel from './MobileSyncPanel';
import { initializeFirestore } from '@/services/firebase/initializeFirestore';
import FirebaseDataTester from './FirebaseDataTester';

export default function SystemSettings() {
  const { clearCache } = useAppContext();
  const [isClearing, setIsClearing] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [initStatus, setInitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      toast.success("Cache do sistema foi limpo com sucesso.");
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error("Não foi possível limpar o cache do sistema.");
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleInitializeFirestore = async () => {
    setIsInitializing(true);
    setInitStatus('idle');
    
    try {
      const success = await initializeFirestore(true); // Show toasts
      
      if (success) {
        setInitStatus('success');
      } else {
        setInitStatus('error');
      }
    } catch (error) {
      console.error('Error initializing Firestore:', error);
      toast.error("Não foi possível inicializar as coleções do Firestore.");
      setInitStatus('error');
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
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline"
                  onClick={handleInitializeFirestore}
                  disabled={isInitializing}
                  className="flex items-center gap-2"
                >
                  <Server size={16} className={isInitializing ? "animate-spin" : ""} />
                  {isInitializing ? "Inicializando..." : "Inicializar Coleções Firebase"}
                </Button>
                
                {initStatus === 'success' && (
                  <div className="flex items-center text-sm text-green-600">
                    <Check size={16} className="mr-1" />
                    Inicialização concluída com sucesso
                  </div>
                )}
                
                {initStatus === 'error' && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertTriangle size={16} className="mr-1" />
                    Erro na inicialização
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                <p className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>Se estiver tendo problemas de conexão com o Firebase, tente inicializar as coleções manualmente usando o botão acima.</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <FirebaseDataTester />
      
      <MobileSyncPanel />
    </div>
  );
}
