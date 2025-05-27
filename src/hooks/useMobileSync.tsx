
import { useState, useCallback } from 'react';
import { mobileSyncService } from '@/services/supabase/mobileSyncService';
import { mobileAuthService } from '@/services/supabase/mobileAuthService';
import { Customer, Product, Order, SalesRep } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface MobileSyncState {
  isAuthenticated: boolean;
  currentSalesRep: SalesRep | null;
  customers: Customer[];
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  updateAvailable: boolean;
  updateMessage: string;
}

interface SyncDataResult {
  customers: Customer[];
  products: Product[];
  orders: Order[];
}

export const useMobileSync = () => {
  const [state, setState] = useState<MobileSyncState>({
    isAuthenticated: false,
    currentSalesRep: null,
    customers: [],
    products: [],
    orders: [],
    isLoading: false,
    isSyncing: false,
    lastSyncTime: null,
    updateAvailable: false,
    updateMessage: 'Verificando atualizações...'
  });

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await mobileAuthService.login(email, password);
      
      if (result.error || !result.salesRep) {
        toast({
          title: "Erro no login",
          description: result.error || "Credenciais inválidas",
          variant: "destructive"
        });
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isAuthenticated: false,
          currentSalesRep: null
        }));
        
        return false;
      }
      
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: true,
        currentSalesRep: result.salesRep,
        isLoading: false
      }));
      
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${result.salesRep.name}!`
      });
      
      // Check for updates after login
      await checkForUpdates();
      
      return true;
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: "Erro inesperado ao fazer login",
        variant: "destructive"
      });
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isAuthenticated: false,
        currentSalesRep: null
      }));
      
      return false;
    }
  }, []);

  /**
   * Check current session
   */
  const checkSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await mobileAuthService.getCurrentSession();
      
      if (result.salesRep && result.session) {
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: true,
          currentSalesRep: result.salesRep,
          isLoading: false
        }));
        
        // Check for updates after session verification
        await checkForUpdates();
        
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false,
          currentSalesRep: null,
          isLoading: false
        }));
        
        return false;
      }
      
    } catch (error) {
      console.error('Session check error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isAuthenticated: false,
        currentSalesRep: null
      }));
      
      return false;
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await mobileAuthService.logout();
      
      setState({
        isAuthenticated: false,
        currentSalesRep: null,
        customers: [],
        products: [],
        orders: [],
        isLoading: false,
        isSyncing: false,
        lastSyncTime: null,
        updateAvailable: false,
        updateMessage: 'Verificando atualizações...'
      });
      
      toast({
        title: "Logout realizado",
        description: "Sessão encerrada com sucesso"
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Erro ao encerrar sessão",
        variant: "destructive"
      });
    }
  }, []);

  /**
   * Check for available updates
   */
  const checkForUpdates = useCallback(async () => {
    if (!state.isAuthenticated) {
      console.log('Not authenticated, skipping update check');
      return;
    }
    
    try {
      const updateCheck = await mobileSyncService.checkForUpdates();
      
      setState(prev => ({
        ...prev,
        updateAvailable: updateCheck.hasUpdates,
        updateMessage: updateCheck.message
      }));
      
      console.log('Update check result:', updateCheck);
      
    } catch (error) {
      console.error('Error checking for updates:', error);
      setState(prev => ({
        ...prev,
        updateAvailable: false,
        updateMessage: 'Erro ao verificar atualizações'
      }));
    }
  }, [state.isAuthenticated]);

  /**
   * Sync data with update control
   */
  const syncData = useCallback(async () => {
    if (!state.isAuthenticated) {
      console.log('Not authenticated, skipping sync');
      return;
    }
    
    setState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // Use the new controlled sync method
      const result = await mobileSyncService.syncAllDataWithUpdateCheck();
      
      if (!result.success) {
        // No updates available or error
        toast({
          title: "Sincronização",
          description: result.message,
          variant: result.message.includes('Erro') ? "destructive" : "default"
        });
        
        setState(prev => ({ 
          ...prev, 
          isSyncing: false,
          updateAvailable: false,
          updateMessage: result.message
        }));
        
        return;
      }
      
      // Successful sync - get the actual data
      const customers = await mobileSyncService.getCustomersForSync(state.currentSalesRep?.id);
      const products = await mobileSyncService.getProductsForSync();
      const orders: Order[] = []; // Orders would come from a similar method
      
      setState(prev => ({
        ...prev,
        customers,
        products,
        orders,
        isSyncing: false,
        lastSyncTime: new Date(),
        updateAvailable: false,
        updateMessage: 'Dados sincronizados com sucesso'
      }));
      
      toast({
        title: "Sincronização concluída",
        description: `${customers.length} clientes, ${products.length} produtos, ${orders.length} pedidos`
      });
      
    } catch (error) {
      console.error('Sync error:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados",
        variant: "destructive"
      });
    }
  }, [state.isAuthenticated, state.currentSalesRep?.id]);

  return {
    ...state,
    login,
    logout,
    checkSession,
    syncData,
    checkForUpdates
  };
};
