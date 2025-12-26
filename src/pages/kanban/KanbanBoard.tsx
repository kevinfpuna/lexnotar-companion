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
  const [dragOverColumn, setDragOverColumn] = useState<EstadoItem | null>(null);

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

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: EstadoItem) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: EstadoItem) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const item = items.find(i => i.id === draggedItemId);
    if (item && item.estado !== newStatus) {
      await updateItemEstado(draggedItemId, newStatus);
    }
    setDraggedItemId(null);
    setDragOverColumn(null);
  };

  const handleQuickStatusChange = async (itemId: string, newStatus: EstadoItem) => {
    await updateItemEstado(itemId, newStatus);
  };

  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) : null;
  const selectedTrabajo = selectedItem ? getTrabajoById(selectedItem.trabajoId) : null;
  const selectedCliente = selectedTrabajo ? getClienteById(selectedTrabajo.clienteId) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex-shrink-0 pb-3 md:pb-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Kanban de Pasos</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-1">
          Arrastra y suelta para cambiar el estado
        </p>
      </div>

      {/* Kanban board - scrollable container */}
      <div className="flex-1 overflow-auto scrollbar-thin -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 min-h-full pb-4">
          {columns.map((column) => {
            const columnItems = getItemsByStatus(column.id);
            const isDropTarget = dragOverColumn === column.id && draggedItemId !== null;
            
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-64 md:w-72 flex flex-col"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column header */}
                <div className={cn(
                  "rounded-t-lg border p-2.5 md:p-3 font-semibold flex items-center justify-between text-sm md:text-base flex-shrink-0",
                  column.color
                )}>
                  <span className="truncate">{column.title}</span>
                  <span className="text-xs md:text-sm font-normal text-muted-foreground ml-2">
                    {columnItems.length}
                  </span>
                </div>

                {/* Column content */}
                <div className={cn(
                  "rounded-b-lg border border-t-0 flex-1 p-1.5 md:p-2 space-y-1.5 md:space-y-2 transition-all duration-200 overflow-y-auto scrollbar-thin",
                  isDropTarget 
                    ? "bg-primary/10 border-primary border-dashed border-2" 
                    : "bg-muted/30"
                )}>
                  {columnItems.map((item) => {
                    const trabajo = getTrabajoById(item.trabajoId);
                    const cliente = trabajo ? getClienteById(trabajo.clienteId) : null;
                    const isDragging = draggedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedItemId(item.id)}
                        className={cn(
                          "bg-card rounded-lg border border-border p-2.5 md:p-3 cursor-grab active:cursor-grabbing",
                          "hover:shadow-md transition-all duration-200",
                          isDragging && "opacity-50 scale-105 rotate-2 shadow-lg"
                        )}
                      >
                        <h4 className="font-medium text-xs md:text-sm mb-1.5 md:mb-2 truncate">{item.nombreItem}</h4>
                        
                        <div className="space-y-1 text-[10px] md:text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{cliente?.nombreCompleto}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 shrink-0" />
                            <span className="truncate">{trabajo?.nombreTrabajo}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{item.diasEstimados} días</span>
                          </div>
                        </div>

                        {item.saldo > 0 && (
                          <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-border">
                            <span className="text-[10px] md:text-xs font-medium text-destructive">
                              {formatCurrency(item.saldo)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {columnItems.length === 0 && (
                    <div className={cn(
                      "h-20 md:h-24 flex items-center justify-center text-xs md:text-sm text-muted-foreground rounded-lg border-2 border-dashed",
                      isDropTarget ? "border-primary bg-primary/5" : "border-transparent"
                    )}>
                      {isDropTarget ? "Soltar aquí" : "Sin items"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
