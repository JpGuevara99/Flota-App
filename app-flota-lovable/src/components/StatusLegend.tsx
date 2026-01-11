import { StatusDot } from './StatusBadge';

export const StatusLegend = () => {
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <StatusDot status="green" />
        <span>Más de 30 días</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot status="yellow" />
        <span>Menos de 30 días</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot status="red" />
        <span>Menos de 15 días / Expirado</span>
      </div>
    </div>
  );
};
