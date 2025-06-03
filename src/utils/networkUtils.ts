
export class NetworkUtils {
  
  static async getLocalIP(): Promise<string> {
    try {
      // Método simples para detectar IP local usando RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: []
      });
      
      pc.createDataChannel('');
      
      return new Promise((resolve) => {
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const candidate = e.candidate.candidate;
            const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (match) {
              pc.close();
              resolve(match[1]);
            }
          }
        };
        
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        
        // Fallback após 3 segundos
        setTimeout(() => {
          pc.close();
          resolve('192.168.1.100'); // IP padrão como fallback
        }, 3000);
      });
    } catch (error) {
      console.error('Erro ao detectar IP local:', error);
      return '192.168.1.100'; // IP padrão
    }
  }

  static generateQRCodeData(ip: string, port: number): string {
    return JSON.stringify({
      server_ip: ip,
      server_port: port,
      sync_endpoint: '/primeira-atualizacao',
      timestamp: new Date().toISOString()
    });
  }

  static validateIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  static isLocalNetworkIP(ip: string): boolean {
    if (!this.validateIP(ip)) return false;
    
    const parts = ip.split('.').map(Number);
    
    // Verificar se é IP de rede local
    return (
      (parts[0] === 192 && parts[1] === 168) || // 192.168.x.x
      (parts[0] === 10) || // 10.x.x.x
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) // 172.16.x.x - 172.31.x.x
    );
  }

  static async testConnectivity(ip: string, port: number): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`http://${ip}:${port}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conectividade:', error);
      return false;
    }
  }

  static formatDataSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
