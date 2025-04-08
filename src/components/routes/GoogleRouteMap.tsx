
import { useMemo, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, PolylineF } from '@react-google-maps/api';
import { RouteStop } from '@/types';
import { Info } from 'lucide-react';

interface GoogleRouteMapProps {
  stops: RouteStop[];
}

// Definir o centro do mapa para o Brasil caso não haja coordenadas
const DEFAULT_CENTER = { lat: -15.7801, lng: -47.9292 }; // Brasília, Brasil

export const GoogleRouteMap = ({ stops }: GoogleRouteMapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<RouteStop | null>(null);
  
  const mapCenter = useMemo(() => {
    // Se não houver paradas, centralizar no Brasil
    if (!stops || stops.length === 0) {
      return DEFAULT_CENTER;
    }
    
    // Com paradas, calcular o centro aproximado
    // Primeiro verificar se as paradas têm coordenadas
    const stopsWithCoords = stops.filter(stop => stop.lat && stop.lng);
    
    if (stopsWithCoords.length === 0) {
      return DEFAULT_CENTER;
    }
    
    const latSum = stopsWithCoords.reduce((sum, stop) => sum + (stop.lat || 0), 0);
    const lngSum = stopsWithCoords.reduce((sum, stop) => sum + (stop.lng || 0), 0);
    
    return { 
      lat: latSum / stopsWithCoords.length, 
      lng: lngSum / stopsWithCoords.length 
    };
  }, [stops]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAFpXRLcnIqh_78gJYaWT2lyPkFlNJXB8Q", // Usando a chave fornecida
  });

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
    }),
    []
  );

  const onMarkerClick = useCallback((stop: RouteStop) => {
    setSelectedMarker(stop);
  }, []);

  // Linhas conectando os pontos
  const polylinePath = useMemo(() => {
    // Gerar coordenadas fictícias para demonstração se não houver reais
    if (stops.length === 0) return [];
    
    return stops.map((stop, index) => {
      if (stop.lat && stop.lng) {
        return { lat: stop.lat, lng: stop.lng };
      }
      
      // Se não tiver coordenadas reais, gerar fictícias em torno do centro
      const angle = (index / stops.length) * Math.PI * 2;
      const radius = 0.05; // ~5km
      return {
        lat: mapCenter.lat + Math.sin(angle) * radius,
        lng: mapCenter.lng + Math.cos(angle) * radius
      };
    });
  }, [stops, mapCenter]);

  if (loadError) {
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-50 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Info size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Erro ao carregar o Google Maps.</p>
          <p className="text-sm text-gray-400 mt-1">Verifique sua conexão com a internet ou a chave API.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-50 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Verificar se não há paradas para exibir uma mensagem
  if (stops.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-50 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Nenhuma parada definida para esta rota.</p>
          <p className="text-sm text-gray-400 mt-1">Adicione pedidos para visualizar a rota.</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      options={mapOptions}
      zoom={12}
      center={mapCenter}
      mapContainerStyle={{ width: '100%', height: '400px' }}
    >
      {/* Marcadores para cada parada */}
      {stops.map((stop, index) => {
        // Usar coordenadas reais se disponíveis, ou gerar fictícias
        const position = stop.lat && stop.lng 
          ? { lat: stop.lat, lng: stop.lng }
          : polylinePath[index];
          
        return (
          <Marker
            key={stop.id}
            position={position}
            onClick={() => onMarkerClick(stop)}
            label={{ text: `${index + 1}`, color: 'white' }}
            title={`${index + 1}. ${stop.customerName}`}
          />
        );
      })}
      
      {/* Linha conectando as paradas */}
      {polylinePath.length > 1 && (
        <PolylineF
          path={polylinePath}
          options={{
            strokeColor: "#3B82F6",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            geodesic: true
          }}
        />
      )}
      
      {/* Info Window para o marcador selecionado */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
          <h4 className="font-medium">{selectedMarker.customerName}</h4>
          <p className="text-sm text-gray-600">{selectedMarker.address}</p>
          <p className="text-sm text-gray-600">{selectedMarker.city}, {selectedMarker.state}</p>
        </div>
      )}
    </GoogleMap>
  );
};
