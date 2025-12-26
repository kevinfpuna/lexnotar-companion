import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Clock,
  FileText 
} from 'lucide-react';
import { TipoTrabajo, CategoriaTrabajo } from '@/types';
import { TipoTrabajoForm } from '@/components/forms/TipoTrabajoForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { formatCurrency } from '@/lib/mockData';
import { categoriasDefault } from '@/hooks/useCategorias';

interface TiposTrabajoTabProps {
  tiposTrabajo: TipoTrabajo[];
  categorias?: CategoriaTrabajo[];
  onAdd: (tipo: Omit<TipoTrabajo, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  onUpdate: (id: string, updates: Partial<TipoTrabajo>) => void;
  onToggleActivo: (id: string) => void;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
}

const categoriaBadgeColors: Record<TipoTrabajo['categoria'], string> = {
  'Notarial Unilateral': 'bg-blue-100 text-blue-800',
  'Notarial Bilateral': 'bg-purple-100 text-purple-800',
  'Judicial': 'bg-amber-100 text-amber-800',
  'Administrativo': 'bg-green-100 text-green-800',
  'Otro': 'bg-gray-100 text-gray-800',
};

export function TiposTrabajoTab({ 
  tiposTrabajo, 
  categorias = categoriasDefault,
  onAdd, 
  onUpdate, 
  onToggleActivo, 
  onDelete,
  onClone 
}: TiposTrabajoTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoTrabajo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleEdit = (tipo: TipoTrabajo) => {
    setEditingTipo(tipo);
    setFormOpen(true);
  };

  const handleSubmit = (data: Omit<TipoTrabajo, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    if (editingTipo) {
      onUpdate(editingTipo.id, data);
    } else {
      onAdd(data);
    }
    setEditingTipo(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Tipos de Trabajo</h3>
          <p className="text-sm text-muted-foreground">
            Define los tipos de trabajos con sus pasos predefinidos
          </p>
        </div>
        <Button onClick={() => { setEditingTipo(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo tipo
        </Button>
      </div>

      <div className="space-y-3">
        {tiposTrabajo.map((tipo) => (
          <Card key={tipo.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium">{tipo.nombre}</h4>
                  <Badge className={categoriaBadgeColors[tipo.categoria]}>
                    {tipo.categoria}
                  </Badge>
                  <Badge variant={tipo.activo ? 'default' : 'secondary'}>
                    {tipo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {tipo.descripcion}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tipo.tiempoEstimadoDias} días
                  </span>
                  <span>{formatCurrency(tipo.precioSugerido)}</span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {tipo.pasosPredefinidos.length} pasos
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedId(expandedId === tipo.id ? null : tipo.id)}
                >
                  {expandedId === tipo.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onClone(tipo.id)}
                  title="Clonar tipo"
                >
                  <Copy className="h-4 w-4" />
                </Button>
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
                  onClick={() => handleEdit(tipo)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setDeleteId(tipo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedId === tipo.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {tipo.documentosRequeridos.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Documentos requeridos:</h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {tipo.documentosRequeridos.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {tipo.pasosPredefinidos.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Pasos predefinidos:</h5>
                    <div className="space-y-2">
                      {tipo.pasosPredefinidos.map((paso) => (
                        <div key={paso.numero} className="text-sm p-2 bg-muted rounded flex items-center justify-between">
                          <div>
                            <span className="font-medium">{paso.numero}. {paso.nombre}</span>
                            {paso.opcional && (
                              <Badge variant="outline" className="ml-2 text-xs">Opcional</Badge>
                            )}
                            <p className="text-muted-foreground text-xs mt-0.5">{paso.descripcion}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {paso.diasEstimados} días
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}

        {tiposTrabajo.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No hay tipos de trabajo definidos. Crea uno para comenzar.
            </p>
          </Card>
        )}
      </div>

      <TipoTrabajoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        tipoTrabajo={editingTipo}
        categorias={categorias}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Tipo de Trabajo"
        description="¿Estás seguro de que deseas eliminar este tipo de trabajo? Los trabajos existentes de este tipo mantendrán sus datos."
      />
    </div>
  );
}
