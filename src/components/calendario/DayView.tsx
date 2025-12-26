import { useMemo } from 'react';
import { format, setHours, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { EventoCalendario, TipoEvento } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, Briefcase, AlertCircle, Calendar } from 'lucide-react';

interface DayViewProps {
  date: Date;
  eventos: EventoCalendario[];
  onEventClick: (evento: EventoCalendario) => void;
  trabajos?: { id: string; nombreTrabajo: string }[];
}

const tipoEventoStyles: Record<TipoEvento, { bg: string; text: string; icon: typeof Clock }> = {
  'Inicio': { bg: 'bg-info/10', text: 'text-info', icon: Clock },
  'Fin estimada': { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  'Fin real': { bg: 'bg-success/10', text: 'text-success', icon: Clock },
  'Recordatorio': { bg: 'bg-primary/10', text: 'text-primary', icon: AlertCircle },
  'Cita personal': { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock },
  'Vencimiento': { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertCircle },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BUSINESS_HOURS_START = 7;
const BUSINESS_HOURS_END = 20;

export function DayView({ date, eventos, onEventClick, trabajos = [] }: DayViewProps) {
  const today = isToday(date);
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Sort events by time
  const sortedEventos = useMemo(() => {
    return [...eventos].sort((a, b) => {
      const timeA = a.horaEvento || '09:00';
      const timeB = b.horaEvento || '09:00';
      return timeA.localeCompare(timeB);
    });
  }, [eventos]);

  // Get trabajo name
  const getTrabajoNombre = (trabajoId?: string) => {
    if (!trabajoId) return null;
    const trabajo = trabajos.find(t => t.id === trabajoId);
    return trabajo?.nombreTrabajo;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timeline */}
      <div className="lg:col-span-2 border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted/50 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {format(date, 'EEEE', { locale: es })}
              </h3>
              <p className="text-muted-foreground">
                {format(date, 'PPP', { locale: es })}
              </p>
            </div>
            {today && (
              <Badge variant="default">Hoy</Badge>
            )}
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          <div className="relative">
            {HOURS.map((hour) => (
              <div 
                key={hour}
                className={cn(
                  "flex border-b border-border",
                  hour >= BUSINESS_HOURS_START && hour <= BUSINESS_HOURS_END 
                    ? "bg-background" 
                    : "bg-muted/30"
                )}
              >
                <div className="w-16 py-3 px-2 text-xs text-muted-foreground text-right border-r border-border">
                  {format(setHours(new Date(), hour), 'HH:00')}
                </div>
                <div className="flex-1 min-h-[48px] p-1">
                  {sortedEventos
                    .filter(e => {
                      const eventHour = e.horaEvento ? parseInt(e.horaEvento.split(':')[0]) : 9;
                      return eventHour === hour;
                    })
                    .map((evento) => {
                      const style = tipoEventoStyles[evento.tipoEvento];
                      const trabajoNombre = getTrabajoNombre(evento.trabajoId);
                      
                      return (
                        <div
                          key={evento.id}
                          className={cn(
                            "rounded-lg p-2 mb-1 cursor-pointer hover:ring-2 ring-primary/50 transition-all",
                            style.bg
                          )}
                          onClick={() => onEventClick(evento)}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium", style.text)}>
                              {evento.horaEvento || '09:00'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {evento.tipoEvento}
                            </Badge>
                          </div>
                          <p className="font-medium mt-1">{evento.tituloEvento}</p>
                          {evento.descripcion && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {evento.descripcion}
                            </p>
                          )}
                          {trabajoNombre && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              {trabajoNombre}
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            ))}

            {/* Current time indicator */}
            {today && (
              <div 
                className="absolute left-16 right-0 border-t-2 border-destructive z-10 pointer-events-none"
                style={{ top: `${(currentHour / 24) * 100}%` }}
              >
                <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-destructive" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event list sidebar */}
      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Eventos del día ({sortedEventos.length})
          </h4>
          
          {sortedEventos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay eventos para este día
            </p>
          ) : (
            <div className="space-y-2">
              {sortedEventos.map((evento) => {
                const style = tipoEventoStyles[evento.tipoEvento];
                const IconComponent = style.icon;
                const trabajoNombre = getTrabajoNombre(evento.trabajoId);

                return (
                  <div
                    key={evento.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer hover:ring-2 ring-primary/50 transition-all",
                      style.bg
                    )}
                    onClick={() => onEventClick(evento)}
                  >
                    <div className="flex items-start gap-2">
                      <IconComponent className={cn("h-4 w-4 mt-0.5", style.text)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {evento.horaEvento || '09:00'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {evento.tipoEvento}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm mt-1">{evento.tituloEvento}</p>
                        {trabajoNombre && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {trabajoNombre}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Stats */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Resumen</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total eventos</span>
              <span className="font-medium">{sortedEventos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recordatorios</span>
              <span className="font-medium">
                {sortedEventos.filter(e => e.tipoEvento === 'Recordatorio').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vencimientos</span>
              <span className="font-medium text-destructive">
                {sortedEventos.filter(e => e.tipoEvento === 'Vencimiento').length}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
