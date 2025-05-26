
import { supabase } from '@/integrations/supabase/client';
import { Customer, Product } from '@/types';
import { DeliveryRoute } from '@/types/delivery';

export interface MobileApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface MobileSyncData {
  customers: Customer[];
  products: Product[];
  routes: DeliveryRoute[];
  lastSync: string;
}

export interface MobileUploadData {
  customers?: Partial<Customer>[];
  products?: Partial<Product>[];
  routes?: Partial<DeliveryRoute>[];
  syncTimestamp: string;
}

export class MobileApiService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = window.location.origin;
  }

  /**
   * Generate API endpoints for mobile sync
   */
  generateApiEndpoints(token: string) {
    return {
      downloadUrl: `${this.baseUrl}/api/mobile/download/${token}`,
      uploadUrl: `${this.baseUrl}/api/mobile/upload/${token}`,
      statusUrl: `${this.baseUrl}/api/mobile/status/${token}`
    };
  }

  /**
   * Transform Supabase customer data to match Customer type
   */
  private transformCustomer(supabaseCustomer: any): Customer {
    return {
      id: supabaseCustomer.id,
      code: supabaseCustomer.code,
      name: supabaseCustomer.name,
      companyName: supabaseCustomer.company_name,
      phone: supabaseCustomer.phone || '',
      email: supabaseCustomer.email || '',
      address: supabaseCustomer.address || '',
      city: supabaseCustomer.city || '',
      state: supabaseCustomer.state || '',
      zip: supabaseCustomer.zip_code || '',
      zipCode: supabaseCustomer.zip_code || '',
      document: supabaseCustomer.document || '',
      notes: supabaseCustomer.notes || '',
      visitFrequency: supabaseCustomer.visit_frequency || '',
      visitDays: supabaseCustomer.visit_days || [],
      visitSequence: supabaseCustomer.visit_sequence || 0,
      salesRepId: supabaseCustomer.sales_rep_id,
      deliveryRouteId: supabaseCustomer.delivery_route_id,
      createdAt: new Date(supabaseCustomer.created_at),
      updatedAt: new Date(supabaseCustomer.updated_at)
    };
  }

  /**
   * Transform Supabase product data to match Product type
   */
  private transformProduct(supabaseProduct: any): Product {
    return {
      id: supabaseProduct.id,
      code: supabaseProduct.code,
      name: supabaseProduct.name,
      description: supabaseProduct.description || '',
      price: supabaseProduct.price,
      cost: supabaseProduct.cost || 0,
      stock: supabaseProduct.stock || 0,
      minStock: supabaseProduct.min_stock || 0,
      unit: supabaseProduct.unit || '',
      groupId: supabaseProduct.group_id,
      categoryId: supabaseProduct.category_id,
      brandId: supabaseProduct.brand_id,
      createdAt: new Date(supabaseProduct.created_at),
      updatedAt: new Date(supabaseProduct.updated_at)
    };
  }

  /**
   * Transform Supabase delivery route data to match DeliveryRoute type
   */
  private transformDeliveryRoute(supabaseRoute: any): DeliveryRoute {
    return {
      id: supabaseRoute.id,
      name: supabaseRoute.name,
      description: supabaseRoute.description || '',
      active: supabaseRoute.active,
      status: 'planning' as const,
      date: new Date(),
      driverId: '',
      driverName: '',
      vehicleId: '',
      vehicleName: '',
      stops: [],
      createdAt: new Date(supabaseRoute.created_at),
      updatedAt: new Date(supabaseRoute.updated_at)
    };
  }

  /**
   * Get all data for mobile sync (customers, products, routes)
   */
  async getMobileSyncData(): Promise<MobileSyncData> {
    try {
      console.log('📱 Getting mobile sync data...');
      
      // Get customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('active', true);
      
      if (customersError) throw customersError;

      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      // Get delivery routes
      const { data: routesData, error: routesError } = await supabase
        .from('delivery_routes')
        .select('*')
        .eq('active', true);
      
      if (routesError) throw routesError;

      // Transform data to match TypeScript types
      const customers = (customersData || []).map(this.transformCustomer);
      const products = (productsData || []).map(this.transformProduct);
      const routes = (routesData || []).map(this.transformDeliveryRoute);

      const syncData: MobileSyncData = {
        customers,
        products,
        routes,
        lastSync: new Date().toISOString()
      };

      console.log('📱 Mobile sync data prepared:', {
        customers: syncData.customers.length,
        products: syncData.products.length,
        routes: syncData.routes.length
      });

      return syncData;
    } catch (error) {
      console.error('❌ Error getting mobile sync data:', error);
      throw error;
    }
  }

  /**
   * Process uploaded data from mobile device
   */
  async processMobileUpload(uploadData: MobileUploadData, deviceId: string): Promise<void> {
    try {
      console.log('📱 Processing mobile upload from device:', deviceId);
      console.log('Upload data:', uploadData);

      // Process customer updates
      if (uploadData.customers && uploadData.customers.length > 0) {
        for (const customer of uploadData.customers) {
          if (customer.id) {
            // Update existing customer
            const { error } = await supabase
              .from('customers')
              .update({
                ...customer,
                updated_at: new Date().toISOString()
              })
              .eq('id', customer.id);
            
            if (error) console.error('Error updating customer:', error);
          }
        }
      }

      // Process product updates
      if (uploadData.products && uploadData.products.length > 0) {
        for (const product of uploadData.products) {
          if (product.id) {
            // Update existing product (usually stock levels)
            const { error } = await supabase
              .from('products')
              .update({
                ...product,
                updated_at: new Date().toISOString()
              })
              .eq('id', product.id);
            
            if (error) console.error('Error updating product:', error);
          }
        }
      }

      console.log('✅ Mobile upload processed successfully');
    } catch (error) {
      console.error('❌ Error processing mobile upload:', error);
      throw error;
    }
  }

  /**
   * Create a simple HTTP server simulation for mobile discovery
   */
  async createMobileEndpoints(connectionData: any): Promise<string> {
    // This would be the data structure that the mobile app expects
    const mobileApiData = {
      serverInfo: {
        name: "Sistema de Vendas",
        version: "1.0.0",
        protocol: "https",
        port: connectionData.port
      },
      endpoints: this.generateApiEndpoints(connectionData.token),
      authentication: {
        type: "token",
        token: connectionData.token,
        expiresIn: "10 minutes"
      },
      dataStructure: {
        customers: "GET /api/mobile/download/{token} -> customers[]",
        products: "GET /api/mobile/download/{token} -> products[]", 
        routes: "GET /api/mobile/download/{token} -> routes[]",
        upload: "POST /api/mobile/upload/{token} <- { customers?, products?, routes? }"
      },
      networkInfo: {
        localIp: connectionData.localIp,
        publicIp: connectionData.serverIp,
        serverUrl: connectionData.serverUrl
      }
    };

    return JSON.stringify(mobileApiData);
  }
}

export const mobileApiService = new MobileApiService();
