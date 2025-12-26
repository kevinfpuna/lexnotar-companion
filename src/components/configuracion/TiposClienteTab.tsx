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
  ChevronUp 
} from 'lucide-react';
import { TipoCliente } from '@/types';
import { TipoClienteForm } from '@/components/forms/TipoClienteForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { formatDate } from '@/lib/mockData';

interface TiposClienteTabProps {
  tiposCliente: TipoCliente[];
  onAdd: (tipo: Omit<TipoCliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  onUpdate: (id: string, updates: Partial<TipoCliente>) => void;
  onToggleActivo: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TiposClienteTab({ 
  tiposCliente, 
  onAdd, 
  onUpdate, 
  onToggleActivo, 
  onDelete 
}: TiposClienteTabProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoCliente | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleEdit = (tipo: TipoCliente) => {
    setEditingTipo(tipo);
    setFormOpen(true);
  };

  const handleSubmit = (data: Omit<TipoCliente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
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
          <h3 className="font-semibold">Tipos de Cliente</h3>
          <p className="text-sm text-muted-foreground">
            Define los tipos de clientes y sus campos personalizados
          </p>
        </div>
        <Button onClick={() => { setEditingTipo(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo tipo
        </Button>
      </div>

      <div className="space-y-3">
        {tiposCliente.map((tipo) => (
          <Card key={tipo.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium">{tipo.nombre}</h4>
                  <Badge variant={tipo.activo ? 'default' : 'secondary'}>
                    {tipo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {tipo.descripcion}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {Object.keys(tipo.camposCustom).length} campos personalizados
                </p>
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

            {expandedId === tipo.id && Object.keys(tipo.camposCustom).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="text-sm font-medium mb-2">Campos personalizados:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(tipo.camposCustom).map(([key, campo]) => (
                    <div key={key} className="text-sm p-2 bg-muted rounded">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground ml-2">({campo.tipo})</span>
                      {campo.obligatorio && (
                        <Badge variant="outline" className="ml-2 text-xs">Requerido</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {tiposCliente.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No hay tipos de cliente definidos. Crea uno para comenzar.
            </p>
          </Card>
        )}
      </div>

      <TipoClienteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        tipoCliente={editingTipo}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Tipo de Cliente"
        description="¿Estás seguro de que deseas eliminar este tipo de cliente? Los clientes existentes de este tipo mantendrán sus datos."
      />
    </div>
  );
}
