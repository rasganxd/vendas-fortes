
import React, { useState } from 'react';
import { RouteStop } from '@/types';
import { Pin, Navigation } from 'lucide-react';

interface SimpleRouteMapProps {
  stops: RouteStop[];
}

export const SimpleRouteMap = ({ stops }: SimpleRouteMapProps) => {
  const [hoveredStop, setHoveredStop] = useState<string | null>(null);

  // Tamanho do canvas para o mapa
  const width = 800;
  const height = 500;
  
  // Funções de posicionamento para simular um mapa
  const getPositionForStop = (stop: RouteStop, index: number, totalStops: number) => {
    // Cria um layout circular para os pontos
    const angle = (index / totalStops) * 2 * Math.PI;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    // Adiciona um pouco de aleatoriedade para simular dispersão geográfica
    const randomness = stop.id.charCodeAt(0) % 20;
    
    return {
      x: centerX + Math.cos(angle) * (radius + randomness),
      y: centerY + Math.sin(angle) * (radius + randomness),
    };
  };

  // Calculando as posições para todos os stops
  const stopPositions = stops.map((stop, index) => ({
    stop,
    position: getPositionForStop(stop, index, stops.length)
  }));

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50 relative">
      <div className="absolute top-2 left-2 bg-white p-2 rounded-md shadow-sm text-xs z-10">
        <p className="font-semibold mb-1">Visualização Offline</p>
        <p className="text-muted-foreground">Representação simplificada da rota</p>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Linhas conectando os pontos de parada */}
        {stopPositions.length > 1 && stopPositions.map((point, index) => {
          if (index === stopPositions.length - 1) return null;
          const nextPoint = stopPositions[index + 1];
          
          return (
            <line 
              key={`line-${index}`}
              x1={point.position.x} 
              y1={point.position.y} 
              x2={nextPoint.position.x} 
              y2={nextPoint.position.y}
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* Marcadores para cada parada */}
        {stopPositions.map(({ stop, position }, index) => (
          <g 
            key={stop.id} 
            transform={`translate(${position.x}, ${position.y})`}
            onMouseEnter={() => setHoveredStop(stop.id)}
            onMouseLeave={() => setHoveredStop(null)}
            className="cursor-pointer"
          >
            {/* Círculo externo */}
            <circle 
              r="18" 
              fill={stop.status === 'completed' ? "#16a34a" : "#2563eb"} 
              opacity="0.2"
            />
            
            {/* Círculo principal */}
            <circle 
              r="14" 
              fill={stop.status === 'completed' ? "#16a34a" : "#2563eb"} 
            />
            
            {/* Número da sequência */}
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="white" 
              fontSize="12"
              fontWeight="bold"
            >
              {stop.sequence}
            </text>

            {/* Tooltip com informações da parada */}
            {hoveredStop === stop.id && (
              <foreignObject 
                x="20" 
                y="-40" 
                width="200" 
                height="80"
              >
                <div className="bg-white p-2 rounded-md shadow-md text-xs border">
                  <p className="font-semibold">{stop.customerName}</p>
                  <p>{stop.address}</p>
                  <p>{`${stop.city}, ${stop.state}`}</p>
                </div>
              </foreignObject>
            )}
          </g>
        ))}

        {/* Marcador de início (primeiro ponto) */}
        {stopPositions.length > 0 && (
          <g 
            transform={`translate(${stopPositions[0].position.x}, ${stopPositions[0].position.y - 40})`}
          >
            <Navigation className="text-green-600" size={24} />
            <text 
              x="15" 
              y="5" 
              fontSize="12" 
              fontWeight="bold"
            >
              Início
            </text>
          </g>
        )}

        {/* Marcador de fim (último ponto) */}
        {stopPositions.length > 0 && (
          <g 
            transform={`translate(${stopPositions[stopPositions.length - 1].position.x}, ${stopPositions[stopPositions.length - 1].position.y + 30})`}
          >
            <Pin className="text-red-600" size={24} />
            <text 
              x="15" 
              y="5" 
              fontSize="12" 
              fontWeight="bold"
            >
              Fim
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
