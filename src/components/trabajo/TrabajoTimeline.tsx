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
  Receipt,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trabajo, Item, Pago, EstadoTrabajo, EstadoItem, MetodoPago } from '@/types';
import { formatCurrency } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  clienteNombre?: string;
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

const eventTypeLabels: Record<TimelineEvent['type'], string> = {
  'trabajo_creado': 'Trabajo creado',
  'trabajo_estado': 'Cambio de estado',
  'item_agregado': 'Paso agregado',
  'item_estado': 'Estado de paso',
  'pago': 'Pago',
};

export function TrabajoTimeline({ trabajo, items, pagos, clienteNombre }: TrabajoTimelineProps) {
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

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Tipo', 'Evento', 'Descripción', 'Detalles'];
    const rows = timelineEvents.map(event => {
      const dateStr = format(event.date, 'yyyy-MM-dd');
      const timeStr = format(event.date, 'HH:mm:ss');
      const typeLabel = eventTypeLabels[event.type];
      let details = '';
      
      if (event.metadata) {
        if (event.type === 'pago') {
          details = `Método: ${event.metadata.metodo || '-'}, Ref: ${event.metadata.referencia || '-'}`;
        } else if (event.type === 'trabajo_creado' && event.metadata.presupuesto) {
          details = `Presupuesto: ${formatCurrency(event.metadata.presupuesto)}`;
        } else if (event.type === 'item_agregado' && event.metadata.costo) {
          details = `Costo: ${formatCurrency(event.metadata.costo)}`;
        }
      }
      
      return [
        dateStr,
        timeStr,
        typeLabel,
        event.title,
        event.description || '-',
        details || '-'
      ];
    });

    const csvContent = [
      `"Historial de Auditoría - ${trabajo.nombreTrabajo}"`,
      `"Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}"`,
      '',
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial-${trabajo.id}-${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast.success('Historial exportado a CSV');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Auditoría', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(trabajo.nombreTrabajo, pageWidth / 2, 28, { align: 'center' });
    
    // Info section
    doc.setFontSize(10);
    const infoY = 40;
    doc.text(`Cliente: ${clienteNombre || 'N/A'}`, 14, infoY);
    doc.text(`Estado actual: ${trabajo.estado}`, 14, infoY + 6);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, infoY + 12);
    doc.text(`Total eventos: ${timelineEvents.length}`, 14, infoY + 18);
    
    // Summary stats
    const totalPagos = pagos.reduce((sum, p) => sum + p.monto, 0);
    doc.text(`Total pagos registrados: ${formatCurrency(totalPagos)}`, pageWidth - 14, infoY, { align: 'right' });
    doc.text(`Saldo pendiente: ${formatCurrency(trabajo.saldoPendiente)}`, pageWidth - 14, infoY + 6, { align: 'right' });
    
    // Timeline table
    const tableData = timelineEvents.map(event => {
      let details = '';
      if (event.metadata) {
        if (event.type === 'pago') {
          details = `${event.metadata.metodo || ''} ${event.metadata.referencia ? `(Ref: ${event.metadata.referencia})` : ''}`;
        } else if (event.metadata.presupuesto) {
          details = formatCurrency(event.metadata.presupuesto);
        } else if (event.metadata.costo) {
          details = formatCurrency(event.metadata.costo);
        }
      }
      
      return [
        format(event.date, 'dd/MM/yyyy HH:mm'),
        eventTypeLabels[event.type],
        event.title,
        event.description || '-',
        details || '-'
      ];
    });

    autoTable(doc, {
      startY: infoY + 28,
      head: [['Fecha/Hora', 'Tipo', 'Evento', 'Descripción', 'Detalles']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 50 },
        3: { cellWidth: 45 },
        4: { cellWidth: 35 },
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`historial-auditoria-${trabajo.id}-${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success('Reporte de auditoría generado en PDF');
  };

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

  return (
    <div className="space-y-4">
      {/* Export buttons */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar historial
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar a PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar a CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay eventos en el historial
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {timelineEvents.map((event) => (
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
      )}
    </div>
  );
}
