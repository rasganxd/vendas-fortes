
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
   * Get all data for mobile sync (customers, products, routes)
   */
  async getMobileSyncData(): Promise<MobileSyncData> {
    try {
      console.log('📱 Getting mobile sync data...');
      
      // Get customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('active', true);
      
      if (customersError) throw customersError;

      // Get products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      // Get delivery routes
      const { data: routes, error: routesError } = await supabase
        .from('delivery_routes')
        .select('*')
        .eq('active', true);
      
      if (routesError) throw routesError;

      const syncData: MobileSyncData = {
        customers: customers || [],
        products: products || [],
        routes: routes || [],
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
