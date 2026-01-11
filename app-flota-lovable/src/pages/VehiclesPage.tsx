import { useState } from 'react';
import { useFleet } from '@/contexts/FleetContext';
import { Vehicle, VehicleType } from '@/types/vehicle';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const VEHICLE_TYPES: VehicleType[] = ['Furgón', 'Camioneta', 'Auto'];

interface VehicleFormData {
  type: VehicleType | string;
  model: string;
  brand: string;
  year: number;
  licensePlate: string;
  project: string;
}

const emptyFormData: VehicleFormData = {
  type: 'Camioneta',
  model: '',
  brand: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  project: '',
};

const VehiclesPage = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFleet();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(emptyFormData);

  const handleOpenNew = () => {
    setFormData(emptyFormData);
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setFormData({
      type: vehicle.type,
      model: vehicle.model,
      brand: vehicle.brand,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      project: vehicle.project,
    });
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle);
    setIsDeleteOpen(true);
  };

  const handleSubmit = () => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, formData);
    } else {
      addVehicle(formData);
    }
    setIsFormOpen(false);
    setFormData(emptyFormData);
    setEditingVehicle(null);
  };

  const handleDelete = () => {
    if (deletingVehicle) {
      deleteVehicle(deletingVehicle.id);
    }
    setIsDeleteOpen(false);
    setDeletingVehicle(null);
  };

  const isFormValid = formData.model && formData.brand && formData.licensePlate && formData.project;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrar Vehículos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los vehículos de la flota
          </p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patente</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Documentos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-mono font-medium">{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.project}</TableCell>
                <TableCell>{vehicle.documents.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(vehicle)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(vehicle)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {vehicles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No hay vehículos registrados. Haz clic en "Nuevo Vehículo" para agregar uno.
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle 
                ? 'Modifica la información del vehículo.' 
                : 'Ingresa la información del nuevo vehículo.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Vehículo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as VehicleType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Ej: Toyota"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Ej: Hilux"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licensePlate">Patente</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                  placeholder="Ej: ABCD-12"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project">Proyecto Asignado</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                placeholder="Ej: Proyecto Norte"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              {editingVehicle ? 'Guardar Cambios' : 'Agregar Vehículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo{' '}
              <span className="font-semibold">
                {deletingVehicle?.brand} {deletingVehicle?.model} ({deletingVehicle?.licensePlate})
              </span>{' '}
              y todos sus documentos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehiclesPage;
