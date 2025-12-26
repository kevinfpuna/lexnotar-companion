import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CircleDot, 
  DollarSign, 
  FileCheck, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  Banknote,
  CreditCard,
  Landmark,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trabajo, Item, Pago, EstadoTrabajo, EstadoItem, MetodoPago } from '@/types';
import { formatCurrency } from '@/lib/mockData';

interface TimelineEvent {
  id: string;
  type: 'trabajo_creado' | 'trabajo_estado' | 'item_agregado' | 'item_estado' | 'pago';
  date: Date;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface TrabajoTimelineProps {
  trabajo: Trabajo;
  items: Item[];
  pagos: Pago[];
}

const estadoTrabajoIcon: Record<EstadoTrabajo, typeof Play> = {
  'Borrador': CircleDot,
  'Pendiente': Clock,
  'En proceso': Play,
  'Completado': CheckCircle2,
  'Cancelado': XCircle,
};

const estadoTrabajoColor: Record<EstadoTrabajo, string> = {
  'Borrador': 'text-muted-foreground bg-muted',
  'Pendiente': 'text-warning bg-warning/10',
  'En proceso': 'text-info bg-info/10',
  'Completado': 'text-success bg-success/10',
  'Cancelado': 'text-destructive bg-destructive/10',
};

const metodoPagoIcon: Record<MetodoPago, typeof Banknote> = {
  'Efectivo': Banknote,
  'Transferencia': Landmark,
  'Tarjeta': CreditCard,
  'Cheque': Receipt,
};

export function TrabajoTimeline({ trabajo, items, pagos }: TrabajoTimelineProps) {
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Trabajo creation event
    events.push({
      id: `trabajo-created-${trabajo.id}`,
      type: 'trabajo_creado',
      date: new Date(trabajo.fechaCreacion),
      title: 'Trabajo creado',
      description: trabajo.nombreTrabajo,
      metadata: {
        presupuesto: trabajo.presupuestoInicial,
      },
    });

    // Current estado (simulated - in real app would track estado changes)
    if (trabajo.estado !== 'Borrador') {
      events.push({
        id: `trabajo-estado-${trabajo.id}`,
        type: 'trabajo_estado',
        date: new Date(trabajo.fechaUltimaActualizacion),
        title: `Estado cambiado a "${trabajo.estado}"`,
        metadata: {
          estado: trabajo.estado,
        },
      });
    }

    // Items added
    items.forEach((item) => {
      events.push({
        id: `item-created-${item.id}`,
        type: 'item_agregado',
        date: new Date(item.fechaCreacion),
        title: `Paso agregado: ${item.nombreItem}`,
        description: item.descripcionItem,
        metadata: {
          costo: item.costoTotal,
          numeroPaso: item.numeroPaso,
        },
      });

      // Item estado changes (simulated with fechaActualizacion)
      if (item.estado !== 'Pendiente' && item.fechaActualizacion > item.fechaCreacion) {
        events.push({
          id: `item-estado-${item.id}`,
          type: 'item_estado',
          date: new Date(item.fechaActualizacion),
          title: `Paso "${item.nombreItem}" → ${item.estado}`,
          metadata: {
            estado: item.estado,
            itemId: item.id,
          },
        });
      }
    });

    // Pagos
    pagos.forEach((pago) => {
      const item = pago.itemId ? items.find(i => i.id === pago.itemId) : null;
      events.push({
        id: `pago-${pago.id}`,
        type: 'pago',
        date: new Date(pago.fechaPago),
        title: `Pago recibido: ${formatCurrency(pago.monto)}`,
        description: item ? `Aplicado a: ${item.nombreItem}` : 'Pago general',
        metadata: {
          monto: pago.monto,
          metodo: pago.metodoPago,
          referencia: pago.referenciaPago,
        },
      });
    });

    // Sort by date descending (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [trabajo, items, pagos]);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'trabajo_creado':
        return <Play className="h-4 w-4" />;
      case 'trabajo_estado':
        const TrabajoIcon = estadoTrabajoIcon[event.metadata?.estado as EstadoTrabajo] || CircleDot;
        return <TrabajoIcon className="h-4 w-4" />;
      case 'item_agregado':
        return <FileCheck className="h-4 w-4" />;
      case 'item_estado':
        return <ArrowRight className="h-4 w-4" />;
      case 'pago':
        const PagoIcon = metodoPagoIcon[event.metadata?.metodo as MetodoPago] || DollarSign;
        return <PagoIcon className="h-4 w-4" />;
      default:
        return <CircleDot className="h-4 w-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    switch (event.type) {
      case 'trabajo_creado':
        return 'text-primary bg-primary/10';
      case 'trabajo_estado':
        return estadoTrabajoColor[event.metadata?.estado as EstadoTrabajo] || 'text-muted-foreground bg-muted';
      case 'item_agregado':
        return 'text-info bg-info/10';
      case 'item_estado':
        return 'text-warning bg-warning/10';
      case 'pago':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay eventos en el historial
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon */}
            <div 
              className={cn(
                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background",
                getEventColor(event)
              )}
            >
              {getEventIcon(event)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {event.description}
                    </p>
                  )}
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(event.date, "d MMM yyyy, HH:mm", { locale: es })}
                </time>
              </div>

              {/* Metadata badges */}
              {event.metadata && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.type === 'pago' && event.metadata.metodo && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {event.metadata.metodo}
                    </span>
                  )}
                  {event.type === 'pago' && event.metadata.referencia && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Ref: {event.metadata.referencia}
                    </span>
                  )}
                  {event.type === 'item_agregado' && event.metadata.costo > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {formatCurrency(event.metadata.costo)}
                    </span>
                  )}
                  {event.type === 'trabajo_creado' && event.metadata.presupuesto > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Presupuesto: {formatCurrency(event.metadata.presupuesto)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
