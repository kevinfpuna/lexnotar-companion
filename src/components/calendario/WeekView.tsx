import { useMemo } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isToday,
  isSameDay,
  setHours,
  setMinutes,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { EventoCalendario, TipoEvento } from '@/types';
import { cn } from '@/lib/utils';
import { 
  DndContext, 
  DragEndEvent, 
  useSensor, 
  useSensors, 
  PointerSensor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

interface WeekViewProps {
  currentDate: Date;
  eventos: EventoCalendario[];
  selectedDate: Date | undefined;
  onDateClick: (date: Date) => void;
  onEventClick: (evento: EventoCalendario) => void;
  onEventDrop?: (eventoId: string, newDate: Date) => Promise<void>;
}

const tipoColors: Record<TipoEvento, string> = {
  'Inicio': 'bg-info/80 border-info text-info-foreground',
  'Fin estimada': 'bg-warning/80 border-warning text-warning-foreground',
  'Fin real': 'bg-success/80 border-success text-success-foreground',
  'Recordatorio': 'bg-primary/80 border-primary text-primary-foreground',
  'Cita personal': 'bg-muted border-border text-muted-foreground',
  'Vencimiento': 'bg-destructive/80 border-destructive text-destructive-foreground',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BUSINESS_HOURS_START = 7;
const BUSINESS_HOURS_END = 20;

// Draggable event component
function DraggableEvent({ 
  evento, 
  onClick 
}: { 
  evento: EventoCalendario; 
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: evento.id,
    data: { evento },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
  } : undefined;

  // Parse hora if exists, otherwise default to 9am
  let hour = 9;
  if (evento.horaEvento) {
    const [h] = evento.horaEvento.split(':').map(Number);
    hour = h;
  }
  
  const top = (hour / 24) * 100;
  const height = 4; // ~1 hour slot height

  return (
    <div
      ref={setNodeRef}
      style={{ 
        ...style,
        position: 'absolute',
        top: `${top}%`,
        height: `${height}%`,
        left: '2px',
        right: '2px',
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded px-1 py-0.5 text-xs cursor-grab active:cursor-grabbing truncate border-l-2",
        tipoColors[evento.tipoEvento],
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="font-medium">{evento.horaEvento || '09:00'}</span>
      {' '}{evento.tituloEvento}
    </div>
  );
}

// Droppable day column
function DroppableDay({ 
  day, 
  isSelected,
  dayEvents,
  onDateClick,
  onEventClick,
}: { 
  day: Date;
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

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "border-r border-border last:border-r-0 relative",
        isSelected && "bg-primary/5",
        isOver && "bg-primary/10"
      )}
    >
      {HOURS.map((hour) => (
        <div 
          key={hour}
          className={cn(
            "h-12 border-b border-border hover:bg-muted/50 transition-colors",
            hour >= BUSINESS_HOURS_START && hour <= BUSINESS_HOURS_END 
              ? "bg-background" 
              : "bg-muted/30"
          )}
          onClick={() => {
            const dateWithTime = setMinutes(setHours(day, hour), 0);
            onDateClick(dateWithTime);
          }}
        />
      ))}

      {/* Current time indicator */}
      {today && (
        <div 
          className="absolute left-0 right-0 border-t-2 border-destructive z-10 pointer-events-none"
          style={{ top: `${((new Date().getHours() + new Date().getMinutes() / 60) / 24) * 100}%` }}
        >
          <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-destructive" />
        </div>
      )}

      {/* Events */}
      {dayEvents.map((evento) => (
        <DraggableEvent 
          key={evento.id} 
          evento={evento} 
          onClick={() => onEventClick(evento)}
        />
      ))}
    </div>
  );
}

export function WeekView({ 
  currentDate, 
  eventos, 
  selectedDate,
  onDateClick, 
  onEventClick,
  onEventDrop,
}: WeekViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Generate week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
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
    if (!over || !onEventDrop) return;
    
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
        {/* Header with days */}
        <div className="grid grid-cols-8 bg-muted/50 border-b border-border">
          <div className="w-16 border-r border-border" /> {/* Time column */}
          {weekDays.map((day) => {
            const today = isToday(day);
            const selected = selectedDate ? isSameDay(day, selectedDate) : false;
            
            return (
              <div 
                key={day.toISOString()}
                className={cn(
                  "py-3 text-center border-r border-border last:border-r-0 cursor-pointer hover:bg-muted/50",
                  selected && "bg-primary/10"
                )}
                onClick={() => onDateClick(day)}
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={cn(
                  "text-lg font-semibold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                  today && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-8 relative">
            {/* Time labels column */}
            <div className="w-16 border-r border-border">
              {HOURS.map((hour) => (
                <div 
                  key={hour}
                  className={cn(
                    "h-12 border-b border-border text-xs text-muted-foreground pr-2 text-right pt-0.5",
                    hour >= BUSINESS_HOURS_START && hour <= BUSINESS_HOURS_END 
                      ? "bg-background" 
                      : "bg-muted/30"
                  )}
                >
                  {format(setHours(new Date(), hour), 'HH:00')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;

              return (
                <DroppableDay
                  key={dateKey}
                  day={day}
                  isSelected={selected}
                  dayEvents={dayEvents}
                  onDateClick={onDateClick}
                  onEventClick={onEventClick}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
