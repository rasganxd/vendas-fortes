
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DeliveryRoute, RouteStop } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Token Mapbox pré-configurado
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoicmFzZ2FueGQiLCJhIjoiY205N3FhOXNsMDgwMjJqcTJsNGRhaG9xeSJ9.RBtJ-Oioi66fwQCj7YAqRQ';

interface RouteMapProps {
  route: DeliveryRoute;
  className?: string;
}

export const RouteMap = ({ route, className }: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(
    localStorage.getItem('mapbox-token') || DEFAULT_MAPBOX_TOKEN
  );
  const [tokenInput, setTokenInput] = useState<string>(mapboxToken);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Salva o token no localStorage
  const saveToken = () => {
    setMapboxToken(tokenInput);
    localStorage.setItem('mapbox-token', tokenInput);
    toast({
      title: "Token salvo",
      description: "O token Mapbox foi salvo com sucesso!"
    });
    initializeMap();
  };

  // Helper function to get coordinates from address
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    if (!mapboxToken) return null;
    
    try {
      const query = encodeURIComponent(`${address}`);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&limit=1`
      );
      
      if (!response.ok) {
        console.error('Geocoding failed:', await response.text());
        return null;
      }
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Plot markers on the map for each stop
  const plotRouteStops = async () => {
    if (!map.current || !mapboxToken) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);
    
    setIsLoading(true);
    
    const newMarkers: mapboxgl.Marker[] = [];
    const coordinates: [number, number][] = [];
    
    // Add a marker for each stop
    for (let i = 0; i < route.stops.length; i++) {
      const stop = route.stops[i];
      const fullAddress = `${stop.address}, ${stop.city}, ${stop.state}, ${stop.zipCode}`;
      
      const coord = await geocodeAddress(fullAddress);
      if (coord) {
        coordinates.push(coord);
        
        // Create marker element with sequence number
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = stop.status === 'completed' ? '#16a34a' : '#2563eb';
        el.style.color = 'white';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '14px';
        el.innerText = `${stop.sequence}`;
        
        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coord)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>${stop.customerName}</strong><br>${stop.address}<br>${stop.city}, ${stop.state}`)
          )
          .addTo(map.current);
        
        newMarkers.push(marker);
      }
    }
    
    setMarkers(newMarkers);
    setIsLoading(false);
    
    // Fit bounds to show all markers if we have any
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
  };

  // Initialize the map
  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;
    
    // Clean up existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Create the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        projection: 'globe',
        zoom: 10,
        center: [-46.633308, -23.550520], // São Paulo, Brasil
        pitch: 45,
      });
      
      // Add navigation control
      map.current.addControl(
        new mapboxgl.NavigationControl(), 'top-right'
      );
      
      map.current.on('load', () => {
        plotRouteStops();
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Erro ao inicializar mapa",
        description: "Verifique se o token Mapbox está correto.",
        variant: "destructive"
      });
    }
  };

  // Initialize map when token is available
  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
    
    return () => {
      // Cleanup map on unmount
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  return (
    <div className={`flex flex-col ${className}`}>
      {!mapboxToken ? (
        <div className="p-4 border rounded-lg mb-4">
          <p className="mb-2 text-sm">Para utilizar o mapa, você precisa de um token do Mapbox.</p>
          <p className="mb-4 text-sm text-gray-500">
            Acesse <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">mapbox.com</a> para criar uma conta e obter seu token público.
          </p>
          <div className="flex gap-2">
            <Input 
              value={tokenInput} 
              onChange={e => setTokenInput(e.target.value)} 
              placeholder="Cole seu token público do Mapbox aqui"
              className="flex-1"
            />
            <Button onClick={saveToken} disabled={!tokenInput}>Salvar</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={plotRouteStops} 
            disabled={isLoading}
            className="text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <RefreshCw size={14} className="mr-2" />
                Atualizar Mapa
              </>
            )}
          </Button>
        </div>
      )}
      <div className="relative rounded-lg overflow-hidden border bg-white">
        {mapboxToken ? (
          <div ref={mapContainer} className="h-[400px] w-full" />
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-gray-100 text-center">
            <div>
              <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Insira um token do Mapbox para visualizar o mapa.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
