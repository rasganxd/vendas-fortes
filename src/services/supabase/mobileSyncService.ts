
export interface SyncLogEntry {
  id: string;
  sales_rep_id: string;
  event_type: 'upload' | 'download' | 'error';
  device_id: string;
  device_ip?: string;
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

export class MobileSyncService {
  private async getLocalIpAddress(): Promise<string | null> {
    try {
      // Attempt to get local IP address using WebRTC
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
        
        // Fallback timeout
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
    
    // Get both local and public IP addresses
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
        download: `${window.location.origin}/api/mobile/download/${token}`,
        upload: `${window.location.origin}/api/mobile/upload/${token}`,
        status: `${window.location.origin}/api/mobile/status/${token}`
      }
    };
    
    console.log('📱 Generated mobile API connection data:', connectionData);
    return connectionData;
  }

  async getSyncLogs(salesRepId: string): Promise<SyncLogEntry[]> {
    console.log(`Getting sync logs for sales rep: ${salesRepId}`);
    // For now, return empty array - this would be implemented with actual Supabase tables
    return [];
  }

  async logSyncEvent(
    salesRepId: string, 
    eventType: 'upload' | 'download' | 'error', 
    deviceId: string,
    deviceIp?: string
  ): Promise<void> {
    console.log(`📱 Logging sync event: ${eventType} for sales rep: ${salesRepId}, device: ${deviceId}, IP: ${deviceIp}`);
    // This would be implemented with actual Supabase tables
  }

  async clearSyncLogs(salesRepId: string): Promise<void> {
    console.log(`Clearing sync logs for sales rep: ${salesRepId}`);
    // This would be implemented with actual Supabase tables
  }

  // Method to create mobile API discovery data
  async createMobileApiDiscovery(connectionData: ConnectionData): Promise<string> {
    const discoveryData = {
      type: "mobile-api-sync",
      version: "1.0",
      server: {
        name: "Sistema de Vendas - API Móvel",
        url: connectionData.serverUrl,
        localIp: connectionData.localIp,
        publicIp: connectionData.serverIp,
        port: connectionData.port
      },
      authentication: {
        token: connectionData.token,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        salesRepId: connectionData.salesRepId
      },
      api: {
        baseUrl: connectionData.serverUrl,
        endpoints: {
          downloadData: connectionData.apiEndpoints?.download,
          uploadData: connectionData.apiEndpoints?.upload,
          checkStatus: connectionData.apiEndpoints?.status
        }
      },
      dataTypes: {
        download: ["customers", "products", "delivery_routes"],
        upload: ["customer_updates", "product_stock", "route_progress"]
      },
      instructions: {
        pt: "Use este QR code para configurar a sincronização no app móvel",
        en: "Use this QR code to configure sync in the mobile app"
      },
      createdAt: new Date().toISOString()
    };
    
    console.log('📱 Mobile API discovery data created:', discoveryData);
    return JSON.stringify(discoveryData);
  }
}

export const mobileSyncService = new MobileSyncService();
