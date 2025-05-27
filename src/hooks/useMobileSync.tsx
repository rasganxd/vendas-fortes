
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
    lastSyncTime: null
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
      
      // Auto-sync after login
      await syncData();
      
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
        lastSyncTime: null
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
   * Sync all data
   */
  const syncData = useCallback(async () => {
    if (!state.isAuthenticated) {
      console.log('Not authenticated, skipping sync');
      return;
    }
    
    setState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      // Execute sync and get data
      await mobileSyncService.syncAllData();
      
      // Get the synced data
      const customers = await mobileSyncService.getCustomersForSync(state.currentSalesRep?.id);
      const products = await mobileSyncService.getProductsForSync();
      const orders: Order[] = []; // Orders would come from a similar method
      
      setState(prev => ({
        ...prev,
        customers,
        products,
        orders,
        isSyncing: false,
        lastSyncTime: new Date()
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
    syncData
  };
};
