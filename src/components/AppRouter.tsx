
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import SideNav from '@/components/layout/SideNav';

// Unified login page
import Login from '@/pages/Login';

// Desktop pages
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
import UserManagement from '@/pages/UserManagement';
import NotFound from '@/pages/NotFound';

// Mobile pages
import MobileDashboard from '@/mobile/pages/MobileDashboard';
import MobileSales from '@/mobile/pages/MobileSales';
import MobileRoutes from '@/mobile/pages/MobileRoutes';

export default function AppRouter() {
  const { user, userProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostrar página de login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Se está logado mas não tem perfil ainda, aguardar
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Redirecionamento baseado em role
  if (userProfile.role === 'vendedor') {
    // Interface mobile para vendedores
    return (
      <Routes>
        <Route path="/mobile" element={<MobileDashboard />} />
        <Route path="/mobile/vendas" element={<MobileSales />} />
        <Route path="/mobile/rotas" element={<MobileRoutes />} />
        <Route path="/login" element={<Navigate to="/mobile" />} />
        <Route path="/*" element={<Navigate to="/mobile" />} />
      </Routes>
    );
  }

  // Interface desktop para admin/manager
  return (
    <>
      <SideNav />
      <div className="flex-1 relative">
        <Routes>
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
          <Route path="/usuarios" element={<UserManagement />} />
          <Route path="/veiculos" element={<Vehicles />} />
          <Route path="/pagamentos/tabelas" element={<PaymentTables />} />
          <Route path="/metodos-pagamento" element={<PaymentMethods />} />
          <Route path="/pagamentos" element={<Payments />} />
          <Route path="/lista-pagamentos" element={<PaymentsList />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/manutencao" element={<SystemMaintenance />} />
          <Route path="/login" element={<Navigate to="/dashboard" />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/mobile/*" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}
