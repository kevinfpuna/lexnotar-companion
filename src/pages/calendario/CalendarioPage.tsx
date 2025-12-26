import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Briefcase, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/mockData';
import { TipoEvento } from '@/types';
import { cn } from '@/lib/utils';
import { EventoForm } from '@/components/forms/EventoForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';

const tipoEventoStyles: Record<TipoEvento, { bg: string; text: string; icon: typeof Clock }> = {
  'Inicio': { bg: 'bg-info/10', text: 'text-info', icon: Clock },
  'Fin estimada': { bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  'Fin real': { bg: 'bg-success/10', text: 'text-success', icon: Clock },
  'Recordatorio': { bg: 'bg-primary/10', text: 'text-primary', icon: AlertCircle },
  'Cita personal': { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock },
  'Vencimiento': { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertCircle },
};

export default function CalendarioPage() {
  const { eventos, trabajos, createEvento, updateEvento, deleteEvento, isLoading } = useApp();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventoFormOpen, setEventoFormOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<string | null>(null);
  const [deleteEventoId, setDeleteEventoId] = useState<string | null>(null);

  // Get trabajo by id helper
  const getTrabajoById = (id: string) => trabajos.find(t => t.id === id);

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? eventos.filter(e => 
        e.fechaEvento.toDateString() === selectedDate.toDateString()
      )
    : [];

  // Get upcoming events (next 14 days)
  const today = new Date();
  const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcomingEvents = eventos
    .filter(e => e.fechaEvento >= today && e.fechaEvento <= twoWeeksLater)
    .sort((a, b) => a.fechaEvento.getTime() - b.fechaEvento.getTime());

  // Dates with events (for calendar highlighting)
  const datesWithEvents = eventos.map(e => e.fechaEvento.toDateString());

  // Handle create evento
  const handleCreateEvento = async (data: any) => {
    await createEvento(data);
    setEventoFormOpen(false);
  };

  // Handle edit evento
  const handleEditEvento = async (data: any) => {
    if (editingEvento) {
      await updateEvento(editingEvento, data);
      setEditingEvento(null);
    }
  };

  // Handle delete evento
  const handleDeleteEvento = async () => {
    if (deleteEventoId) {
      await deleteEvento(deleteEventoId);
      setDeleteEventoId(null);
    }
  };

  const editingEventoData = editingEvento ? eventos.find(e => e.id === editingEvento) : null;

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
        <Button onClick={() => setEventoFormOpen(true)}>
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
                      "p-3 rounded-lg border relative group",
                      style.bg
                    )}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => setEditingEvento(evento.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => setDeleteEventoId(evento.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay eventos próximos
              </p>
            ) : (
              upcomingEvents.map((evento) => {
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
              })
            )}
          </div>
        </Card>
      </div>

      {/* Evento Form - Create */}
      <EventoForm
        open={eventoFormOpen}
        onOpenChange={setEventoFormOpen}
        trabajos={trabajos}
        onSubmit={handleCreateEvento}
        isLoading={isLoading}
        mode="create"
      />

      {/* Evento Form - Edit */}
      <EventoForm
        open={!!editingEvento}
        onOpenChange={(open) => !open && setEditingEvento(null)}
        trabajos={trabajos}
        onSubmit={handleEditEvento}
        isLoading={isLoading}
        mode="edit"
        defaultValues={editingEventoData ? {
          tituloEvento: editingEventoData.tituloEvento,
          tipoEvento: editingEventoData.tipoEvento,
          fechaEvento: editingEventoData.fechaEvento,
          trabajoId: editingEventoData.trabajoId || '',
          descripcion: editingEventoData.descripcion || '',
          recordatorioHorasAntes: editingEventoData.recordatorioHorasAntes || 24,
        } : undefined}
      />

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteEventoId}
        onOpenChange={(open) => !open && setDeleteEventoId(null)}
        onConfirm={handleDeleteEvento}
        title="Eliminar evento"
        description="¿Estás seguro de que deseas eliminar este evento?"
        isLoading={isLoading}
      />
    </div>
  );
}
