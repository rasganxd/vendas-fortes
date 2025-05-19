import { BrowserRouter as Router, Routes as RouterRoutes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import SideNav from '@/components/layout/SideNav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppProvider } from '@/context/AppContext';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import ProductPricingPage from '@/pages/ProductPricing';
import ProductClassifications from '@/pages/ProductClassifications';
import Orders from '@/pages/Orders';
import NewOrder from '@/pages/NewOrder';
import Loads from '@/pages/Loads';
import BuildLoad from '@/pages/BuildLoad';
import RoutesPage from '@/pages/RoutesPage';
import SalesReps from '@/pages/SalesReps';
import Vehicles from '@/pages/Vehicles';
import PaymentTables from '@/pages/PaymentTables';
import PaymentMethods from '@/pages/PaymentMethods';
import Payments from '@/pages/Payments';
import PaymentsList from '@/pages/PaymentsList';
import Settings from '@/pages/Settings';
import SystemMaintenance from '@/pages/SystemMaintenance';
import NotFound from '@/pages/NotFound';
import './App.css';
import { initializeFirestore } from './services/firebase/initializeFirestore';

function App() {
  console.log("App: Rendering App component");
  const [firestoreInitialized, setFirestoreInitialized] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  
  // Check if running on mobile device and initialize Firestore
  useEffect(() => {
    console.log("App: Running main useEffect");
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log("App: Running on mobile device");
      document.body.classList.add('mobile-device');
    } else {
      console.log("App: Running on desktop device");
    }
    
    // Initialize Firestore collections
    const setupFirestore = async () => {
      console.log("App: Starting Firestore initialization");
      try {
        const success = await initializeFirestore(false); // Don't show toasts during initial load
        console.log("App: Firestore initialization result:", success);
        setFirestoreInitialized(success);
        
        // Force a second initialization attempt if first failed
        if (!success) {
          console.log("App: First initialization failed, trying again in 3 seconds");
          setTimeout(async () => {
            console.log("App: Attempting second Firestore initialization");
            const retrySuccess = await initializeFirestore(true); // Show toasts on retry
            console.log("App: Second Firestore initialization result:", retrySuccess);
            setFirestoreInitialized(retrySuccess);
          }, 3000);
        }
      } catch (error) {
        console.error('App: Failed to initialize Firestore:', error);
        setFirestoreInitialized(false);
      } finally {
        setInitializationAttempted(true);
        console.log("App: Firestore initialization attempt completed");
      }
    };
    
    setupFirestore();
  }, []);

  console.log("App: Rendering with initialization state:", { 
    attempted: initializationAttempted,
    successful: firestoreInitialized
  });

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AppProvider>
        <Router>
          <SidebarProvider defaultOpen>
            <div className="flex min-h-screen w-full">
              <SideNav />
              <div className="flex-1 relative">
                <RouterRoutes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clientes" element={<Customers />} />
                  <Route path="/produtos" element={<Products />} />
                  <Route path="/produtos/precificacao" element={<ProductPricingPage />} />
                  <Route path="/produtos/classificacoes" element={<ProductClassifications />} />
                  <Route path="/pedidos" element={<Orders />} />
                  <Route path="/pedidos/novo" element={<NewOrder />} />
                  <Route path="/cargas" element={<Loads />} />
                  <Route path="/cargas/:id" element={<BuildLoad />} />
                  <Route path="/rotas" element={<RoutesPage />} />
                  <Route path="/vendedores" element={<SalesReps />} />
                  <Route path="/veiculos" element={<Vehicles />} />
                  <Route path="/pagamentos/tabelas" element={<PaymentTables />} />
                  <Route path="/metodos-pagamento" element={<PaymentMethods />} />
                  <Route path="/pagamentos" element={<Payments />} />
                  <Route path="/lista-pagamentos" element={<PaymentsList />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="/manutencao" element={<SystemMaintenance />} />
                  <Route path="*" element={<NotFound />} />
                </RouterRoutes>
              </div>
            </div>
            {/* Enhanced Toaster with theme awareness and duplicate prevention */}
            <Toaster />
          </SidebarProvider>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
