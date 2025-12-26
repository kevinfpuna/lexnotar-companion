import { useState } from 'react';
import { TipoDocumento } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TiposDocumentoTabProps {
  tiposDocumento: TipoDocumento[];
  onAdd: (nombre: string, descripcion: string) => void;
  onUpdate: (id: string, updates: Partial<TipoDocumento>) => void;
  onToggleActivo: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TiposDocumentoTab({
  tiposDocumento,
  onAdd,
  onUpdate,
  onToggleActivo,
  onDelete,
}: TiposDocumentoTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoDocumento | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleOpenForm = (tipo?: TipoDocumento) => {
    if (tipo) {
      setEditingTipo(tipo);
      setNombre(tipo.nombre);
      setDescripcion(tipo.descripcion);
    } else {
      setEditingTipo(null);
      setNombre('');
      setDescripcion('');
    }
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (editingTipo) {
      onUpdate(editingTipo.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      });
    } else {
      onAdd(nombre.trim(), descripcion.trim());
    }

    setFormOpen(false);
    setEditingTipo(null);
    setNombre('');
    setDescripcion('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tipos de Documentos</h3>
          <p className="text-sm text-muted-foreground">
            Define los tipos de documentos que manejas
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo tipo
        </Button>
      </div>

      <div className="grid gap-3">
        {tiposDocumento.map((tipo) => (
          <Card key={tipo.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{tipo.nombre}</h4>
                  <Badge variant={tipo.activo ? 'default' : 'secondary'}>
                    {tipo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                {tipo.descripcion && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {tipo.descripcion}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleActivo(tipo.id)}
                  title={tipo.activo ? 'Desactivar' : 'Activar'}
                >
                  {tipo.activo ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenForm(tipo)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm('¿Eliminar este tipo de documento?')) {
                      onDelete(tipo.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTipo ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: RUC, Pasaporte, Certificado..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del tipo de documento..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTipo ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
