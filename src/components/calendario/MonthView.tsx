import { useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  format 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { EventoCalendario, TipoEvento } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  DndContext, 
  DragEndEvent, 
  useSensor, 
  useSensors, 
  PointerSensor,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

interface MonthViewProps {
  currentDate: Date;
  eventos: EventoCalendario[];
  selectedDate: Date | undefined;
  onDateClick: (date: Date) => void;
  onEventClick: (evento: EventoCalendario) => void;
  onEventDrop: (eventoId: string, newDate: Date) => Promise<void>;
}

const tipoColors: Record<TipoEvento, string> = {
  'Inicio': 'bg-info/20 text-info border-info/30',
  'Fin estimada': 'bg-warning/20 text-warning border-warning/30',
  'Fin real': 'bg-success/20 text-success border-success/30',
  'Recordatorio': 'bg-primary/20 text-primary border-primary/30',
  'Cita personal': 'bg-muted text-muted-foreground border-border',
  'Vencimiento': 'bg-destructive/20 text-destructive border-destructive/30',
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Draggable event component
function DraggableEvent({ evento, onClick }: { evento: EventoCalendario; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: evento.id,
    data: { evento },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "text-xs px-1.5 py-0.5 rounded border truncate cursor-grab active:cursor-grabbing",
        tipoColors[evento.tipoEvento],
        isDragging && "opacity-50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {evento.tituloEvento}
    </div>
  );
}

// Droppable day cell
function DroppableDay({ 
  day, 
  isCurrentMonth, 
  isSelected,
  dayEvents,
  onDateClick,
  onEventClick,
}: { 
  day: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  dayEvents: EventoCalendario[];
  onDateClick: (date: Date) => void;
  onEventClick: (evento: EventoCalendario) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: day.toISOString(),
    data: { date: day },
  });

  const today = isToday(day);
  const visibleEvents = dayEvents.slice(0, 3);
  const moreCount = dayEvents.length - 3;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] p-1 border-r border-b border-border transition-colors cursor-pointer",
        !isCurrentMonth && "bg-muted/30",
        isSelected && "bg-primary/10",
        isOver && "bg-primary/20",
        "hover:bg-muted/50"
      )}
      onClick={() => onDateClick(day)}
    >
      <div className={cn(
        "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
        today && "bg-primary text-primary-foreground",
        !today && !isCurrentMonth && "text-muted-foreground"
      )}>
        {format(day, 'd')}
      </div>
      
      <div className="space-y-0.5">
        {visibleEvents.map((evento) => (
          <DraggableEvent 
            key={evento.id} 
            evento={evento} 
            onClick={() => onEventClick(evento)}
          />
        ))}
        {moreCount > 0 && (
          <div className="text-xs text-muted-foreground px-1">
            +{moreCount} más
          </div>
        )}
      </div>
    </div>
  );
}

export function MonthView({ 
  currentDate, 
  eventos, 
  selectedDate,
  onDateClick, 
  onEventClick, 
  onEventDrop 
}: MonthViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EventoCalendario[]> = {};
    eventos.forEach(evento => {
      const key = format(evento.fechaEvento, 'yyyy-MM-dd');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(evento);
    });
    return grouped;
  }, [eventos]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const eventoId = active.id as string;
    const newDate = new Date(over.id as string);
    
    // Only move if dropped on a different day
    const oldEvento = eventos.find(e => e.id === eventoId);
    if (oldEvento && !isSameDay(oldEvento.fechaEvento, newDate)) {
      await onEventDrop(eventoId, newDate);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {WEEKDAYS.map((day) => (
            <div 
              key={day} 
              className="py-2 text-center text-sm font-medium text-muted-foreground border-r border-b border-border last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <DroppableDay
                key={dateKey}
                day={day}
                isCurrentMonth={isCurrentMonth}
                isSelected={isSelected}
                dayEvents={dayEvents}
                onDateClick={onDateClick}
                onEventClick={onEventClick}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
