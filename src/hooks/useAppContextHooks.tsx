
import React from 'react';
import { useCustomers } from './useCustomers';
import { useProducts } from './useProducts';
import { useOrders } from './useOrders';
import { usePayments } from './usePayments';
import { useVehicles } from './useVehicles';
import { useSalesReps } from './useSalesReps';
import { useLoads } from './useLoads';
import { useRoutes } from './useRoutes';
import { usePaymentMethods } from './usePaymentMethods';
import { usePaymentTables } from './usePaymentTables';
import { Product } from '@/types';

export const useAppContextHooks = () => {
  const customersHook = useCustomers();
  const productsHook = useProducts();
  const ordersHook = useOrders();
  const paymentsHook = usePayments();
  const vehiclesHook = useVehicles();
  const salesRepsHook = useSalesReps();
  const loadsHook = useLoads();
  const routesHook = useRoutes();
  const paymentMethodsHook = usePaymentMethods();
  const paymentTablesHook = usePaymentTables();

  // Product operations that were missing
  const validateProductDiscount = async (productId: string, discountedPrice: number): Promise<string | boolean> => {
    const product = productsHook.products.find(p => p.id === productId);
    if (!product) return "Produto não encontrado";
    
    // For now, return true as validation - can be enhanced later
    return true;
  };

  const getMinimumPrice = async (productId: string): Promise<number> => {
    const product = productsHook.products.find(p => p.id === productId);
    if (!product) return 0;
    
    // Return the product price as minimum for now
    return product.price || 0;
  };

  const addBulkProducts = async (productsArray: Omit<Product, 'id'>[]): Promise<string[]> => {
    const results: string[] = [];
    for (const product of productsArray) {
      try {
        const id = await productsHook.addProduct(product);
        results.push(id);
      } catch (error) {
        console.error('Error adding product:', error);
      }
    }
    return results;
  };

  return {
    // Orders operations
    orders: ordersHook.orders,
    isLoadingOrders: ordersHook.isLoading,
    addOrder: ordersHook.addOrder,
    updateOrder: ordersHook.updateOrder,
    deleteOrder: ordersHook.deleteOrder,
    getOrderById: ordersHook.getOrderById,
    generateNextOrderCode: ordersHook.generateNextCode,

    // Customers operations
    customers: customersHook.customers,
    isLoadingCustomers: customersHook.isLoading,
    addCustomer: customersHook.addCustomer,
    updateCustomer: customersHook.updateCustomer,
    deleteCustomer: customersHook.deleteCustomer,
    generateNextCustomerCode: customersHook.generateNextCustomerCode,

    // Products operations
    products: productsHook.products,
    isLoadingProducts: productsHook.isLoading,
    addProduct: productsHook.addProduct,
    updateProduct: productsHook.updateProduct,
    deleteProduct: productsHook.deleteProduct,
    isSyncing: productsHook.isSyncing,
    syncPendingProducts: productsHook.syncPendingProducts,
    forceRefreshProducts: productsHook.forceRefreshProducts,

    // Product operations that were missing
    validateProductDiscount,
    getMinimumPrice,
    addBulkProducts,

    // Payments operations
    payments: paymentsHook.payments,
    isLoadingPayments: paymentsHook.isLoading,
    addPayment: paymentsHook.addPayment,
    updatePayment: paymentsHook.updatePayment,
    deletePayment: paymentsHook.deletePayment,
    createAutomaticPaymentRecord: paymentsHook.createAutomaticPaymentRecord,

    // Vehicles operations
    vehicles: vehiclesHook.vehicles,
    isLoadingVehicles: vehiclesHook.isLoading,
    addVehicle: vehiclesHook.addVehicle,
    updateVehicle: vehiclesHook.updateVehicle,
    deleteVehicle: vehiclesHook.deleteVehicle,

    // Sales reps operations
    salesReps: salesRepsHook.salesReps,
    isLoadingSalesReps: salesRepsHook.isLoading,
    addSalesRep: salesRepsHook.addSalesRep,
    updateSalesRep: salesRepsHook.updateSalesRep,
    deleteSalesRep: salesRepsHook.deleteSalesRep,

    // Loads operations
    loads: loadsHook.loads,
    isLoadingLoads: loadsHook.isLoading,
    addLoad: loadsHook.addLoad,
    updateLoad: loadsHook.updateLoad,
    deleteLoad: loadsHook.deleteLoad,
    toggleLoadLock: loadsHook.toggleLoadLock,
    getOrdersFromLoad: loadsHook.getOrdersFromLoad,

    // Routes operations
    routes: routesHook.routes,
    isLoadingRoutes: routesHook.isLoading,
    addRoute: routesHook.addRoute,
    updateRoute: routesHook.updateRoute,
    deleteRoute: routesHook.deleteRoute,

    // Payment methods operations
    paymentMethods: paymentMethodsHook.paymentMethods,
    isLoadingPaymentMethods: paymentMethodsHook.isLoading,
    addPaymentMethod: paymentMethodsHook.addPaymentMethod,
    updatePaymentMethod: paymentMethodsHook.updatePaymentMethod,
    deletePaymentMethod: paymentMethodsHook.deletePaymentMethod,

    // Payment tables operations
    paymentTables: paymentTablesHook.paymentTables,
    isLoadingPaymentTables: paymentTablesHook.isLoading,
    addPaymentTable: paymentTablesHook.addPaymentTable,
    updatePaymentTable: paymentTablesHook.updatePaymentTable,
    deletePaymentTable: paymentTablesHook.deletePaymentTable,
  };
};
