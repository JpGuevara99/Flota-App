import { DashboardHeader } from '@/components/DashboardHeader';
import { VehicleList } from '@/components/VehicleList';
import { StatusLegend } from '@/components/StatusLegend';
import { useFleet } from '@/contexts/FleetContext';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

const Index = () => {
  const { vehicles } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    
    const query = searchQuery.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query) ||
      vehicle.project.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query)
    );
  }, [searchQuery, vehicles]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader vehicles={vehicles} />

      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Listado de Vehículos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ordenado por documento más próximo a expirar
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <StatusLegend />
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por marca, modelo, patente o proyecto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {filteredVehicles.length > 0 ? (
          <VehicleList vehicles={filteredVehicles} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No se encontraron vehículos que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
