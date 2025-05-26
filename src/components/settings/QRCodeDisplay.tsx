
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
  const [connectionData, setConnectionData] = useState<any | null>(null);

  useEffect(() => {
    // Parse connection data if showing connection info
    if (showConnectionInfo && value) {
      try {
        const parsed = JSON.parse(value);
        setConnectionData(parsed);
      } catch (error) {
        console.error('Error parsing connection data:', error);
      }
    }
  }, [value, showConnectionInfo]);

  if (!value) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[150px] sm:min-h-[200px] bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    );
  }

  // Calculate responsive QR code size
  const qrSize = Math.min(size, window.innerWidth < 640 ? 150 : 200);

  return (
    <div className="space-y-3">
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-blue-100 flex justify-center">
        <QRCodeSVG
          value={value}
          size={qrSize}
          level={"H"}
          bgColor={"#FFFFFF"}
          fgColor={"#4a86e8"}
          includeMargin={true}
        />
      </div>
      
      {showConnectionInfo && connectionData && (
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">📱 API Móvel</h4>
          <div className="space-y-1 text-xs sm:text-sm text-blue-700">
            <div className="grid grid-cols-1 gap-1">
              <div><strong>Servidor:</strong> <span className="break-all">{connectionData.server?.name || connectionData.serverUrl}</span></div>
              
              {connectionData.server?.localIp && (
                <div><strong>IP Local:</strong> {connectionData.server.localIp}</div>
              )}
              
              {connectionData.authentication?.token && (
                <div><strong>Token:</strong> <span className="font-mono">{connectionData.authentication.token.substring(0, 12)}...</span></div>
              )}
              
              {connectionData.authentication?.expiresAt && (
                <div><strong>Expira:</strong> {new Date(connectionData.authentication.expiresAt).toLocaleTimeString()}</div>
              )}
            </div>

            {connectionData.dataTypes && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="text-xs">
                  <div><strong>Download:</strong> {connectionData.dataTypes.download?.join(', ') || 'clientes, produtos'}</div>
                  <div><strong>Upload:</strong> {connectionData.dataTypes.upload?.join(', ') || 'atualizações'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
