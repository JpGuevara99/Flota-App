export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  expirationDate: Date;
  issueDate: Date;
  renewalFrequency: string;
  lastRenewalDate?: Date;
  fileName?: string;
  fileUrl?: string;
  observations?: string;
}

export type DocumentType = 
  | 'permiso_circulacion'
  | 'revision_tecnica'
  | 'emision_contaminantes'
  | 'soap'
  | 'mantencion_general'
  | 'miscelaneo';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  permiso_circulacion: 'Permiso de Circulación',
  revision_tecnica: 'Certificado - Revisión Técnica',
  emision_contaminantes: 'Certificado - Emisión Contaminantes',
  soap: 'Seguro Obligatorio (SOAP)',
  mantencion_general: 'Mantención General',
  miscelaneo: 'Misceláneo',
};

export type VehicleType = 'Furgón' | 'Camioneta' | 'Auto';

export interface Vehicle {
  id: string;
  type: VehicleType | string;
  project: string;
  year: number;
  model: string;
  brand: string;
  licensePlate: string;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryLog {
  id: string;
  vehicleId?: string;
  vehicleName?: string;
  action: HistoryAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  timestamp: Date;
  user: string;
}

export type HistoryAction = 
  | 'vehicle_created'
  | 'vehicle_updated'
  | 'vehicle_deleted'
  | 'document_added'
  | 'document_renewed'
  | 'document_updated'
  | 'document_deleted';

export const HISTORY_ACTION_LABELS: Record<HistoryAction, string> = {
  vehicle_created: 'Vehículo registrado',
  vehicle_updated: 'Información de vehículo actualizada',
  vehicle_deleted: 'Vehículo eliminado',
  document_added: 'Documento agregado',
  document_renewed: 'Documento renovado',
  document_updated: 'Documento actualizado',
  document_deleted: 'Documento eliminado',
};

export type DocumentStatus = 'green' | 'yellow' | 'red';

export const getDocumentStatus = (expirationDate: Date): DocumentStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0 || diffDays <= 15) return 'red';
  if (diffDays <= 30) return 'yellow';
  return 'green';
};

export const getDaysUntilExpiration = (expirationDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getEarliestExpiringDocument = (documents: Document[]): Document | null => {
  // Filter out miscelaneo documents for status calculations
  const relevantDocs = documents.filter(doc => doc.type !== 'miscelaneo');
  if (relevantDocs.length === 0) return null;
  
  return relevantDocs.reduce((earliest, current) => 
    new Date(current.expirationDate) < new Date(earliest.expirationDate) ? current : earliest
  );
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
