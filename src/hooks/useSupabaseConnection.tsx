
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export const useSupabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastConnectAttempt, setLastConnectAttempt] = useState<Date | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      const isOnline = navigator.onLine;
      console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
      
      if (isOnline) {
        // We're back online, try to reconnect to Supabase
        reconnectToSupabase();
      } else {
        setConnectionStatus('disconnected');
      }
    };

    // Initial status check
    handleOnlineStatus();
    
    // Add event listeners
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // Function to reconnect to Supabase
  const reconnectToSupabase = async () => {
    try {
      setConnectionStatus('connecting');
      console.log('🔄 [useSupabaseConnection] Attempting to reconnect to Supabase...');
      
      // Test connection by making a simple query - use units table as it has data
      const { data, error } = await supabase.from('units').select('id').limit(1);
      
      if (error) {
        // Check if it's an RLS error (which means connection works, just auth issue)
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          console.log('⚠️ [useSupabaseConnection] RLS permission issue, but connection works');
          setConnectionStatus('connected');
        } else {
          console.error('❌ [useSupabaseConnection] Supabase connection failed:', error);
          setConnectionStatus('error');
        }
      } else {
        setConnectionStatus('connected');
        console.log('✅ [useSupabaseConnection] Successfully reconnected to Supabase', { data });
      }
      
      setLastConnectAttempt(new Date());
    } catch (error) {
      console.error('❌ [useSupabaseConnection] Error reconnecting to Supabase:', error);
      setConnectionStatus('error');
      setLastConnectAttempt(new Date());
    }
  };
  
  // Function to test Supabase connection
  const testConnection = async () => {
    try {
      console.log('🔄 [useSupabaseConnection] Testing Supabase connection...');
      setConnectionStatus('connecting');
      
      const { data, error } = await supabase.from('units').select('id').limit(1);
      
      if (error) {
        // Check if it's an RLS error (which means connection works)
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          console.log('⚠️ [useSupabaseConnection] RLS issue, but connection works');
          setConnectionStatus('connected');
          return true;
        }
        console.error('❌ [useSupabaseConnection] Supabase connection test failed:', error);
        setConnectionStatus('error');
        return false;
      } else {
        setConnectionStatus('connected');
        console.log('✅ [useSupabaseConnection] Supabase connection test successful', { data });
        return true;
      }
    } catch (error) {
      console.error('❌ [useSupabaseConnection] Error testing Supabase connection:', error);
      setConnectionStatus('error');
      return false;
    }
  };

  return {
    connectionStatus,
    lastConnectAttempt,
    reconnectToSupabase,
    testConnection
  };
};
