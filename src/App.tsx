
import { BrowserRouter as Router, Routes as RouterRoutes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
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
  const [firestoreInitialized, setFirestoreInitialized] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  
  // Check if running on mobile device
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      document.body.classList.add('mobile-device');
    }
    
    // Initialize Firestore collections
    const setupFirestore = async () => {
      try {
        const success = await initializeFirestore(false); // Don't show toasts during initial load
        setFirestoreInitialized(success);
      } catch (error) {
        console.error('Failed to initialize Firestore:', error);
        setFirestoreInitialized(false);
      } finally {
        setInitializationAttempted(true);
      }
    };
    
    setupFirestore();
  }, []);

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
            <Toaster richColors />
          </SidebarProvider>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
