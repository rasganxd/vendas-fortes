
import { supabase } from '@/integrations/supabase/client';

export interface SyncLogEntry {
  id: string;
  sales_rep_id: string;
  event_type: 'upload' | 'download' | 'error' | 'connect' | 'disconnect';
  device_id: string;
  device_ip?: string;
  data_type?: string;
  records_count?: number;
  status: string;
  error_message?: string;
  created_at: string;
}

export interface ConnectionData {
  salesRepId: string;
  serverUrl: string;
  serverIp?: string;
  localIp?: string;
  timestamp: number;
  token: string;
  port?: number;
  apiEndpoints?: {
    download: string;
    upload: string;
    status: string;
  };
}

export interface SimplifiedMobileData {
  token: string;
  serverUrl: string;
  salesRepId: string;
  endpoints: {
    sync: string;
    discovery: string;
    health: string;
  };
  salesRep?: {
    id: string;
    name: string;
    code: number;
  };
  expires_at?: string;
}

export interface SyncSettings {
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  max_offline_days: number;
  require_admin_approval: boolean;
  allowed_data_types: string[];
}

export class MobileSyncService {
  private async getLocalIpAddress(): Promise<string | null> {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      const dc = pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      return new Promise((resolve) => {
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (ipMatch && !ipMatch[1].startsWith('169.254')) {
              pc.close();
              resolve(ipMatch[1]);
            }
          }
        };
        
        setTimeout(() => {
          pc.close();
          resolve(null);
        }, 3000);
      });
    } catch (error) {
      console.error('Error getting local IP:', error);
      return null;
    }
  }

  private async getPublicIpAddress(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting public IP:', error);
      return null;
    }
  }

  async generateConnectionData(salesRepId: string): Promise<ConnectionData> {
    const timestamp = new Date().getTime();
    const randomPart = Math.random().toString(36).substring(2, 10);
    const token = `${salesRepId}-${timestamp}-${randomPart}`;
    
    const [localIp, publicIp] = await Promise.all([
      this.getLocalIpAddress(),
      this.getPublicIpAddress()
    ]);
    
    const connectionData: ConnectionData = {
      salesRepId,
      serverUrl: window.location.origin,
      serverIp: publicIp || undefined,
      localIp: localIp || undefined,
      timestamp,
      token,
      port: window.location.port ? parseInt(window.location.port) : (window.location.protocol === 'https:' ? 443 : 80),
      apiEndpoints: {
        download: `${window.location.origin}/functions/v1/mobile-sync`,
        upload: `${window.location.origin}/functions/v1/mobile-sync`,
        status: `${window.location.origin}/functions/v1/mobile-health`
      }
    };
    
    console.log('📱 Generated mobile API connection data:', connectionData);
    return connectionData;
  }

  async getSyncLogs(salesRepId: string): Promise<SyncLogEntry[]> {
    try {
      console.log(`Getting sync logs for sales rep: ${salesRepId}`);
      
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('sales_rep_id', salesRepId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching sync logs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSyncLogs:', error);
      return [];
    }
  }

  async logSyncEvent(
    salesRepId: string, 
    eventType: 'upload' | 'download' | 'error' | 'connect' | 'disconnect', 
    deviceId: string,
    deviceIp?: string,
    dataType?: string,
    recordsCount?: number
  ): Promise<void> {
    try {
      console.log(`📱 Logging sync event: ${eventType} for sales rep: ${salesRepId}`);
      
      const { error } = await supabase
        .from('sync_logs')
        .insert({
          sales_rep_id: salesRepId,
          event_type: eventType,
          device_id: deviceId,
          device_ip: deviceIp,
          data_type: dataType,
          records_count: recordsCount || 0,
          status: 'completed'
        });

      if (error) {
        console.error('Error logging sync event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in logSyncEvent:', error);
      throw error;
    }
  }

  async clearSyncLogs(salesRepId: string): Promise<void> {
    try {
      console.log(`Clearing sync logs for sales rep: ${salesRepId}`);
      
      const { error } = await supabase
        .from('sync_logs')
        .delete()
        .eq('sales_rep_id', salesRepId);

      if (error) {
        console.error('Error clearing sync logs:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in clearSyncLogs:', error);
      throw error;
    }
  }

  async getSyncSettings(): Promise<SyncSettings | null> {
    try {
      const { data, error } = await supabase
        .from('sync_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching sync settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSyncSettings:', error);
      return null;
    }
  }

  async updateSyncSettings(settings: Partial<SyncSettings>): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await this.getSyncSettings())?.id);

      if (error) {
        console.error('Error updating sync settings:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateSyncSettings:', error);
      throw error;
    }
  }

  async generateMobileToken(salesRepId: string, deviceId?: string): Promise<{ token: string; expires_at: string } | null> {
    try {
      const deviceIp = await this.getPublicIpAddress();
      
      const { data, error } = await supabase
        .rpc('generate_sync_token', {
          p_sales_rep_id: salesRepId,
          p_project_type: 'mobile',
          p_device_id: deviceId,
          p_device_ip: deviceIp,
          p_expires_minutes: 60
        });

      if (error) {
        console.error('Error generating mobile token:', error);
        throw error;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error in generateMobileToken:', error);
      return null;
    }
  }

  async createMobileApiDiscovery(connectionData: ConnectionData): Promise<string> {
    try {
      // Gerar token real de sincronização
      const tokenData = await this.generateMobileToken(connectionData.salesRepId);
      
      if (!tokenData) {
        throw new Error('Falha ao gerar token de sincronização');
      }

      // Buscar dados do vendedor
      const { data: salesRep, error: salesRepError } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('id', connectionData.salesRepId)
        .single();

      if (salesRepError) {
        throw new Error('Vendedor não encontrado');
      }

      const simplifiedData: SimplifiedMobileData = {
        token: tokenData.token,
        serverUrl: connectionData.serverUrl,
        salesRepId: connectionData.salesRepId,
        endpoints: {
          sync: `${connectionData.serverUrl}/functions/v1/mobile-sync`,
          discovery: `${connectionData.serverUrl}/functions/v1/mobile-discovery`,
          health: `${connectionData.serverUrl}/functions/v1/mobile-health`
        },
        salesRep: {
          id: salesRep.id,
          name: salesRep.name,
          code: salesRep.code
        },
        expires_at: tokenData.expires_at
      };
      
      const jsonString = JSON.stringify(simplifiedData);
      console.log('📱 Mobile API discovery data created:', simplifiedData);
      console.log('📱 QR Code data size:', jsonString.length, 'characters');
      
      if (jsonString.length > 1000) {
        console.warn('⚠️ QR Code data might be too large:', jsonString.length, 'characters');
      }
      
      return jsonString;
    } catch (error) {
      console.error('Error creating mobile API discovery:', error);
      throw error;
    }
  }

  async cleanupExpiredTokens(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_tokens');

      if (error) {
        console.error('Error cleaning up tokens:', error);
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in cleanupExpiredTokens:', error);
      return 0;
    }
  }
}

export const mobileSyncService = new MobileSyncService();
