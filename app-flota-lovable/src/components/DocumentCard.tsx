import { Document, getDocumentStatus, getDaysUntilExpiration, DOCUMENT_TYPE_LABELS } from '@/types/vehicle';
import { StatusBadge } from './StatusBadge';
import { Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const status = getDocumentStatus(document.expirationDate);
  const daysUntil = getDaysUntilExpiration(document.expirationDate);

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">
          {document.name}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {format(document.expirationDate, 'dd MMM yyyy', { locale: es })}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            {document.renewalFrequency}
          </span>
        </div>
      </div>
      <StatusBadge status={status} daysUntilExpiration={daysUntil} />
    </div>
  );
};
