import { useState, useMemo } from 'react';
import { 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks, 
  addDays, 
  subDays,
  format,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  List,
  FileText,
  Download,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { TipoEvento } from '@/types';
import { EventoForm } from '@/components/forms/EventoForm';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { MonthView } from '@/components/calendario/MonthView';
import { WeekView } from '@/components/calendario/WeekView';
import { DayView } from '@/components/calendario/DayView';
import { toast } from 'sonner';
import { exportToICS } from '@/lib/calendar';

type ViewType = 'mes' | 'semana' | 'dia';

const tipoEventoStyles: Record<TipoEvento, { bg: string; text: string }> = {
  'Inicio': { bg: 'bg-info/10', text: 'text-info' },
  'Fin estimada': { bg: 'bg-warning/10', text: 'text-warning' },
  'Fin real': { bg: 'bg-success/10', text: 'text-success' },
  'Recordatorio': { bg: 'bg-primary/10', text: 'text-primary' },
  'Cita personal': { bg: 'bg-muted', text: 'text-muted-foreground' },
  'Vencimiento': { bg: 'bg-destructive/10', text: 'text-destructive' },
};

export default function CalendarioPage() {
  const { eventos, trabajos, createEvento, updateEvento, deleteEvento, isLoading } = useApp();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<ViewType>('mes');
  const [eventoFormOpen, setEventoFormOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<string | null>(null);
  const [deleteEventoId, setDeleteEventoId] = useState<string | null>(null);

  // Get trabajo by id helper
  const getTrabajoById = (id: string) => trabajos.find(t => t.id === id);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventos.filter(e => isSameDay(e.fechaEvento, selectedDate));
  }, [eventos, selectedDate]);

  // Navigation handlers
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const goToPrevious = () => {
    switch (view) {
      case 'mes':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'semana':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'dia':
        setCurrentDate(subDays(currentDate, 1));
        setSelectedDate(subDays(currentDate, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case 'mes':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'semana':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'dia':
        setCurrentDate(addDays(currentDate, 1));
        setSelectedDate(addDays(currentDate, 1));
        break;
    }
  };

  // Format current date for display
  const getNavigationLabel = () => {
    switch (view) {
      case 'mes':
        return format(currentDate, 'MMMM yyyy', { locale: es });
      case 'semana':
        return `Semana del ${format(currentDate, 'd MMM', { locale: es })}`;
      case 'dia':
        return format(currentDate, 'PPP', { locale: es });
    }
  };

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

  // Handle event drop (drag and drop)
  const handleEventDrop = async (eventoId: string, newDate: Date) => {
    await updateEvento(eventoId, { fechaEvento: newDate });
    toast.success('Evento movido correctamente');
  };

  // Handle date click (to create event)
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (view === 'dia') {
      setCurrentDate(date);
    }
  };

  // Handle event click
  const handleEventClick = (evento: typeof eventos[0]) => {
    setEditingEvento(evento.id);
  };

  // Export to ICS
  const handleExportICS = () => {
    exportToICS(eventos, currentDate);
    toast.success('Calendario exportado');
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportICS}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setEventoFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* View tabs and navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
          <TabsList>
            <TabsTrigger value="mes">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Mes
            </TabsTrigger>
            <TabsTrigger value="semana">
              <List className="h-4 w-4 mr-2" />
              Semana
            </TabsTrigger>
            <TabsTrigger value="dia">
              <FileText className="h-4 w-4 mr-2" />
              Día
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[180px] text-center capitalize">
            {getNavigationLabel()}
          </span>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar views */}
      {view === 'mes' && (
        <MonthView
          currentDate={currentDate}
          eventos={eventos}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />
      )}

      {view === 'semana' && (
        <WeekView
          currentDate={currentDate}
          eventos={eventos}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />
      )}

      {view === 'dia' && selectedDate && (
        <DayView
          date={selectedDate}
          eventos={selectedDateEvents}
          onEventClick={handleEventClick}
          trabajos={trabajos}
        />
      )}

      {/* Upcoming events sidebar for month/week view */}
      {view !== 'dia' && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
          </h3>
          
          <div className="space-y-2">
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay eventos para esta fecha
              </p>
            ) : (
              selectedDateEvents.map((evento) => {
                const trabajo = evento.trabajoId ? getTrabajoById(evento.trabajoId) : null;
                const style = tipoEventoStyles[evento.tipoEvento];

                return (
                  <div 
                    key={evento.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:ring-2 ring-primary/50 transition-all ${style.bg}`}
                    onClick={() => handleEventClick(evento)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${style.text}`}>
                        {evento.tipoEvento}
                      </span>
                      {evento.horaEvento && (
                        <span className="text-xs text-muted-foreground">
                          {evento.horaEvento}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm mt-1">{evento.tituloEvento}</p>
                    {trabajo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {trabajo.nombreTrabajo}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setEventoFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar evento
          </Button>
        </Card>
      )}

      {/* Evento Form - Create */}
      <EventoForm
        open={eventoFormOpen}
        onOpenChange={setEventoFormOpen}
        trabajos={trabajos}
        onSubmit={handleCreateEvento}
        isLoading={isLoading}
        mode="create"
        defaultValues={selectedDate ? { fechaEvento: selectedDate } : undefined}
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
