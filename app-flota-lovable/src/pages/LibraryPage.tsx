import { useFleet } from '@/contexts/FleetContext';
import { Download, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DOCUMENT_TYPE_LABELS } from '@/types/vehicle';

const LibraryPage = () => {
  const { vehicles } = useFleet();

  const handleDownload = (fileName?: string) => {
    // In a real app with cloud storage, this would download the actual file
    // For now, we show an alert since files aren't stored in a real storage
    if (fileName) {
      alert(`En una implementación con Lovable Cloud, aquí se descargaría el archivo: ${fileName}`);
    } else {
      alert('Este documento no tiene archivo adjunto.');
    }
  };

  const totalDocuments = vehicles.reduce((acc, v) => acc + v.documents.length, 0);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Biblioteca</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documentos almacenados por vehículo
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
          <span className="font-medium">{totalDocuments}</span> documentos en total
        </div>
      </div>

      {vehicles.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {vehicles.map((vehicle) => (
            <AccordionItem 
              key={vehicle.id} 
              value={vehicle.id}
              className="border rounded-lg bg-card px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {vehicle.brand} {vehicle.model}
                      <span className="ml-2 text-sm font-mono text-muted-foreground">
                        {vehicle.licensePlate}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.documents.length} documento{vehicle.documents.length !== 1 ? 's' : ''} • {vehicle.project}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 pb-2 space-y-3">
                  {vehicle.documents.length > 0 ? (
                    vehicle.documents.map((doc) => (
                      <Card key={doc.id} className="bg-muted/30">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <CardTitle className="text-sm font-medium">{doc.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {DOCUMENT_TYPE_LABELS[doc.type]}
                                </CardDescription>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(doc.fileName)}
                              disabled={!doc.fileName}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Fecha de Emisión</p>
                              <p className="font-medium">
                                {new Date(doc.issueDate).toLocaleDateString('es-CL')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Fecha de Expiración</p>
                              <p className="font-medium">
                                {new Date(doc.expirationDate).toLocaleDateString('es-CL')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Frecuencia</p>
                              <p className="font-medium">{doc.renewalFrequency}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Archivo</p>
                              <p className="font-medium truncate">
                                {doc.fileName || 'Sin archivo'}
                              </p>
                            </div>
                          </div>
                          {doc.lastRenewalDate && (
                            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                              Última renovación: {new Date(doc.lastRenewalDate).toLocaleDateString('es-CL')}
                            </div>
                          )}
                          {doc.observations && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground">Observaciones:</p>
                              <p className="text-sm mt-1">{doc.observations}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay documentos registrados para este vehículo.</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay vehículos registrados.</p>
          <p className="text-sm">Agrega vehículos para ver sus documentos aquí.</p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
