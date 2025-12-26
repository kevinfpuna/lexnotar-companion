import { useState } from 'react';
import { 
  itemsMock, 
  getTrabajoById, 
  getClienteById, 
  formatCurrency,
  formatDate
} from '@/lib/mockData';
import { EstadoItem, Item } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, User, Briefcase } from 'lucide-react';

const columns: { id: EstadoItem; title: string; color: string }[] = [
  { id: 'Pendiente', title: 'Pendiente', color: 'bg-warning/10 border-warning/20' },
  { id: 'En proceso', title: 'En Proceso', color: 'bg-info/10 border-info/20' },
  { id: 'Mesa entrada', title: 'Mesa Entrada', color: 'bg-primary/10 border-primary/20' },
  { id: 'Mesa salida', title: 'Mesa Salida', color: 'bg-info/10 border-info/20' },
  { id: 'Listo retirar', title: 'Listo Retirar', color: 'bg-success/10 border-success/20' },
  { id: 'Completado', title: 'Completado', color: 'bg-muted border-border' },
];

export default function KanbanBoard() {
  const [items, setItems] = useState<Item[]>(itemsMock);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);

  const getItemsByStatus = (status: EstadoItem) => {
    return items.filter(item => item.estado === status);
  };

  const handleDragStart = (e: React.DragEvent, item: Item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: EstadoItem) => {
    e.preventDefault();
    if (!draggedItem) return;

    setItems(prev => prev.map(item => 
      item.id === draggedItem.id 
        ? { ...item, estado: newStatus, fechaActualizacion: new Date() }
        : item
    ));
    setDraggedItem(null);
  };

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
                      onDragStart={(e) => handleDragStart(e, item)}
                      className={cn(
                        "bg-card rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing",
                        "hover:shadow-md transition-shadow",
                        draggedItem?.id === item.id && "opacity-50"
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
    </div>
  );
}
