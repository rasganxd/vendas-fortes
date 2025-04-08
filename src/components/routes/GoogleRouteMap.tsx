
import { useMemo, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, PolylineF } from '@react-google-maps/api';
import { RouteStop } from '@/types';
import { Info } from 'lucide-react';

interface GoogleRouteMapProps {
  stops: RouteStop[];
}

export const GoogleRouteMap = ({ stops }: GoogleRouteMapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<RouteStop | null>(null);
  
  const mapCenter = useMemo(() => {
    // Se não houver paradas, centralizar em São Paulo
    if (!stops || stops.length === 0) {
      return { lat: -23.5505, lng: -46.6333 }; // São Paulo, Brasil
    }
    
    // Com paradas, calcular o centro aproximado
    const latSum = stops.reduce((sum, stop) => sum + (stop.lat || -23.5505), 0);
    const lngSum = stops.reduce((sum, stop) => sum + (stop.lng || -46.6333), 0);
    
    return { 
      lat: latSum / stops.length, 
      lng: lngSum / stops.length 
    };
  }, [stops]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "", // Usar chave API vazia para desenvolvimento
    // Você precisará definir uma chave API para produção
  });

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      mapId: "roadmap",
      zoomControl: true,
    }),
    []
  );

  const onMarkerClick = useCallback((stop: RouteStop) => {
    setSelectedMarker(stop);
  }, []);

  // Linhas conectando os pontos
  const polylinePath = useMemo(() => {
    return stops
      .filter(stop => stop.lat && stop.lng)
      .map(stop => ({ lat: stop.lat || -23.5505, lng: stop.lng || -46.6333 }));
  }, [stops]);

  if (loadError) {
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-50 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Info size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Erro ao carregar o Google Maps.</p>
          <p className="text-sm text-gray-400 mt-1">Verifique sua conexão com a internet.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-50 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-sales-800 rounded-full animate-spin mx-auto mb-2"></div>
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
      {stops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={{
            lat: stop.lat || mapCenter.lat + (Math.random() - 0.5) * 0.05,
            lng: stop.lng || mapCenter.lng + (Math.random() - 0.5) * 0.05
          }}
          onClick={() => onMarkerClick(stop)}
          label={{ text: `${index + 1}`, color: 'white' }}
          title={`${index + 1}. ${stop.customerName}`}
        />
      ))}
      
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
