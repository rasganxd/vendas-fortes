
import { DeliveryRoute } from '@/types';
import { GoogleRouteMap } from './GoogleRouteMap';

interface RouteMapProps {
  route: DeliveryRoute;
  className?: string;
}

export const RouteMap = ({ route, className }: RouteMapProps) => {
  return (
    <div className={`flex flex-col ${className || ''}`}>
      <div className="relative rounded-lg overflow-hidden border h-[400px]">
        <GoogleRouteMap stops={route.stops} />
      </div>
    </div>
  );
};
