
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ConnectionData } from '@/services/supabase/mobileSyncService';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  showConnectionInfo?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 200,
  showConnectionInfo = false
}) => {
  const [logoSize, setLogoSize] = useState(50);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);

  useEffect(() => {
    // Adjust logo size based on QR code size
    setLogoSize(Math.floor(size * 0.25));
    
    // Parse connection data if showing connection info
    if (showConnectionInfo && value) {
      try {
        const parsed = JSON.parse(value) as ConnectionData;
        setConnectionData(parsed);
      } catch (error) {
        console.error('Error parsing connection data:', error);
      }
    }
  }, [size, value, showConnectionInfo]);

  if (!value) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <QRCodeSVG
          value={value}
          size={size}
          level={"H"} // High error correction
          bgColor={"#FFFFFF"}
          fgColor={"#4a86e8"} // Use the soft blue color from our theme
          includeMargin={true}
          imageSettings={{
            src: "/lovable-uploads/1441adec-113e-43a8-998a-fead623a5380.png",
            x: undefined,
            y: undefined,
            height: logoSize,
            width: logoSize,
            excavate: true,
          }}
        />
      </div>
      
      {showConnectionInfo && connectionData && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Informações de Conexão</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div><strong>URL do Servidor:</strong> {connectionData.serverUrl}</div>
            {connectionData.serverIp && (
              <div><strong>IP Público:</strong> {connectionData.serverIp}</div>
            )}
            {connectionData.localIp && (
              <div><strong>IP Local:</strong> {connectionData.localIp}</div>
            )}
            {connectionData.port && (
              <div><strong>Porta:</strong> {connectionData.port}</div>
            )}
            <div><strong>Token:</strong> {connectionData.token.substring(0, 16)}...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
