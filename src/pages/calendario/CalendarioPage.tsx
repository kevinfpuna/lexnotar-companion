import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Briefcase, AlertCircle } from 'lucide-react';
import { eventosMock, formatDate, getTrabajoById } from '@/lib/mockData';
import { TipoEvento } from '@/types';
import { cn } from '@/lib/utils';

const tipoEventoStyles: Record<TipoEvento, { bg: string; text: string; icon: typeof Clock }> = {
  'Inicio': { bg: 'bg-info/10', text: 'text-info', icon: Clock },
  'Fin estimada': { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  'Fin real': { bg: 'bg-success/10', text: 'text-success', icon: Clock },
  'Recordatorio': { bg: 'bg-primary/10', text: 'text-primary', icon: AlertCircle },
  'Cita personal': { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock },
  'Vencimiento': { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertCircle },
};

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? eventosMock.filter(e => 
        e.fechaEvento.toDateString() === selectedDate.toDateString()
      )
    : [];

  // Get upcoming events (next 14 days)
  const today = new Date();
  const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcomingEvents = eventosMock
    .filter(e => e.fechaEvento >= today && e.fechaEvento <= twoWeeksLater)
    .sort((a, b) => a.fechaEvento.getTime() - b.fechaEvento.getTime());

  // Dates with events (for calendar highlighting)
  const datesWithEvents = eventosMock.map(e => e.fechaEvento.toDateString());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus eventos y vencimientos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md pointer-events-auto"
            modifiers={{
              hasEvent: (date) => datesWithEvents.includes(date.toDateString())
            }}
            modifiersStyles={{
              hasEvent: { 
                backgroundColor: 'hsl(var(--primary) / 0.1)', 
                fontWeight: 'bold' 
              }
            }}
          />
        </Card>

        {/* Selected date events */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {selectedDate ? formatDate(selectedDate) : 'Selecciona una fecha'}
          </h3>
          
          <div className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay eventos para esta fecha
              </p>
            ) : (
              selectedDateEvents.map((evento) => {
                const trabajo = evento.trabajoId ? getTrabajoById(evento.trabajoId) : null;
                const style = tipoEventoStyles[evento.tipoEvento];
                const IconComponent = style.icon;

                return (
                  <div 
                    key={evento.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      style.bg
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <IconComponent className={cn("h-4 w-4 mt-0.5", style.text)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{evento.tituloEvento}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {evento.descripcion}
                        </p>
                        {trabajo && (
                          <div className="flex items-center gap-1 mt-2">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {trabajo.nombreTrabajo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {evento.tipoEvento}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Próximos 14 días</h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {upcomingEvents.map((evento) => {
              const trabajo = evento.trabajoId ? getTrabajoById(evento.trabajoId) : null;
              const style = tipoEventoStyles[evento.tipoEvento];
              const isToday = evento.fechaEvento.toDateString() === today.toDateString();

              return (
                <div 
                  key={evento.id}
                  className={cn(
                    "p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                    isToday && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedDate(evento.fechaEvento)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-xs font-medium", style.text)}>
                      {evento.tipoEvento}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(evento.fechaEvento)}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{evento.tituloEvento}</p>
                  {trabajo && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {trabajo.nombreTrabajo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
