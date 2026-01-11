import { DocumentStatus, getDaysUntilExpiration } from '@/types/vehicle';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: DocumentStatus;
  daysUntilExpiration: number;
  className?: string;
}

export const StatusBadge = ({ status, daysUntilExpiration, className }: StatusBadgeProps) => {
  const getStatusText = () => {
    if (daysUntilExpiration < 0) {
      return `Expirado hace ${Math.abs(daysUntilExpiration)} días`;
    }
    if (daysUntilExpiration === 0) {
      return 'Expira hoy';
    }
    return `${daysUntilExpiration} días`;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        status === 'green' && 'status-badge-green',
        status === 'yellow' && 'status-badge-yellow',
        status === 'red' && 'status-badge-red',
        className
      )}
    >
      <span
        className={cn(
          status === 'green' && 'status-dot-green',
          status === 'yellow' && 'status-dot-yellow',
          status === 'red' && 'status-dot-red'
        )}
      />
      {getStatusText()}
    </span>
  );
};

interface StatusDotProps {
  status: DocumentStatus;
  className?: string;
}

export const StatusDot = ({ status, className }: StatusDotProps) => {
  return (
    <span
      className={cn(
        status === 'green' && 'status-dot-green',
        status === 'yellow' && 'status-dot-yellow',
        status === 'red' && 'status-dot-red',
        className
      )}
    />
  );
};
