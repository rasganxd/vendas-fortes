
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SimplifiedMobileData } from '@/services/supabase/mobileSyncService';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  showConnectionInfo?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 280,
  showConnectionInfo = false
}) => {
  const [connectionData, setConnectionData] = useState<SimplifiedMobileData | null>(null);
  const [qrCodeSize, setQrCodeSize] = useState<number>(280);

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

    // Calculate responsive QR code size
    const calculateSize = () => {
      const screenWidth = window.innerWidth;
      let calculatedSize = size;
      
      if (screenWidth < 640) {
        calculatedSize = Math.min(280, screenWidth - 80); // Small screens
      } else if (screenWidth < 1024) {
        calculatedSize = 300; // Medium screens
      } else {
        calculatedSize = 320; // Large screens
      }
      
      setQrCodeSize(calculatedSize);
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [value, showConnectionInfo, size]);

  // Debug QR code data
  useEffect(() => {
    if (value) {
      console.log('📱 QR Code data size:', value.length, 'characters');
      console.log('📱 QR Code content preview:', value.substring(0, 100) + '...');
      
      if (value.length > 1000) {
        console.warn('⚠️ QR Code data is large and might be difficult to scan');
      }
    }
  }, [value]);

  if (!value) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">Carregando QR Code...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex justify-center">
        <QRCodeSVG
          value={value}
          size={qrCodeSize}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#1e40af"
          includeMargin={false}
        />
      </div>
      
      {showConnectionInfo && connectionData && (
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base flex items-center">
            📱 Configuração da API Móvel
          </h4>
          <div className="space-y-2 text-xs sm:text-sm text-blue-700">
            <div className="grid grid-cols-1 gap-1">
              <div><strong>Servidor:</strong> <span className="break-all">{connectionData.serverUrl}</span></div>
              
              {connectionData.localIp && (
                <div><strong>IP Local:</strong> {connectionData.localIp}</div>
              )}
              
              {connectionData.serverIp && (
                <div><strong>IP Público:</strong> {connectionData.serverIp}</div>
              )}
              
              <div><strong>Token:</strong> <span className="font-mono">{connectionData.token.substring(0, 16)}...</span></div>
              
              <div><strong>Vendedor ID:</strong> {connectionData.salesRepId}</div>
            </div>

            <div className="mt-3 pt-2 border-t border-blue-200">
              <div className="text-xs">
                <div><strong>Endpoints API:</strong></div>
                <div className="ml-2 mt-1 space-y-1">
                  <div>• Download: {connectionData.endpoints.download}</div>
                  <div>• Upload: {connectionData.endpoints.upload}</div>
                  <div>• Status: {connectionData.endpoints.status}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-blue-200 text-xs text-blue-600">
            <div className="flex items-center justify-between">
              <span>Tamanho dos dados: {value.length} caracteres</span>
              <span className={`px-2 py-1 rounded ${value.length > 1000 ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                {value.length > 1000 ? 'Grande' : 'Otimizado'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
