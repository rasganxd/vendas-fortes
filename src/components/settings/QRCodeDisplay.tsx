
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 200 
}) => {
  const [logoSize, setLogoSize] = useState(50);

  useEffect(() => {
    // Adjust logo size based on QR code size
    setLogoSize(Math.floor(size * 0.25));
  }, [size]);

  if (!value) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-gray-100 rounded-lg">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
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
  );
};

export default QRCodeDisplay;
