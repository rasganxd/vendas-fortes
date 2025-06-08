
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppContextProvider } from '@/context/AppContextProvider';
import { Loader2 } from 'lucide-react';

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Orders = lazy(() => import("./pages/Orders"));
const NewOrder = lazy(() => import("./pages/NewOrder"));
const MobileOrdersImport = lazy(() => import("./pages/MobileOrdersImport"));
const Customers = lazy(() => import("./pages/Customers"));
const PaymentMethods = lazy(() => import("./pages/PaymentMethods"));
const PaymentTables = lazy(() => import("./pages/PaymentTables"));
const ProductPricing = lazy(() => import("./pages/ProductPricing"));
const ProductClassifications = lazy(() => import("./pages/ProductClassifications"));
const SalesReps = lazy(() => import("./pages/SalesReps"));
const Settings = lazy(() => import("./pages/Settings"));
const SystemMaintenance = lazy(() => import("./pages/SystemMaintenance"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const RoutesPage = lazy(() => import("./pages/RoutesPage"));
const Loads = lazy(() => import("./pages/Loads"));
const BuildLoad = lazy(() => import("./pages/BuildLoad"));
const Payments = lazy(() => import("./pages/Payments"));
const PaymentsList = lazy(() => import("./pages/PaymentsList"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <AppContextProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/produtos" element={<Products />} />
                    <Route path="/pedidos" element={<Orders />} />
                    <Route path="/pedidos/novo" element={<NewOrder />} />
                    <Route path="/pedidos/importar-mobile" element={<MobileOrdersImport />} />
                    <Route path="/clientes" element={<Customers />} />
                    <Route path="/formas-pagamento" element={<PaymentMethods />} />
                    <Route path="/tabelas-pagamento" element={<PaymentTables />} />
                    <Route path="/produtos/precos" element={<ProductPricing />} />
                    <Route path="/produtos/classificacoes" element={<ProductClassifications />} />
                    <Route path="/vendedores" element={<SalesReps />} />
                    <Route path="/configuracoes" element={<Settings />} />
                    <Route path="/manutencao" element={<SystemMaintenance />} />
                    <Route path="/veiculos" element={<Vehicles />} />
                    <Route path="/rotas" element={<RoutesPage />} />
                    <Route path="/cargas" element={<Loads />} />
                    <Route path="/cargas/montar" element={<BuildLoad />} />
                    <Route path="/pagamentos" element={<Payments />} />
                    <Route path="/pagamentos/lista" element={<PaymentsList />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AppContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
