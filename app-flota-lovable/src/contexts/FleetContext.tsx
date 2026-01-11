import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Vehicle, HistoryLog, Document, HistoryAction, generateId, DOCUMENT_TYPE_LABELS } from '@/types/vehicle';
import { mockVehicles, mockHistory } from '@/data/mockVehicles';

interface FleetContextType {
  vehicles: Vehicle[];
  history: HistoryLog[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addDocument: (vehicleId: string, document: Omit<Document, 'id'>) => void;
  renewDocument: (vehicleId: string, documentId: string, updates: Partial<Document>) => void;
  deleteDocument: (vehicleId: string, documentId: string) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};

export const FleetProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [history, setHistory] = useState<HistoryLog[]>(mockHistory);

  const addHistoryLog = useCallback((
    action: HistoryAction,
    vehicleId?: string,
    vehicleName?: string,
    field?: string,
    oldValue?: string,
    newValue?: string,
    details?: string
  ) => {
    const log: HistoryLog = {
      id: generateId(),
      vehicleId,
      vehicleName,
      action,
      field,
      oldValue,
      newValue,
      details,
      timestamp: new Date(),
      user: 'Admin',
    };
    setHistory(prev => [log, ...prev]);
  }, []);

  const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: generateId(),
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setVehicles(prev => [...prev, newVehicle]);
    addHistoryLog(
      'vehicle_created',
      newVehicle.id,
      `${newVehicle.brand} ${newVehicle.model} (${newVehicle.licensePlate})`,
      undefined,
      undefined,
      undefined,
      'Nuevo vehículo agregado al sistema'
    );
  }, [addHistoryLog]);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, ...updates, updatedAt: new Date() };
        
        // Log changes for each field
        Object.keys(updates).forEach(key => {
          if (key !== 'updatedAt' && key !== 'documents') {
            const oldVal = String(v[key as keyof Vehicle]);
            const newVal = String(updates[key as keyof Vehicle]);
            if (oldVal !== newVal) {
              addHistoryLog(
                'vehicle_updated',
                id,
                `${updated.brand} ${updated.model} (${updated.licensePlate})`,
                key,
                oldVal,
                newVal,
                `Campo "${key}" actualizado`
              );
            }
          }
        });
        
        return updated;
      }
      return v;
    }));
  }, [addHistoryLog]);

  const deleteVehicle = useCallback((id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      addHistoryLog(
        'vehicle_deleted',
        id,
        `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`,
        undefined,
        undefined,
        undefined,
        'Vehículo eliminado del sistema'
      );
    }
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, [vehicles, addHistoryLog]);

  const addDocument = useCallback((vehicleId: string, documentData: Omit<Document, 'id'>) => {
    const newDocument: Document = {
      ...documentData,
      id: generateId(),
    };
    
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        addHistoryLog(
          'document_added',
          vehicleId,
          `${v.brand} ${v.model} (${v.licensePlate})`,
          DOCUMENT_TYPE_LABELS[documentData.type],
          undefined,
          undefined,
          `Documento "${documentData.name}" agregado`
        );
        return {
          ...v,
          documents: [...v.documents, newDocument],
          updatedAt: new Date(),
        };
      }
      return v;
    }));
  }, [addHistoryLog]);

  const renewDocument = useCallback((vehicleId: string, documentId: string, updates: Partial<Document>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const updatedDocs = v.documents.map(d => {
          if (d.id === documentId) {
            const oldExpDate = d.expirationDate.toISOString().split('T')[0];
            const newExpDate = updates.expirationDate ? new Date(updates.expirationDate).toISOString().split('T')[0] : oldExpDate;
            
            addHistoryLog(
              'document_renewed',
              vehicleId,
              `${v.brand} ${v.model} (${v.licensePlate})`,
              d.name,
              oldExpDate,
              newExpDate,
              `Documento renovado - Nueva fecha de expiración: ${newExpDate}`
            );
            
            return { ...d, ...updates, lastRenewalDate: new Date() };
          }
          return d;
        });
        return { ...v, documents: updatedDocs, updatedAt: new Date() };
      }
      return v;
    }));
  }, [addHistoryLog]);

  const deleteDocument = useCallback((vehicleId: string, documentId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const doc = v.documents.find(d => d.id === documentId);
        if (doc) {
          addHistoryLog(
            'document_deleted',
            vehicleId,
            `${v.brand} ${v.model} (${v.licensePlate})`,
            doc.name,
            undefined,
            undefined,
            `Documento "${doc.name}" eliminado`
          );
        }
        return {
          ...v,
          documents: v.documents.filter(d => d.id !== documentId),
          updatedAt: new Date(),
        };
      }
      return v;
    }));
  }, [addHistoryLog]);

  return (
    <FleetContext.Provider value={{
      vehicles,
      history,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addDocument,
      renewDocument,
      deleteDocument,
    }}>
      {children}
    </FleetContext.Provider>
  );
};
