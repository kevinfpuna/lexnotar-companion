import { useMemo } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isToday,
  isSameDay,
  addHours,
  setHours,
  setMinutes,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { EventoCalendario, TipoEvento } from '@/types';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  eventos: EventoCalendario[];
  selectedDate: Date | undefined;
  onDateClick: (date: Date) => void;
  onEventClick: (evento: EventoCalendario) => void;
}

const tipoColors: Record<TipoEvento, string> = {
  'Inicio': 'bg-info/80 border-info',
  'Fin estimada': 'bg-warning/80 border-warning',
  'Fin real': 'bg-success/80 border-success',
  'Recordatorio': 'bg-primary/80 border-primary',
  'Cita personal': 'bg-muted border-border',
  'Vencimiento': 'bg-destructive/80 border-destructive',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BUSINESS_HOURS_START = 7;
const BUSINESS_HOURS_END = 20;

export function WeekView({ 
  currentDate, 
  eventos, 
  selectedDate,
  onDateClick, 
  onEventClick 
}: WeekViewProps) {
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

  // Current time indicator position
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  return (
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
            const today = isToday(day);
            const selected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <div 
                key={dateKey}
                className={cn(
                  "border-r border-border last:border-r-0 relative",
                  selected && "bg-primary/5"
                )}
              >
                {HOURS.map((hour) => (
                  <div 
                    key={hour}
                    className={cn(
                      "h-12 border-b border-border",
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
                    style={{ top: `${(currentHour / 24) * 100}%` }}
                  >
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-destructive" />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((evento, idx) => {
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
                      key={evento.id}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-xs cursor-pointer truncate border-l-2",
                        tipoColors[evento.tipoEvento]
                      )}
                      style={{ 
                        top: `${top}%`,
                        height: `${height}%`,
                        zIndex: idx + 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(evento);
                      }}
                    >
                      <span className="font-medium">{evento.horaEvento || '09:00'}</span>
                      {' '}{evento.tituloEvento}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
