import { cn } from '@/lib/utils';
import { EstadoTrabajo, EstadoItem } from '@/types';

interface StatusBadgeProps {
  status: EstadoTrabajo | EstadoItem;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Work statuses
  'Borrador': 'bg-muted text-muted-foreground',
  'Pendiente': 'bg-warning/10 text-warning border border-warning/20',
  'En proceso': 'bg-info/10 text-info border border-info/20',
  'Completado': 'bg-success/10 text-success border border-success/20',
  'Cancelado': 'bg-muted text-muted-foreground',
  
  // Item statuses
  'Mesa entrada': 'bg-primary/10 text-primary border border-primary/20',
  'Mesa salida': 'bg-info/10 text-info border border-info/20',
  'Listo retirar': 'bg-success/10 text-success border border-success/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {status}
    </span>
  );
}
