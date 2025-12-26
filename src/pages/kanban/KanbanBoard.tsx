import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/lib/mockData';
import { EstadoItem } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, User, Briefcase, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const columns: { id: EstadoItem; title: string; color: string }[] = [
  { id: 'Pendiente', title: 'Pendiente', color: 'bg-warning/10 border-warning/20' },
  { id: 'En proceso', title: 'En Proceso', color: 'bg-info/10 border-info/20' },
  { id: 'Mesa entrada', title: 'Mesa Entrada', color: 'bg-primary/10 border-primary/20' },
  { id: 'Mesa salida', title: 'Mesa Salida', color: 'bg-info/10 border-info/20' },
  { id: 'Listo retirar', title: 'Listo Retirar', color: 'bg-success/10 border-success/20' },
  { id: 'Completado', title: 'Completado', color: 'bg-muted border-border' },
];

const estadoItemOptions: EstadoItem[] = ['Pendiente', 'En proceso', 'Mesa entrada', 'Mesa salida', 'Listo retirar', 'Completado'];

export default function KanbanBoard() {
  const { items, trabajos, clientes, updateItemEstado, isLoading } = useApp();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Get trabajo by id helper
  const getTrabajoById = (id: string) => trabajos.find(t => t.id === id);
  const getClienteById = (id: string) => clientes.find(c => c.id === id);

  const getItemsByStatus = (status: EstadoItem) => {
    return items.filter(item => item.estado === status);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: EstadoItem) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const item = items.find(i => i.id === draggedItemId);
    if (item && item.estado !== newStatus) {
      await updateItemEstado(draggedItemId, newStatus);
    }
    setDraggedItemId(null);
  };

  const handleQuickStatusChange = async (itemId: string, newStatus: EstadoItem) => {
    await updateItemEstado(itemId, newStatus);
  };

  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) : null;
  const selectedTrabajo = selectedItem ? getTrabajoById(selectedItem.trabajoId) : null;
  const selectedCliente = selectedTrabajo ? getClienteById(selectedTrabajo.clienteId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Kanban de Pasos</h1>
        <p className="text-muted-foreground mt-1">
          Arrastra y suelta para cambiar el estado de los pasos
        </p>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((column) => {
          const columnItems = getItemsByStatus(column.id);
          
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column header */}
              <div className={cn(
                "rounded-t-lg border p-3 font-semibold flex items-center justify-between",
                column.color
              )}>
                <span>{column.title}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {columnItems.length}
                </span>
              </div>

              {/* Column content */}
              <div className="bg-muted/30 rounded-b-lg border border-t-0 min-h-[500px] p-2 space-y-2">
                {columnItems.map((item) => {
                  const trabajo = getTrabajoById(item.trabajoId);
                  const cliente = trabajo ? getClienteById(trabajo.clienteId) : null;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onClick={() => setSelectedItemId(item.id)}
                      className={cn(
                        "bg-card rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing",
                        "hover:shadow-md transition-shadow",
                        draggedItemId === item.id && "opacity-50"
                      )}
                    >
                      <h4 className="font-medium text-sm mb-2">{item.nombreItem}</h4>
                      
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span className="truncate">{cliente?.nombreCompleto}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3 w-3" />
                          <span className="truncate">{trabajo?.nombreTrabajo}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{item.diasEstimados} días</span>
                        </div>
                      </div>

                      {item.saldo > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <span className="text-xs font-medium text-destructive">
                            Saldo: {formatCurrency(item.saldo)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {columnItems.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                    Sin items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Dialog */}
      <Dialog open={!!selectedItemId} onOpenChange={(open) => !open && setSelectedItemId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.nombreItem}</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedCliente?.nombreCompleto}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trabajo</p>
                  <p className="font-medium">{selectedTrabajo?.nombreTrabajo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Costo</p>
                  <p className="font-medium">{formatCurrency(selectedItem.costoTotal)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Saldo</p>
                  <p className={cn("font-medium", selectedItem.saldo > 0 ? "text-destructive" : "text-success")}>
                    {formatCurrency(selectedItem.saldo)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Cambiar estado</p>
                <Select 
                  value={selectedItem.estado} 
                  onValueChange={(value) => handleQuickStatusChange(selectedItem.id, value as EstadoItem)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estadoItemOptions.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={`/trabajos/${selectedItem.trabajoId}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver trabajo completo
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
