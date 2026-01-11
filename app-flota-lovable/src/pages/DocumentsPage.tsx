import { useState } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { Document, DocumentType, DOCUMENT_TYPE_LABELS, getDocumentStatus, getDaysUntilExpiration } from '@/types/vehicle';
import { Plus, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusDot } from '@/components/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'permiso_circulacion', label: 'Permiso de Circulación' },
  { value: 'revision_tecnica', label: 'Certificado - Revisión Técnica' },
  { value: 'emision_contaminantes', label: 'Certificado - Emisión Contaminantes' },
  { value: 'soap', label: 'Seguro Obligatorio (SOAP)' },
  { value: 'mantencion_general', label: 'Mantención General' },
  { value: 'miscelaneo', label: 'Misceláneo' },
];

const RENEWABLE_DOCUMENT_TYPES = DOCUMENT_TYPES.filter(dt => dt.value !== 'miscelaneo');

interface AddDocumentFormData {
  vehicleId: string;
  type: DocumentType;
  name: string;
  issueDate: string;
  expirationDate: string;
  fileName: string;
  observations: string;
}

interface RenewDocumentFormData {
  vehicleId: string;
  documentId: string;
  issueDate: string;
  expirationDate: string;
  fileName: string;
}

const emptyAddForm: AddDocumentFormData = {
  vehicleId: '',
  type: 'permiso_circulacion',
  name: '',
  issueDate: '',
  expirationDate: '',
  fileName: '',
  observations: '',
};

const emptyRenewForm: RenewDocumentFormData = {
  vehicleId: '',
  documentId: '',
  issueDate: '',
  expirationDate: '',
  fileName: '',
};

const DocumentsPage = () => {
  const { vehicles, addDocument, renewDocument } = useFleet();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<AddDocumentFormData>(emptyAddForm);
  const [renewFormData, setRenewFormData] = useState<RenewDocumentFormData>(emptyRenewForm);

  const selectedVehicleForRenew = vehicles.find(v => v.id === renewFormData.vehicleId);
  const selectedDocumentForRenew = selectedVehicleForRenew?.documents.find(d => d.id === renewFormData.documentId);

  const handleAddDocument = () => {
    const renewalFrequency = addFormData.type === 'revision_tecnica' || addFormData.type === 'emision_contaminantes' 
      ? 'Semestral' 
      : addFormData.type === 'permiso_circulacion' || addFormData.type === 'soap' 
        ? 'Anual' 
        : 'Variable';

    addDocument(addFormData.vehicleId, {
      type: addFormData.type,
      name: addFormData.name || DOCUMENT_TYPE_LABELS[addFormData.type],
      issueDate: new Date(addFormData.issueDate),
      expirationDate: new Date(addFormData.expirationDate),
      renewalFrequency,
      fileName: addFormData.fileName || undefined,
      observations: addFormData.observations || undefined,
    });
    setIsAddOpen(false);
    setAddFormData(emptyAddForm);
  };

  const handleRenewDocument = () => {
    renewDocument(renewFormData.vehicleId, renewFormData.documentId, {
      issueDate: new Date(renewFormData.issueDate),
      expirationDate: new Date(renewFormData.expirationDate),
      fileName: renewFormData.fileName || undefined,
    });
    setIsRenewOpen(false);
    setRenewFormData(emptyRenewForm);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, formType: 'add' | 'renew') => {
    const file = e.target.files?.[0];
    if (file) {
      if (formType === 'add') {
        setAddFormData(prev => ({ ...prev, fileName: file.name }));
      } else {
        setRenewFormData(prev => ({ ...prev, fileName: file.name }));
      }
    }
  };

  const isAddFormValid = addFormData.vehicleId && addFormData.type && addFormData.issueDate && addFormData.expirationDate;
  const isRenewFormValid = renewFormData.vehicleId && renewFormData.documentId && renewFormData.issueDate && renewFormData.expirationDate;

  // Get all documents that need attention (not green)
  const documentsNeedingAttention = vehicles.flatMap(v => 
    v.documents
      .filter(d => d.type !== 'miscelaneo')
      .map(d => ({
        ...d,
        vehicleId: v.id,
        vehicleName: `${v.brand} ${v.model} (${v.licensePlate})`,
        status: getDocumentStatus(d.expirationDate),
        daysUntil: getDaysUntilExpiration(d.expirationDate),
      }))
  ).filter(d => d.status !== 'green').sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrar Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Agrega y renueva documentos de los vehículos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsRenewOpen(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Renovar Documento
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Documento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pendientes de Renovación</TabsTrigger>
          <TabsTrigger value="all">Todos los Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {documentsNeedingAttention.length > 0 ? (
              documentsNeedingAttention.map((doc) => (
                <Card key={`${doc.vehicleId}-${doc.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusDot status={doc.status} />
                        <div>
                          <CardTitle className="text-base">{doc.name}</CardTitle>
                          <CardDescription>{doc.vehicleName}</CardDescription>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setRenewFormData({
                            vehicleId: doc.vehicleId,
                            documentId: doc.id,
                            issueDate: '',
                            expirationDate: '',
                            fileName: '',
                          });
                          setIsRenewOpen(true);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renovar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Expira: {new Date(doc.expirationDate).toLocaleDateString('es-CL')}
                      </span>
                      <span className={doc.daysUntil < 0 ? 'text-destructive font-medium' : ''}>
                        {doc.daysUntil < 0 
                          ? `Vencido hace ${Math.abs(doc.daysUntil)} días`
                          : `${doc.daysUntil} días restantes`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay documentos pendientes de renovación.</p>
                <p className="text-sm">Todos los documentos están al día.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {vehicle.brand} {vehicle.model}
                    <span className="ml-2 text-sm font-mono text-muted-foreground">
                      {vehicle.licensePlate}
                    </span>
                  </CardTitle>
                  <CardDescription>{vehicle.project}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {vehicle.documents.length > 0 ? (
                      vehicle.documents.map((doc) => {
                        const status = getDocumentStatus(doc.expirationDate);
                        const daysUntil = getDaysUntilExpiration(doc.expirationDate);
                        return (
                          <div 
                            key={doc.id} 
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <StatusDot status={status} />
                              <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Expira: {new Date(doc.expirationDate).toLocaleDateString('es-CL')}
                                  {doc.type === 'miscelaneo' && (
                                    <span className="ml-2 text-primary">(Misceláneo)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm ${daysUntil < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {daysUntil < 0 ? 'Vencido' : `${daysUntil} días`}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay documentos registrados para este vehículo.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Document Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Documento</DialogTitle>
            <DialogDescription>
              Agrega un nuevo documento a un vehículo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Vehículo</Label>
              <Select 
                value={addFormData.vehicleId} 
                onValueChange={(value) => setAddFormData(prev => ({ ...prev, vehicleId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Documento</Label>
              <Select 
                value={addFormData.type} 
                onValueChange={(value) => setAddFormData(prev => ({ 
                  ...prev, 
                  type: value as DocumentType,
                  name: DOCUMENT_TYPE_LABELS[value as DocumentType]
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fecha de Emisión</Label>
                <Input
                  type="date"
                  value={addFormData.issueDate}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Fecha de Expiración</Label>
                <Input
                  type="date"
                  value={addFormData.expirationDate}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Subir Documento (opcional)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'add')}
              />
              {addFormData.fileName && (
                <div className="flex items-center gap-2">
                  <Input
                    value={addFormData.fileName}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, fileName: e.target.value }))}
                    placeholder="Nombre del archivo"
                    className="flex-1"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Observaciones (opcional)</Label>
              <Textarea
                value={addFormData.observations}
                onChange={(e) => setAddFormData(prev => ({ ...prev, observations: e.target.value }))}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDocument} disabled={!isAddFormValid}>
              Agregar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Document Dialog */}
      <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Renovar Documento</DialogTitle>
            <DialogDescription>
              Actualiza las fechas del documento para renovarlo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Vehículo</Label>
              <Select 
                value={renewFormData.vehicleId} 
                onValueChange={(value) => setRenewFormData(prev => ({ ...prev, vehicleId: value, documentId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVehicleForRenew && (
              <div className="grid gap-2">
                <Label>Documento a Renovar</Label>
                <Select 
                  value={renewFormData.documentId} 
                  onValueChange={(value) => setRenewFormData(prev => ({ ...prev, documentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedVehicleForRenew.documents
                      .filter(d => d.type !== 'miscelaneo')
                      .map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedDocumentForRenew && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">Fecha actual de expiración:</p>
                <p className="font-medium">{new Date(selectedDocumentForRenew.expirationDate).toLocaleDateString('es-CL')}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nueva Fecha de Emisión</Label>
                <Input
                  type="date"
                  value={renewFormData.issueDate}
                  onChange={(e) => setRenewFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Nueva Fecha de Expiración</Label>
                <Input
                  type="date"
                  value={renewFormData.expirationDate}
                  onChange={(e) => setRenewFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Subir Nuevo Documento (opcional)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'renew')}
              />
              {renewFormData.fileName && (
                <Input
                  value={renewFormData.fileName}
                  onChange={(e) => setRenewFormData(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="Nombre del archivo"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRenewDocument} disabled={!isRenewFormValid}>
              Renovar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
