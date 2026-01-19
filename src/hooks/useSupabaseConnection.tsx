
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
      console.log('Attempting to reconnect to Supabase...');
      
      // Test connection by making a simple query
      const { error } = await supabase.from('products').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection failed:', error);
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
        console.log('Successfully reconnected to Supabase');
      }
      
      setLastConnectAttempt(new Date());
    } catch (error) {
      console.error('Error reconnecting to Supabase:', error);
      setConnectionStatus('error');
      setLastConnectAttempt(new Date());
    }
  };
  
  // Function to test Supabase connection
  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      setConnectionStatus('connecting');
      
      const { error } = await supabase.from('products').select('count').limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        setConnectionStatus('error');
        return false;
      } else {
        setConnectionStatus('connected');
        console.log('Supabase connection test successful');
        return true;
      }
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
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
