
import { useState, useEffect } from 'react';
import { db } from '@/services/firebase/config';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { initializeFirestore } from '@/services/firebase/initializeFirestore';
import { enableNetwork, disableNetwork, getFirestore } from 'firebase/firestore';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export const useFirebaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastInitAttempt, setLastInitAttempt] = useState<Date | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      const isOnline = navigator.onLine;
      console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
      
      if (isOnline) {
        // We're back online, try to reconnect to Firebase
        reconnectToFirebase();
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
  
  // Function to reconnect to Firebase
  const reconnectToFirebase = async () => {
    try {
      setConnectionStatus('connecting');
      console.log('Attempting to reconnect to Firebase...');
      
      // Re-enable network for Firestore
      await enableNetwork(db);
      
      // Try to initialize collections again
      const success = await initializeFirestore(false);
      
      if (success) {
        setConnectionStatus('connected');
        console.log('Successfully reconnected to Firebase');
      } else {
        setConnectionStatus('error');
        console.error('Failed to reconnect to Firebase');
      }
      
      setLastInitAttempt(new Date());
    } catch (error) {
      console.error('Error reconnecting to Firebase:', error);
      setConnectionStatus('error');
      setLastInitAttempt(new Date());
    }
  };
  
  // Function to manually disable Firebase network connection
  const disableFirebaseNetwork = async () => {
    try {
      console.log('Disabling Firebase network connection...');
      await disableNetwork(db);
      setConnectionStatus('disconnected');
      console.log('Firebase network disabled');
    } catch (error) {
      console.error('Error disabling Firebase network:', error);
    }
  };
  
  // Function to manually enable Firebase network connection
  const enableFirebaseNetwork = async () => {
    try {
      console.log('Enabling Firebase network connection...');
      setConnectionStatus('connecting');
      await enableNetwork(db);
      setConnectionStatus('connected');
      console.log('Firebase network enabled');
    } catch (error) {
      console.error('Error enabling Firebase network:', error);
      setConnectionStatus('error');
    }
  };
  
  // Function to initialize all Firebase collections
  const initializeCollections = async () => {
    try {
      setConnectionStatus('connecting');
      const success = await initializeFirestore(true);
      
      if (success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
      
      setLastInitAttempt(new Date());
      return success;
    } catch (error) {
      console.error('Error initializing Firebase collections:', error);
      setConnectionStatus('error');
      setLastInitAttempt(new Date());
      return false;
    }
  };

  return {
    connectionStatus,
    lastInitAttempt,
    reconnectToFirebase,
    disableFirebaseNetwork,
    enableFirebaseNetwork,
    initializeCollections
  };
};
