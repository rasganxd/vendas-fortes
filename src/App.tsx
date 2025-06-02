import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import AppDataProvider from '@/context/providers/AppDataProvider';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Customers from '@/pages/Customers';
import SalesReps from '@/pages/SalesReps';
import PaymentMethods from '@/pages/PaymentMethods';
import PaymentTables from '@/pages/PaymentTables';
import Vehicles from '@/pages/Vehicles';
import DeliveryRoutes from '@/pages/DeliveryRoutes';
import Loads from '@/pages/Loads';
import Payments from '@/pages/Payments';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Sync from '@/pages/Sync';
import Units from '@/pages/Units';
import Products from '@/pages/Products';
import { ConnectionProvider } from '@/context/providers/ConnectionProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <AppDataProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pedidos" element={<Orders />} />
                  <Route path="/clientes" element={<Customers />} />
                  <Route path="/produtos" element={<Products />} />
                  <Route path="/vendedores" element={<SalesReps />} />
                  <Route path="/metodos-pagamento" element={<PaymentMethods />} />
                  <Route path="/tabelas-pagamento" element={<PaymentTables />} />
                  <Route path="/unidades" element={<Units />} />
                  <Route path="/veiculos" element={<Vehicles />} />
                  <Route path="/rotas-entrega" element={<DeliveryRoutes />} />
                  <Route path="/cargas" element={<Loads />} />
                  <Route path="/pagamentos" element={<Payments />} />
                  <Route path="/relatorios" element={<Reports />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="/sincronizacao" element={<Sync />} />
                </Routes>
              </Layout>
            </div>
          </Router>
          <Toaster />
        </AppDataProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}

export default App;
