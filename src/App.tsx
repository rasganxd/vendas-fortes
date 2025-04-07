
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import SideNav from "./components/layout/SideNav";
import PageLayout from "./components/layout/PageLayout";

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
import BuildLoad from "./pages/BuildLoad";
import SystemMaintenance from "./pages/SystemMaintenance";
import Vehicles from "./pages/Vehicles";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-gray-100">
                <SideNav />
                <div className="flex-1 overflow-hidden">
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clientes" element={<Customers />} />
                    <Route path="/produtos" element={<Products />} />
                    <Route path="/pedidos" element={<Orders />} />
                    <Route path="/pedidos/novo" element={<NewOrder />} />
                    <Route path="/pagamentos" element={<Payments />} />
                    <Route path="/rotas" element={<RoutePlanning />} />
                    <Route path="/cargas" element={<Loads />} />
                    <Route path="/cargas/montar" element={<BuildLoad />} />
                    <Route path="/vendedores" element={<SalesReps />} />
                    <Route path="/formas-pagamento" element={<PaymentMethods />} />
                    <Route path="/manutencao" element={<SystemMaintenance />} />
                    <Route path="/veiculos" element={<Vehicles />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
