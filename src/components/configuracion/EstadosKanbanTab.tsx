import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Lock,
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EstadoKanban } from '@/hooks/useTipos';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EstadosKanbanTabProps {
  estadosKanban: EstadoKanban[];
  onAdd: (nombre: string, color: string) => void;
  onUpdate: (id: string, updates: Partial<EstadoKanban>) => void;
  onDelete: (id: string) => void;
  onReorder: (newOrder: EstadoKanban[]) => void;
}

const colorOptions = [
  { value: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Gris', preview: 'bg-slate-400' },
  { value: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Azul', preview: 'bg-blue-400' },
  { value: 'bg-green-100 text-green-800 border-green-200', label: 'Verde', preview: 'bg-green-400' },
  { value: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Ámbar', preview: 'bg-amber-400' },
  { value: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Naranja', preview: 'bg-orange-400' },
  { value: 'bg-red-100 text-red-800 border-red-200', label: 'Rojo', preview: 'bg-red-400' },
  { value: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Púrpura', preview: 'bg-purple-400' },
  { value: 'bg-pink-100 text-pink-800 border-pink-200', label: 'Rosa', preview: 'bg-pink-400' },
  { value: 'bg-cyan-100 text-cyan-800 border-cyan-200', label: 'Cian', preview: 'bg-cyan-400' },
];

function SortableEstadoItem({ 
  estado, 
  onEdit, 
  onDelete,
}: { 
  estado: EstadoKanban; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: estado.id, disabled: estado.fijo });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className={`touch-none ${estado.fijo ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing'}`}
        disabled={estado.fijo}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className={`w-3 h-3 rounded-full ${colorOptions.find(c => c.value === estado.color)?.preview || 'bg-gray-400'}`} />
      
      <span className="flex-1 font-medium">{estado.nombre}</span>
      
      {estado.fijo && (
        <Badge variant="outline" className="gap-1">
          <Lock className="h-3 w-3" />
          Fijo
        </Badge>
      )}
      
      <div className="flex items-center gap-1">
        {!estado.fijo && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function EstadosKanbanTab({ 
  estadosKanban, 
  onAdd, 
  onUpdate, 
  onDelete,
  onReorder,
}: EstadosKanbanTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingEstado, setEditingEstado] = useState<EstadoKanban | null>(null);
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState(colorOptions[1].value);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenForm = (estado?: EstadoKanban) => {
    if (estado) {
      setEditingEstado(estado);
      setNombre(estado.nombre);
      setColor(estado.color);
    } else {
      setEditingEstado(null);
      setNombre('');
      setColor(colorOptions[1].value);
    }
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (editingEstado) {
      onUpdate(editingEstado.id, { nombre: nombre.trim(), color });
      toast.success('Estado actualizado');
    } else {
      onAdd(nombre.trim(), color);
      toast.success('Estado creado');
    }

    setFormOpen(false);
    setEditingEstado(null);
    setNombre('');
  };

  const handleDelete = (id: string) => {
    const estado = estadosKanban.find(e => e.id === id);
    if (estado?.fijo) {
      toast.error('No se puede eliminar un estado fijo');
      return;
    }
    onDelete(id);
    toast.success('Estado eliminado');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = estadosKanban.findIndex(e => e.id === active.id);
      const newIndex = estadosKanban.findIndex(e => e.id === over.id);
      const reordered = arrayMove(estadosKanban, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Estados del Kanban</h3>
          <p className="text-sm text-muted-foreground">
            Personaliza las columnas del tablero Kanban. "Pendiente" y "Completado" son fijos. Arrastra para reordenar.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo estado
        </Button>
      </div>

      <Card className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={estadosKanban.map(e => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {estadosKanban.map((estado) => (
                <SortableEstadoItem
                  key={estado.id}
                  estado={estado}
                  onEdit={() => handleOpenForm(estado)}
                  onDelete={() => handleDelete(estado.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <p className="text-xs text-muted-foreground mt-4">
          Los ítems se mueven entre estos estados en el tablero Kanban. 
          Los estados personalizados se insertan entre "Pendiente" y "Completado".
        </p>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del estado</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: En revisión"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      color === option.value 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${option.preview}`} />
                    <span className="text-sm">{option.label}</span>
                    {color === option.value && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingEstado ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
