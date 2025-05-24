
import React from 'react';
import { Customer, Product, ProductBrand, ProductCategory, ProductGroup, SalesRep, Vehicle, DeliveryRoute, Load, Order, Payment, PaymentMethod, PaymentTable } from '@/types';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { useLoads } from '@/hooks/useLoads';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { customerService } from '@/services/supabase/customerService';
import { useSystemOperations } from './systemOperations';

export const useAppOperations = () => {
  const customersHook = useCustomers();
  const productsHook = useProducts();
  const productBrandsHook = useProductBrands();
  const productCategoriesHook = useProductCategories();
  const productGroupsHook = useProductGroups();
  const salesRepsHook = useSalesReps();
  const vehiclesHook = useVehicles();
  const deliveryRoutesHook = useDeliveryRoutes();
  const loadsHook = useLoads();
  const ordersHook = useOrders();
  const paymentsHook = usePayments();
  const paymentMethodsHook = usePaymentMethods();
  const paymentTablesHook = usePaymentTables();
  const systemOps = useSystemOperations();

  // Add generateNextCustomerCode function
  const generateNextCustomerCode = async (): Promise<number> => {
    try {
      return await customerService.generateNextCode();
    } catch (error) {
      console.error('Error generating customer code:', error);
      return 1;
    }
  };

  // Add setCustomers function for compatibility
  const setCustomers = (customers: Customer[] | ((prev: Customer[]) => Customer[])) => {
    // This is handled by the useCustomers hook internally
    console.log('setCustomers called - managed by useCustomers hook');
  };

  return {
    // Customer operations
    customerOperations: {
      customers: customersHook.customers,
      isLoading: customersHook.isLoading,
      addCustomer: customersHook.addCustomer,
      updateCustomer: customersHook.updateCustomer,
      deleteCustomer: customersHook.deleteCustomer,
      generateNextCustomerCode,
      setCustomers,
    },

    // Product operations
    productOperations: {
      products: productsHook.products,
      isLoadingProducts: productsHook.isLoading,
      addProduct: productsHook.addProduct,
      updateProduct: productsHook.updateProduct,
      deleteProduct: productsHook.deleteProduct,
    },

    // System operations
    systemOperations: systemOps,

    // All operations flattened for backward compatibility
    customers: customersHook.customers,
    isLoading: customersHook.isLoading,
    addCustomer: customersHook.addCustomer,
    updateCustomer: customersHook.updateCustomer,
    deleteCustomer: customersHook.deleteCustomer,
    generateNextCustomerCode,
    setCustomers,

    products: productsHook.products,
    isLoadingProducts: productsHook.isLoading,
    addProduct: productsHook.addProduct,
    updateProduct: productsHook.updateProduct,
    deleteProduct: productsHook.deleteProduct,

    productBrands: productBrandsHook.productBrands,
    isLoadingProductBrands: productBrandsHook.isLoading,
    addProductBrand: productBrandsHook.addProductBrand,
    updateProductBrand: productBrandsHook.updateProductBrand,
    deleteProductBrand: productBrandsHook.deleteProductBrand,

    productCategories: productCategoriesHook.productCategories,
    isLoadingProductCategories: productCategoriesHook.isLoading,
    addProductCategory: productCategoriesHook.addProductCategory,
    updateProductCategory: productCategoriesHook.updateProductCategory,
    deleteProductCategory: productCategoriesHook.deleteProductCategory,

    productGroups: productGroupsHook.productGroups,
    isLoadingProductGroups: productGroupsHook.isLoading,
    addProductGroup: productGroupsHook.addProductGroup,
    updateProductGroup: productGroupsHook.updateProductGroup,
    deleteProductGroup: productGroupsHook.deleteProductGroup,

    salesReps: salesRepsHook.salesReps,
    isLoadingSalesReps: salesRepsHook.isLoading,
    addSalesRep: salesRepsHook.addSalesRep,
    updateSalesRep: salesRepsHook.updateSalesRep,
    deleteSalesRep: salesRepsHook.deleteSalesRep,

    vehicles: vehiclesHook.vehicles,
    isLoadingVehicles: vehiclesHook.isLoading,
    addVehicle: vehiclesHook.addVehicle,
    updateVehicle: vehiclesHook.updateVehicle,
    deleteVehicle: vehiclesHook.deleteVehicle,

    deliveryRoutes: deliveryRoutesHook.deliveryRoutes,
    isLoadingDeliveryRoutes: deliveryRoutesHook.isLoading,
    addDeliveryRoute: deliveryRoutesHook.addDeliveryRoute,
    updateDeliveryRoute: deliveryRoutesHook.updateDeliveryRoute,
    deleteDeliveryRoute: deliveryRoutesHook.deleteDeliveryRoute,

    loads: loadsHook.loads,
    isLoadingLoads: loadsHook.isLoading,
    addLoad: loadsHook.addLoad,
    updateLoad: loadsHook.updateLoad,
    deleteLoad: loadsHook.deleteLoad,

    orders: ordersHook.orders,
    isLoadingOrders: ordersHook.isLoading,
    addOrder: ordersHook.addOrder,
    updateOrder: ordersHook.updateOrder,
    deleteOrder: ordersHook.deleteOrder,

    payments: paymentsHook.payments,
    isLoadingPayments: paymentsHook.isLoading,
    addPayment: paymentsHook.addPayment,
    updatePayment: paymentsHook.updatePayment,
    deletePayment: paymentsHook.deletePayment,

    paymentMethods: paymentMethodsHook.paymentMethods,
    isLoadingPaymentMethods: paymentMethodsHook.isLoading,
    addPaymentMethod: paymentMethodsHook.addPaymentMethod,
    updatePaymentMethod: paymentMethodsHook.updatePaymentMethod,
    deletePaymentMethod: paymentMethodsHook.deletePaymentMethod,

    paymentTables: paymentTablesHook.paymentTables,
    isLoadingPaymentTables: paymentTablesHook.isLoading,
    addPaymentTable: paymentTablesHook.addPaymentTable,
    updatePaymentTable: paymentTablesHook.updatePaymentTable,
    deletePaymentTable: paymentTablesHook.deletePaymentTable,
  };
};
