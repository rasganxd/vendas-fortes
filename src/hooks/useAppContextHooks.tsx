
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

    // Products operations
    products: productsHook.products,
    isLoadingProducts: productsHook.isLoading,
    addProduct: productsHook.addProduct,
    updateProduct: productsHook.updateProduct,
    deleteProduct: productsHook.deleteProduct,

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
