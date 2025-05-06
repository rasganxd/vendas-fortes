
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AppContextProvider } from '@/context/AppContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import NewOrder from '@/pages/NewOrder';
import Loads from '@/pages/Loads';
import BuildLoad from '@/pages/BuildLoad';
import Routes from '@/pages/Routes';
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

function App() {
  // Check if running on mobile device
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      document.body.classList.add('mobile-device');
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Customers />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/pedidos/novo" element={<NewOrder />} />
            <Route path="/cargas" element={<Loads />} />
            <Route path="/cargas/:id" element={<BuildLoad />} />
            <Route path="/rotas" element={<Routes />} />
            <Route path="/vendedores" element={<SalesReps />} />
            <Route path="/veiculos" element={<Vehicles />} />
            <Route path="/condicoes-pagamento" element={<PaymentTables />} />
            <Route path="/metodos-pagamento" element={<PaymentMethods />} />
            <Route path="/pagamentos" element={<Payments />} />
            <Route path="/lista-pagamentos" element={<PaymentsList />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/sistema" element={<SystemMaintenance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AppContextProvider>
    </ThemeProvider>
  );
}

export default App;
