
import { useState } from 'react';
import { DeliveryRoute } from '@/types';
import { Button } from '@/components/ui/button';
import { Map, Navigation } from 'lucide-react';
import { SimpleRouteMap } from './SimpleRouteMap';
import { GoogleRouteMap } from './GoogleRouteMap';

interface RouteMapProps {
  route: DeliveryRoute;
  className?: string;
}

export const RouteMap = ({ route, className }: RouteMapProps) => {
  const [useOfflineMap, setUseOfflineMap] = useState<boolean>(true);

  const toggleMapMode = () => {
    setUseOfflineMap(!useOfflineMap);
  };

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleMapMode} 
          className="text-sm"
        >
          {useOfflineMap ? (
            <>
              <Map size={14} className="mr-2" />
              Usar Google Maps
            </>
          ) : (
            <>
              <Navigation size={14} className="mr-2" />
              Usar Mapa Offline
            </>
          )}
        </Button>
      </div>
      
      <div className="relative rounded-lg overflow-hidden border h-[400px]">
        {useOfflineMap ? (
          <SimpleRouteMap stops={route.stops} />
        ) : (
          <GoogleRouteMap stops={route.stops} />
        )}
      </div>
    </div>
  );
};
