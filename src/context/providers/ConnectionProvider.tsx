
import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ConnectionStatus = 'online' | 'offline';

interface ConnectionContextType {
  connectionStatus: ConnectionStatus;
  isOnline: boolean;
}

const ConnectionContext = createContext<ConnectionContextType>({
  connectionStatus: 'online',
  isOnline: true
});

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  
  const isOnline = connectionStatus === 'online';

  // Monitor Supabase connection status
  useEffect(() => {
    const handleConnectionChange = () => {
      const isOnline = navigator.onLine;
      setConnectionStatus(isOnline ? 'online' : 'offline');
      
      if (isOnline) {
        toast({
          title: "Conexão restaurada",
          description: "Sua conexão com o servidor foi restaurada.",
          variant: "default"
        });
      } else {
        toast({
          title: "Modo offline ativado",
          description: "Você está trabalhando no modo offline. Algumas funcionalidades podem estar limitadas.",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    // Setup Supabase health check
    const healthCheck = setInterval(async () => {
      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('customers').select('count').limit(1).single();
          if (error) {
            console.error("Supabase connection check failed:", error);
            setConnectionStatus('offline');
          } else {
            setConnectionStatus('online');
          }
        } catch (e) {
          console.error("Error checking Supabase connection:", e);
          setConnectionStatus('offline');
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      clearInterval(healthCheck);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ 
      connectionStatus,
      isOnline
    }}>
      {children}
      
      {/* Indicador de status de conexão */}
      {connectionStatus === 'offline' && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Modo Offline - Usando dados locais</span>
        </div>
      )}
    </ConnectionContext.Provider>
  );
};
