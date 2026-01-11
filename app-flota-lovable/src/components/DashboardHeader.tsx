import { Truck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Vehicle, getDocumentStatus, getEarliestExpiringDocument } from '@/types/vehicle';

interface DashboardHeaderProps {
  vehicles: Vehicle[];
}

export const DashboardHeader = ({ vehicles }: DashboardHeaderProps) => {
  const stats = vehicles.reduce(
    (acc, vehicle) => {
      const earliest = getEarliestExpiringDocument(vehicle.documents);
      if (earliest) {
        const status = getDocumentStatus(earliest.expirationDate);
        if (status === 'red') acc.critical++;
        else if (status === 'yellow') acc.warning++;
        else acc.ok++;
      }
      return acc;
    },
    { critical: 0, warning: 0, ok: 0 }
  );

  const statCards = [
    {
      label: 'Total Vehículos',
      value: vehicles.length,
      icon: Truck,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Críticos',
      value: stats.critical,
      icon: AlertTriangle,
      color: 'text-status-red',
      bgColor: 'bg-status-red-bg',
    },
    {
      label: 'Por renovar',
      value: stats.warning,
      icon: Clock,
      color: 'text-status-yellow',
      bgColor: 'bg-status-yellow-bg',
    },
    {
      label: 'Al día',
      value: stats.ok,
      icon: CheckCircle,
      color: 'text-status-green',
      bgColor: 'bg-status-green-bg',
    },
  ];

  return (
    <header className="header-gradient text-primary-foreground">
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SERCOAMB</h1>
            <p className="text-primary-foreground/70 text-sm">
              Sistema de Gestión de Flota Vehicular
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-primary-foreground/70">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
