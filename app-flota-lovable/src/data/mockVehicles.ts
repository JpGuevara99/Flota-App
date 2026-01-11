import { Vehicle, HistoryLog, DocumentType } from '@/types/vehicle';

const addDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const subtractDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    type: 'Camioneta',
    project: 'Proyecto Norte',
    year: 2022,
    model: 'Hilux',
    brand: 'Toyota',
    licensePlate: 'ABCD-12',
    createdAt: subtractDays(180),
    updatedAt: subtractDays(30),
    documents: [
      { id: 'd1', name: 'Permiso de Circulación', type: 'permiso_circulacion' as DocumentType, expirationDate: addDays(45), issueDate: subtractDays(320), renewalFrequency: 'Anual' },
      { id: 'd2', name: 'Revisión Técnica', type: 'revision_tecnica' as DocumentType, expirationDate: addDays(12), issueDate: subtractDays(168), renewalFrequency: 'Semestral' },
      { id: 'd3', name: 'Emisión Contaminantes', type: 'emision_contaminantes' as DocumentType, expirationDate: addDays(12), issueDate: subtractDays(168), renewalFrequency: 'Semestral' },
      { id: 'd4', name: 'SOAP', type: 'soap' as DocumentType, expirationDate: addDays(90), issueDate: subtractDays(275), renewalFrequency: 'Anual' },
      { id: 'd5', name: 'Mantención General', type: 'mantencion_general' as DocumentType, expirationDate: addDays(60), issueDate: subtractDays(30), renewalFrequency: 'Variable' },
    ],
  },
  {
    id: '2',
    type: 'Furgón',
    project: 'Proyecto Sur',
    year: 2021,
    model: 'NQR',
    brand: 'Chevrolet',
    licensePlate: 'EFGH-34',
    createdAt: subtractDays(200),
    updatedAt: subtractDays(15),
    documents: [
      { id: 'd6', name: 'Permiso de Circulación', type: 'permiso_circulacion' as DocumentType, expirationDate: addDays(25), issueDate: subtractDays(340), renewalFrequency: 'Anual' },
      { id: 'd7', name: 'Revisión Técnica', type: 'revision_tecnica' as DocumentType, expirationDate: addDays(5), issueDate: subtractDays(175), renewalFrequency: 'Semestral' },
      { id: 'd8', name: 'Emisión Contaminantes', type: 'emision_contaminantes' as DocumentType, expirationDate: addDays(5), issueDate: subtractDays(175), renewalFrequency: 'Semestral' },
      { id: 'd9', name: 'SOAP', type: 'soap' as DocumentType, expirationDate: addDays(180), issueDate: subtractDays(185), renewalFrequency: 'Anual' },
      { id: 'd10', name: 'Mantención General', type: 'mantencion_general' as DocumentType, expirationDate: subtractDays(3), issueDate: subtractDays(93), renewalFrequency: 'Variable' },
    ],
  },
  {
    id: '3',
    type: 'Furgón',
    project: 'Proyecto Centro',
    year: 2023,
    model: 'Sprinter',
    brand: 'Mercedes-Benz',
    licensePlate: 'IJKL-56',
    createdAt: subtractDays(90),
    updatedAt: subtractDays(60),
    documents: [
      { id: 'd11', name: 'Permiso de Circulación', type: 'permiso_circulacion' as DocumentType, expirationDate: addDays(120), issueDate: subtractDays(245), renewalFrequency: 'Anual' },
      { id: 'd12', name: 'Revisión Técnica', type: 'revision_tecnica' as DocumentType, expirationDate: addDays(75), issueDate: subtractDays(105), renewalFrequency: 'Semestral' },
      { id: 'd13', name: 'Emisión Contaminantes', type: 'emision_contaminantes' as DocumentType, expirationDate: addDays(75), issueDate: subtractDays(105), renewalFrequency: 'Semestral' },
      { id: 'd14', name: 'SOAP', type: 'soap' as DocumentType, expirationDate: addDays(200), issueDate: subtractDays(165), renewalFrequency: 'Anual' },
      { id: 'd15', name: 'Mantención General', type: 'mantencion_general' as DocumentType, expirationDate: addDays(40), issueDate: subtractDays(50), renewalFrequency: 'Variable' },
    ],
  },
  {
    id: '4',
    type: 'Camioneta',
    project: 'Proyecto Norte',
    year: 2020,
    model: 'Ranger',
    brand: 'Ford',
    licensePlate: 'MNOP-78',
    createdAt: subtractDays(300),
    updatedAt: subtractDays(5),
    documents: [
      { id: 'd16', name: 'Permiso de Circulación', type: 'permiso_circulacion' as DocumentType, expirationDate: subtractDays(5), issueDate: subtractDays(370), renewalFrequency: 'Anual' },
      { id: 'd17', name: 'Revisión Técnica', type: 'revision_tecnica' as DocumentType, expirationDate: addDays(28), issueDate: subtractDays(152), renewalFrequency: 'Semestral' },
      { id: 'd18', name: 'Emisión Contaminantes', type: 'emision_contaminantes' as DocumentType, expirationDate: addDays(28), issueDate: subtractDays(152), renewalFrequency: 'Semestral' },
      { id: 'd19', name: 'SOAP', type: 'soap' as DocumentType, expirationDate: addDays(150), issueDate: subtractDays(215), renewalFrequency: 'Anual' },
      { id: 'd20', name: 'Mantención General', type: 'mantencion_general' as DocumentType, expirationDate: addDays(10), issueDate: subtractDays(80), renewalFrequency: 'Variable' },
    ],
  },
  {
    id: '5',
    type: 'Auto',
    project: 'Proyecto Sur',
    year: 2019,
    model: 'FRR',
    brand: 'Isuzu',
    licensePlate: 'QRST-90',
    createdAt: subtractDays(400),
    updatedAt: subtractDays(45),
    documents: [
      { id: 'd21', name: 'Permiso de Circulación', type: 'permiso_circulacion' as DocumentType, expirationDate: addDays(60), issueDate: subtractDays(305), renewalFrequency: 'Anual' },
      { id: 'd22', name: 'Revisión Técnica', type: 'revision_tecnica' as DocumentType, expirationDate: addDays(45), issueDate: subtractDays(135), renewalFrequency: 'Semestral' },
      { id: 'd23', name: 'Emisión Contaminantes', type: 'emision_contaminantes' as DocumentType, expirationDate: addDays(45), issueDate: subtractDays(135), renewalFrequency: 'Semestral' },
      { id: 'd24', name: 'SOAP', type: 'soap' as DocumentType, expirationDate: addDays(100), issueDate: subtractDays(265), renewalFrequency: 'Anual' },
      { id: 'd25', name: 'Mantención General', type: 'mantencion_general' as DocumentType, expirationDate: addDays(85), issueDate: subtractDays(5), renewalFrequency: 'Variable' },
    ],
  },
  {
    id: '6',
    type: 'Camioneta',
    project: 'Proyecto Este',
    year: 2022,
    model: 'D-Max',
    brand: 'Isuzu',
    licensePlate: 'UVWX-12',
    createdAt: subtractDays(120),
    updatedAt: subtractDays(10),
    documents: [
      { id: 'd26', name: 'Permiso de Circulación', type: 'permiso_circulacion' as DocumentType, expirationDate: addDays(22), issueDate: subtractDays(343), renewalFrequency: 'Anual' },
      { id: 'd27', name: 'Revisión Técnica', type: 'revision_tecnica' as DocumentType, expirationDate: addDays(50), issueDate: subtractDays(130), renewalFrequency: 'Semestral' },
      { id: 'd28', name: 'Emisión Contaminantes', type: 'emision_contaminantes' as DocumentType, expirationDate: addDays(50), issueDate: subtractDays(130), renewalFrequency: 'Semestral' },
      { id: 'd29', name: 'SOAP', type: 'soap' as DocumentType, expirationDate: addDays(200), issueDate: subtractDays(165), renewalFrequency: 'Anual' },
      { id: 'd30', name: 'Mantención General', type: 'mantencion_general' as DocumentType, expirationDate: addDays(70), issueDate: subtractDays(20), renewalFrequency: 'Variable' },
    ],
  },
];

export const mockHistory: HistoryLog[] = [
  {
    id: 'h1',
    vehicleId: '1',
    vehicleName: 'Toyota Hilux (ABCD-12)',
    action: 'document_renewed',
    field: 'Revisión Técnica',
    oldValue: '2024-06-15',
    newValue: '2025-01-15',
    details: 'Renovación de certificado de revisión técnica',
    timestamp: subtractDays(30),
    user: 'Admin',
  },
  {
    id: 'h2',
    vehicleId: '2',
    vehicleName: 'Chevrolet NQR (EFGH-34)',
    action: 'vehicle_updated',
    field: 'Proyecto',
    oldValue: 'Proyecto Este',
    newValue: 'Proyecto Sur',
    details: 'Cambio de asignación de proyecto',
    timestamp: subtractDays(15),
    user: 'Admin',
  },
  {
    id: 'h3',
    vehicleId: '3',
    vehicleName: 'Mercedes-Benz Sprinter (IJKL-56)',
    action: 'vehicle_created',
    details: 'Nuevo vehículo agregado al sistema',
    timestamp: subtractDays(60),
    user: 'Admin',
  },
  {
    id: 'h4',
    vehicleId: '4',
    vehicleName: 'Ford Ranger (MNOP-78)',
    action: 'document_added',
    field: 'SOAP',
    details: 'Seguro obligatorio agregado al vehículo',
    timestamp: subtractDays(45),
    user: 'Admin',
  },
  {
    id: 'h5',
    vehicleId: '6',
    vehicleName: 'Isuzu D-Max (UVWX-12)',
    action: 'vehicle_created',
    details: 'Nuevo vehículo agregado al sistema',
    timestamp: subtractDays(120),
    user: 'Admin',
  },
];
