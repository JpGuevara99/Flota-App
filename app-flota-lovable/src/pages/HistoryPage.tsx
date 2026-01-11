import { useFleet } from '@/contexts/FleetContext';
import { HISTORY_ACTION_LABELS, HistoryAction } from '@/types/vehicle';
import { History, Truck, FileText, Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const getActionIcon = (action: HistoryAction) => {
  switch (action) {
    case 'vehicle_created':
      return <Plus className="w-4 h-4" />;
    case 'vehicle_updated':
      return <Pencil className="w-4 h-4" />;
    case 'vehicle_deleted':
      return <Trash2 className="w-4 h-4" />;
    case 'document_added':
      return <Plus className="w-4 h-4" />;
    case 'document_renewed':
      return <RefreshCw className="w-4 h-4" />;
    case 'document_updated':
      return <Pencil className="w-4 h-4" />;
    case 'document_deleted':
      return <Trash2 className="w-4 h-4" />;
    default:
      return <History className="w-4 h-4" />;
  }
};

const getActionColor = (action: HistoryAction) => {
  if (action.includes('deleted')) return 'text-destructive bg-destructive/10';
  if (action.includes('created') || action.includes('added')) return 'text-status-green bg-[hsl(var(--status-green-bg))]';
  if (action.includes('renewed')) return 'text-primary bg-primary/10';
  return 'text-muted-foreground bg-muted';
};

const HistoryPage = () => {
  const { history, vehicles } = useFleet();

  // Group history by date
  const groupedHistory = history.reduce((acc, log) => {
    const dateKey = new Date(log.timestamp).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, typeof history>);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Log History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de todas las modificaciones en el sistema
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
          <span className="font-medium">{history.length}</span> registros
        </div>
      </div>

      {history.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, logs]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-muted-foreground mb-4 sticky top-14 bg-background py-2 z-10">
                {date}
              </h2>
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="overflow-hidden">
                    <div className="flex items-start gap-4 p-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        getActionColor(log.action)
                      )}>
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium text-foreground">
                            {HISTORY_ACTION_LABELS[log.action]}
                          </p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                        
                        {log.vehicleName && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Truck className="w-3.5 h-3.5" />
                            {log.vehicleName}
                          </p>
                        )}
                        
                        {log.field && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <FileText className="w-3.5 h-3.5" />
                            {log.field}
                          </p>
                        )}
                        
                        {(log.oldValue || log.newValue) && (
                          <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                            {log.oldValue && (
                              <span className="text-muted-foreground">
                                <span className="line-through">{log.oldValue}</span>
                              </span>
                            )}
                            {log.oldValue && log.newValue && (
                              <span className="mx-2 text-muted-foreground">→</span>
                            )}
                            {log.newValue && (
                              <span className="text-foreground font-medium">{log.newValue}</span>
                            )}
                          </div>
                        )}
                        
                        {log.details && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {log.details}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          Usuario: {log.user}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay registros en el historial.</p>
          <p className="text-sm">Las modificaciones realizadas aparecerán aquí.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
