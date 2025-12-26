import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoriaTrabajo } from '@/types';
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
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';

interface CategoriasTrabajoTabProps {
  categorias: CategoriaTrabajo[];
  onAdd: (nombre: string, descripcion: string, color: string) => void;
  onUpdate: (id: string, updates: Partial<CategoriaTrabajo>) => void;
  onDelete: (id: string) => void;
  onToggleActivo: (id: string) => void;
  onReorder: (newOrder: CategoriaTrabajo[]) => void;
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

function SortableCategoriaItem({ 
  categoria, 
  onEdit, 
  onDelete,
  onToggleActivo,
}: { 
  categoria: CategoriaTrabajo; 
  onEdit: () => void;
  onDelete: () => void;
  onToggleActivo: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoria.id });

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
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className={`w-3 h-3 rounded-full ${colorOptions.find(c => c.value === categoria.color)?.preview || 'bg-gray-400'}`} />
      
      <div className="flex-1 min-w-0">
        <span className="font-medium">{categoria.nombre}</span>
        {categoria.descripcion && (
          <p className="text-xs text-muted-foreground truncate">{categoria.descripcion}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Switch 
          checked={categoria.activo} 
          onCheckedChange={onToggleActivo}
          aria-label="Activo"
        />
        
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
      </div>
    </div>
  );
}

export function CategoriasTrabajoTab({ 
  categorias, 
  onAdd, 
  onUpdate, 
  onDelete,
  onToggleActivo,
  onReorder,
}: CategoriasTrabajoTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaTrabajo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState(colorOptions[1].value);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenForm = (categoria?: CategoriaTrabajo) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion);
      setColor(categoria.color);
    } else {
      setEditingCategoria(null);
      setNombre('');
      setDescripcion('');
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

    if (editingCategoria) {
      onUpdate(editingCategoria.id, { nombre: nombre.trim(), descripcion: descripcion.trim(), color });
      toast.success('Categoría actualizada');
    } else {
      onAdd(nombre.trim(), descripcion.trim(), color);
      toast.success('Categoría creada');
    }

    setFormOpen(false);
    setEditingCategoria(null);
    setNombre('');
    setDescripcion('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = categorias.findIndex(c => c.id === active.id);
      const newIndex = categorias.findIndex(c => c.id === over.id);
      const reordered = arrayMove(categorias, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      toast.success('Categoría eliminada');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Categorías de Trabajo</h3>
          <p className="text-sm text-muted-foreground">
            Organiza los tipos de trabajo por categorías. Arrastra para reordenar.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva categoría
        </Button>
      </div>

      <Card className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={categorias.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categorias.map((categoria) => (
                <SortableCategoriaItem
                  key={categoria.id}
                  categoria={categoria}
                  onEdit={() => handleOpenForm(categoria)}
                  onDelete={() => setDeleteId(categoria.id)}
                  onToggleActivo={() => onToggleActivo(categoria.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {categorias.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay categorías. Crea una para comenzar.
          </p>
        )}
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Notarial Unilateral"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción de la categoría..."
                rows={2}
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
                {editingCategoria ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Los tipos de trabajo asociados mantendrán su categoría actual."
      />
    </div>
  );
}
