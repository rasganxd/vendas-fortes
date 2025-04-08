
import { DeliveryRoute } from '@/types';
import { RouteCard } from './RouteCard';
import { EmptyRoutes } from './EmptyRoutes';

interface RoutesListProps {
  routes: DeliveryRoute[];
  onViewRoute: (route: DeliveryRoute) => void;
  onEditRoute: (route: DeliveryRoute) => void;
  onDeleteRoute: (id: string) => void;
  onCreateRoute: () => void;
}

export const RoutesList = ({ 
  routes, 
  onViewRoute, 
  onEditRoute, 
  onDeleteRoute,
  onCreateRoute
}: RoutesListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route) => (
        <RouteCard 
          key={route.id} 
          route={route} 
          onViewRoute={onViewRoute}
          onEditRoute={onEditRoute}
          onDeleteRoute={onDeleteRoute}
        />
      ))}
      
      {routes.length === 0 && (
        <EmptyRoutes onCreateRoute={onCreateRoute} />
      )}
    </div>
  );
};
