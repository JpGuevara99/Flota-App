import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
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

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

type ApiDocument = Omit<Document, 'expirationDate' | 'issueDate' | 'lastRenewalDate'> & {
  expirationDate: string;
  issueDate: string;
  lastRenewalDate?: string | null;
};

type ApiVehicle = Omit<Vehicle, 'createdAt' | 'updatedAt' | 'documents'> & {
  createdAt: string;
  updatedAt: string;
  documents: ApiDocument[];
};

type ApiHistoryLog = Omit<HistoryLog, 'timestamp'> & { timestamp: string };

const mapApiDocument = (d: ApiDocument): Document => ({
  ...d,
  expirationDate: new Date(d.expirationDate),
  issueDate: new Date(d.issueDate),
  lastRenewalDate: d.lastRenewalDate ? new Date(d.lastRenewalDate) : undefined,
});

const mapApiVehicle = (v: ApiVehicle): Vehicle => ({
  ...v,
  createdAt: new Date(v.createdAt),
  updatedAt: new Date(v.updatedAt),
  documents: (v.documents ?? []).map(mapApiDocument),
});

const mapApiHistoryLog = (h: ApiHistoryLog): HistoryLog => ({
  ...h,
  timestamp: new Date(h.timestamp),
});

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    throw new Error(`API error ${res.status}: ${JSON.stringify(payload)}`);
  }

  return res.json() as Promise<T>;
}

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
  const [backendEnabled, setBackendEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [{ vehicles: apiVehicles }, { history: apiHistory }] = await Promise.all([
          apiFetch<{ vehicles: ApiVehicle[] }>('/api/vehicles'),
          apiFetch<{ history: ApiHistoryLog[] }>('/api/history?limit=500'),
        ]);

        if (cancelled) return;
        setVehicles((apiVehicles ?? []).map(mapApiVehicle));
        setHistory((apiHistory ?? []).map(mapApiHistoryLog));
        setBackendEnabled(true);
      } catch (e) {
        // Backend no disponible: seguimos con mocks en memoria.
        console.warn('Backend not available, using mock data', e);
        if (cancelled) return;
        setBackendEnabled(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!backendEnabled) {
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
      return;
    }

    (async () => {
      try {
        const { vehicle, historyLogs } = await apiFetch<{ vehicle: ApiVehicle; historyLogs: ApiHistoryLog[] }>(
          '/api/vehicles',
          { method: 'POST', body: JSON.stringify(vehicleData) }
        );
        const mappedVehicle = mapApiVehicle(vehicle);
        setVehicles(prev => [...prev, mappedVehicle]);
        setHistory(prev => (historyLogs ?? []).map(mapApiHistoryLog).concat(prev));
      } catch (e) {
        console.error('addVehicle failed, falling back to local state', e);
        const newVehicle: Vehicle = {
          ...vehicleData,
          id: generateId(),
          documents: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setVehicles(prev => [...prev, newVehicle]);
        addHistoryLog('vehicle_created', newVehicle.id, `${newVehicle.brand} ${newVehicle.model} (${newVehicle.licensePlate})`, undefined, undefined, undefined, 'Nuevo vehículo agregado al sistema');
      }
    })();
  }, [addHistoryLog, backendEnabled]);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    if (!backendEnabled) {
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
      return;
    }

    (async () => {
      try {
        const { vehicle, historyLogs } = await apiFetch<{ vehicle: ApiVehicle; historyLogs: ApiHistoryLog[] }>(
          `/api/vehicles/${id}`,
          { method: 'PATCH', body: JSON.stringify(updates) }
        );
        const mapped = mapApiVehicle(vehicle);
        setVehicles(prev => prev.map(v => (v.id === id ? mapped : v)));
        setHistory(prev => (historyLogs ?? []).map(mapApiHistoryLog).concat(prev));
      } catch (e) {
        console.error('updateVehicle failed, falling back to local state', e);
        setBackendEnabled(false);
      }
    })();
  }, [addHistoryLog, backendEnabled]);

  const deleteVehicle = useCallback((id: string) => {
    if (!backendEnabled) {
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
      return;
    }

    (async () => {
      try {
        const { historyLogs } = await apiFetch<{ ok: boolean; historyLogs: ApiHistoryLog[] }>(`/api/vehicles/${id}`, {
          method: 'DELETE',
        });
        setVehicles(prev => prev.filter(v => v.id !== id));
        setHistory(prev => (historyLogs ?? []).map(mapApiHistoryLog).concat(prev));
      } catch (e) {
        console.error('deleteVehicle failed, falling back to local state', e);
        setBackendEnabled(false);
      }
    })();
  }, [vehicles, addHistoryLog, backendEnabled]);

  const addDocument = useCallback((vehicleId: string, documentData: Omit<Document, 'id'>) => {
    if (!backendEnabled) {
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
      return;
    }

    (async () => {
      try {
        const { vehicle, historyLogs } = await apiFetch<{ vehicle: ApiVehicle | null; historyLogs: ApiHistoryLog[] }>(
          `/api/vehicles/${vehicleId}/documents`,
          { method: 'POST', body: JSON.stringify(documentData) }
        );
        if (vehicle) {
          const mapped = mapApiVehicle(vehicle);
          setVehicles(prev => prev.map(v => (v.id === vehicleId ? mapped : v)));
        }
        setHistory(prev => (historyLogs ?? []).map(mapApiHistoryLog).concat(prev));
      } catch (e) {
        console.error('addDocument failed, falling back to local state', e);
        setBackendEnabled(false);
      }
    })();
  }, [addHistoryLog, backendEnabled]);

  const renewDocument = useCallback((vehicleId: string, documentId: string, updates: Partial<Document>) => {
    if (!backendEnabled) {
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
      return;
    }

    (async () => {
      try {
        const { vehicle, historyLogs } = await apiFetch<{ vehicle: ApiVehicle | null; historyLogs: ApiHistoryLog[] }>(
          `/api/vehicles/${vehicleId}/documents/${documentId}`,
          { method: 'PATCH', body: JSON.stringify(updates) }
        );
        if (vehicle) {
          const mapped = mapApiVehicle(vehicle);
          setVehicles(prev => prev.map(v => (v.id === vehicleId ? mapped : v)));
        }
        setHistory(prev => (historyLogs ?? []).map(mapApiHistoryLog).concat(prev));
      } catch (e) {
        console.error('renewDocument failed, falling back to local state', e);
        setBackendEnabled(false);
      }
    })();
  }, [addHistoryLog, backendEnabled]);

  const deleteDocument = useCallback((vehicleId: string, documentId: string) => {
    if (!backendEnabled) {
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
      return;
    }

    (async () => {
      try {
        const { vehicle, historyLogs } = await apiFetch<{ vehicle: ApiVehicle | null; historyLogs: ApiHistoryLog[] }>(
          `/api/vehicles/${vehicleId}/documents/${documentId}`,
          { method: 'DELETE' }
        );
        if (vehicle) {
          const mapped = mapApiVehicle(vehicle);
          setVehicles(prev => prev.map(v => (v.id === vehicleId ? mapped : v)));
        }
        setHistory(prev => (historyLogs ?? []).map(mapApiHistoryLog).concat(prev));
      } catch (e) {
        console.error('deleteDocument failed, falling back to local state', e);
        setBackendEnabled(false);
      }
    })();
  }, [addHistoryLog, backendEnabled]);

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
