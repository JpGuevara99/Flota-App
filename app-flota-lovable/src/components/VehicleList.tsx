import { useMemo } from 'react';
import { Vehicle, getEarliestExpiringDocument } from '@/types/vehicle';
import { VehicleCard } from './VehicleCard';

interface VehicleListProps {
  vehicles: Vehicle[];
}

export const VehicleList = ({ vehicles }: VehicleListProps) => {
  // Sort vehicles by earliest expiring document
  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const earliestA = getEarliestExpiringDocument(a.documents);
      const earliestB = getEarliestExpiringDocument(b.documents);
      
      if (!earliestA) return 1;
      if (!earliestB) return -1;
      
      return earliestA.expirationDate.getTime() - earliestB.expirationDate.getTime();
    });
  }, [vehicles]);

  return (
    <div className="space-y-3">
      {sortedVehicles.map((vehicle, index) => (
        <div key={vehicle.id} style={{ animationDelay: `${index * 50}ms` }}>
          <VehicleCard vehicle={vehicle} />
        </div>
      ))}
    </div>
  );
};
