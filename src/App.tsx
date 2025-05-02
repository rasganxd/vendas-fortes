
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import SideNav from "./components/layout/SideNav";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import RoutePlanning from "./pages/Routes";
import Loads from "./pages/Loads";
import NotFound from "./pages/NotFound";
import NewOrder from "./pages/NewOrder";
import SalesReps from "./pages/SalesReps";
import PaymentMethods from "./pages/PaymentMethods";
import PaymentTables from "./pages/PaymentTables";
import BuildLoad from "./pages/BuildLoad";
import SystemMaintenance from "./pages/SystemMaintenance";
import Vehicles from "./pages/Vehicles";
import Settings from "./pages/Settings";

function App() {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 30000,
        },
      },
      queryCache: new QueryCache({
        onError: (error, query) => {
          console.error('Query error:', error);
          toast({
            title: "Erro na aplicação",
            description: "Ocorreu um problema ao carregar os dados. Por favor, tente novamente.",
            variant: "destructive"
          });
        },
      }),
    })
  );
  
  // Monitor app for Firebase connectivity issues
  useEffect(() => {
    const checkConnection = () => {
      if (!navigator.onLine) {
        toast({
          title: "Sem conexão",
          description: "Você está offline. Algumas funções podem não estar disponíveis.",
          variant: "destructive"
        });
      }
    };

    window.addEventListener('online', () => {
      toast({
        title: "Conexão restabelecida",
        description: "Sua conexão com a internet foi restabelecida."
      });
    });
    
    window.addEventListener('offline', checkConnection);
    
    // Check on initial load
    checkConnection();

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full bg-gradient-to-br from-sales-50 via-sales-100 to-white">
                <SideNav />
                <div className="flex-1 overflow-hidden">
                  <Toaster />
                  <Sonner />
                  <div className="h-full overflow-auto p-4 md:p-6 animate-fade-in">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/clientes" element={<Customers />} />
                      <Route path="/produtos" element={<Products />} />
                      <Route path="/pedidos" element={<Orders />} />
                      <Route path="/pedidos/novo" element={<NewOrder />} />
                      <Route path="/pagamentos" element={<Payments />} />
                      <Route path="/pagamentos/tabelas" element={<PaymentTables />} />
                      <Route path="/rotas" element={<RoutePlanning />} />
                      <Route path="/cargas" element={<Loads />} />
                      <Route path="/cargas/montar" element={<BuildLoad />} />
                      <Route path="/vendedores" element={<SalesReps />} />
                      <Route path="/formas-pagamento" element={<PaymentMethods />} />
                      <Route path="/manutencao" element={<SystemMaintenance />} />
                      <Route path="/veiculos" element={<Vehicles />} />
                      <Route path="/configuracoes" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
