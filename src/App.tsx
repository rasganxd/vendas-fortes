
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppContextInnerProvider } from "@/context/providers/AppContextInnerProvider";
import { ConnectionProvider } from "@/context/providers/ConnectionProvider";
import { SideNav } from "@/components/layout/SideNav";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import NewOrder from "./pages/NewOrder";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import ProductPricing from "./pages/ProductPricing";
import ProductClassifications from "./pages/ProductClassifications";
import SalesReps from "./pages/SalesReps";
import PaymentMethods from "./pages/PaymentMethods";
import PaymentTables from "./pages/PaymentTables";
import Payments from "./pages/Payments";
import PaymentsList from "./pages/PaymentsList";
import RoutesPage from "./pages/RoutesPage";
import Loads from "./pages/Loads";
import BuildLoad from "./pages/BuildLoad";
import Vehicles from "./pages/Vehicles";
import Settings from "./pages/Settings";
import SystemMaintenance from "./pages/SystemMaintenance";
import SalesReports from "./pages/SalesReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <ConnectionProvider>
            <AppContextInnerProvider>
              <Toaster />
              <BrowserRouter>
                <div className="min-h-screen flex">
                  <SideNav />
                  <main className="flex-1 overflow-hidden">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/pedidos" element={<Orders />} />
                      <Route path="/pedidos/novo" element={<NewOrder />} />
                      <Route path="/clientes" element={<Customers />} />
                      <Route path="/produtos" element={<Products />} />
                      <Route path="/produtos/precos" element={<ProductPricing />} />
                      <Route path="/produtos/classificacoes" element={<ProductClassifications />} />
                      <Route path="/vendedores" element={<SalesReps />} />
                      <Route path="/metodos-pagamento" element={<PaymentMethods />} />
                      <Route path="/tabelas-pagamento" element={<PaymentTables />} />
                      <Route path="/pagamentos" element={<Payments />} />
                      <Route path="/pagamentos/lista" element={<PaymentsList />} />
                      <Route path="/relatorios-vendas" element={<SalesReports />} />
                      <Route path="/rotas" element={<RoutesPage />} />
                      <Route path="/cargas" element={<Loads />} />
                      <Route path="/cargas/montar" element={<BuildLoad />} />
                      <Route path="/veiculos" element={<Vehicles />} />
                      <Route path="/configuracoes" element={<Settings />} />
                      <Route path="/manutencao" element={<SystemMaintenance />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </BrowserRouter>
            </AppContextInnerProvider>
          </ConnectionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
