import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { useVencimientos } from '@/hooks/useVencimientos';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trabajo, Item } from '@/types';

interface VencimientosWidgetProps {
  trabajos: Trabajo[];
  items: Item[];
}

export function VencimientosWidget({ trabajos, items }: VencimientosWidgetProps) {
  const { vencimientos, vencidos, urgentes } = useVencimientos(trabajos, items);
  const navigate = useNavigate();

  if (vencimientos.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay vencimientos próximos</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Vencimientos</h3>
        <div className="flex gap-2">
          {vencidos.length > 0 && (
            <Badge variant="destructive">{vencidos.length} vencidos</Badge>
          )}
          {urgentes.length > 0 && (
            <Badge className="bg-orange-500 text-white hover:bg-orange-600">
              {urgentes.length} urgentes
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {vencimientos.slice(0, 5).map(vencimiento => (
          <div
            key={vencimiento.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/trabajos/${vencimiento.trabajoId}`)}
          >
            <div className={`p-2 rounded-full ${
              vencimiento.estado === 'vencido' 
                ? 'bg-destructive/10' 
                : vencimiento.estado === 'urgente'
                ? 'bg-orange-100 dark:bg-orange-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {vencimiento.estado === 'vencido' ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : vencimiento.estado === 'urgente' ? (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              ) : (
                <Clock className="h-4 w-4 text-blue-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {vencimiento.titulo}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(vencimiento.fechaVencimiento, "dd 'de' MMMM", { locale: es })}
                {vencimiento.estado === 'vencido' && (
                  <span className="text-destructive ml-2">
                    (Vencido hace {Math.abs(vencimiento.diasRestantes)} días)
                  </span>
                )}
                {vencimiento.estado === 'urgente' && (
                  <span className="text-orange-600 ml-2">
                    (Vence {vencimiento.diasRestantes === 0 ? 'hoy' : 'mañana'})
                  </span>
                )}
                {vencimiento.estado === 'proximo' && (
                  <span className="ml-2">
                    (En {vencimiento.diasRestantes} días)
                  </span>
                )}
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                {vencimiento.tipo === 'trabajo' ? 'Trabajo' : 'Ítem'}
              </Badge>
            </div>
          </div>
        ))}

        {vencimientos.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => navigate('/trabajos')}
          >
            Ver todos ({vencimientos.length})
          </Button>
        )}
      </div>
    </Card>
  );
}
