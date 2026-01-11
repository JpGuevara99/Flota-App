import { useState } from 'react';
import { Vehicle, getDocumentStatus, getDaysUntilExpiration, getEarliestExpiringDocument } from '@/types/vehicle';
import { StatusDot, StatusBadge } from './StatusBadge';
import { DocumentCard } from './DocumentCard';
import { ChevronDown, Truck, MapPin, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const earliestDoc = getEarliestExpiringDocument(vehicle.documents);
  const overallStatus = earliestDoc ? getDocumentStatus(earliestDoc.expirationDate) : 'green';
  const daysUntil = earliestDoc ? getDaysUntilExpiration(earliestDoc.expirationDate) : 999;

  const criticalDocs = vehicle.documents.filter(doc => {
    const status = getDocumentStatus(doc.expirationDate);
    return status === 'red' || status === 'yellow';
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="card-fleet overflow-hidden animate-fade-in">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors">
            <div className="flex-shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                overallStatus === 'green' && "bg-status-green-bg",
                overallStatus === 'yellow' && "bg-status-yellow-bg",
                overallStatus === 'red' && "bg-status-red-bg"
              )}>
                <Truck className={cn(
                  "w-6 h-6",
                  overallStatus === 'green' && "text-status-green",
                  overallStatus === 'yellow' && "text-status-yellow",
                  overallStatus === 'red' && "text-status-red"
                )} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                  {vehicle.licensePlate}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {vehicle.type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {vehicle.project}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {vehicle.year}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {criticalDocs.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {criticalDocs.length} alerta{criticalDocs.length > 1 ? 's' : ''}
                </span>
              )}
              <StatusBadge status={overallStatus} daysUntilExpiration={daysUntil} />
              <ChevronDown className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-4 py-4 bg-muted/20">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Documentos del vehículo
            </h4>
            <div className="grid gap-2">
              {vehicle.documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
