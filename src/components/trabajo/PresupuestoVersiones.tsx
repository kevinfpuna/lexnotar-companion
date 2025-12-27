import { useState } from 'react';
import { Trabajo, Item } from '@/types';
import { usePresupuestos } from '@/hooks/usePresupuestos';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { formatCurrency, formatDate } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Check, 
  X, 
  Send, 
  Download,
  Trash2 
} from 'lucide-react';
import { toast } from 'sonner';

interface PresupuestoVersionesProps {
  trabajo: Trabajo;
  items: Item[];
}

export function PresupuestoVersiones({ trabajo, items }: PresupuestoVersionesProps) {
  const { config } = useConfiguracion();
  const {
    getPresupuestosByTrabajo,
    createPresupuesto,
    updatePresupuestoEstado,
    deletePresupuesto
  } = usePresupuestos();

  const [isCreating, setIsCreating] = useState(false);
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [cargosExtra, setCargosExtra] = useState(0);
  const [terminosCondiciones, setTerminosCondiciones] = useState('');

  const versiones = getPresupuestosByTrabajo(trabajo.id);

  // Calcular subtotal de ítems
  const subtotal = items.reduce((sum, i) => sum + i.costoTotal, 0);
  const iva = config.usarIva ? subtotal * (config.tasaIva / 100) : 0;
  const total = subtotal - descuentoGlobal + cargosExtra + iva;

  const handleCrearNuevaVersion = async () => {
    try {
      await createPresupuesto({
        trabajoId: trabajo.id,
        subtotal,
        descuentoGlobal,
        cargosExtra,
        iva,
        terminosCondiciones
      });
      
      setIsCreating(false);
      setDescuentoGlobal(0);
      setCargosExtra(0);
      setTerminosCondiciones('');
    } catch (error) {
      toast.error('Error al crear presupuesto');
    }
  };

  const handleAprobar = async (id: string) => {
    await updatePresupuestoEstado(id, 'aprobado');
  };

  const handleEnviar = async (id: string) => {
    await updatePresupuestoEstado(id, 'enviado');
  };

  const handleRechazar = async (id: string) => {
    const motivo = window.prompt('Motivo del rechazo (opcional):');
    await updatePresupuestoEstado(id, 'rechazado', motivo || undefined);
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'default';
      case 'enviado':
        return 'secondary';
      case 'rechazado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Historial de Presupuestos</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona versiones y aprobaciones
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Versión
        </Button>
      </div>

      {/* Lista de versiones */}
      {versiones.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No hay presupuestos creados aún
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsCreating(true)}
          >
            Crear primer presupuesto
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {versiones.map((v) => (
            <Card key={v.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Versión {v.version}</span>
                    <Badge variant={getEstadoBadgeVariant(v.estado)}>
                      {v.estado}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Creado: {formatDate(v.fechaCreacion)}</p>
                    {v.fechaEnviado && (
                      <p>Enviado: {formatDate(v.fechaEnviado)}</p>
                    )}
                    {v.fechaAprobado && (
                      <p>Aprobado: {formatDate(v.fechaAprobado)}</p>
                    )}
                    {v.motivoRechazo && (
                      <p className="text-destructive">
                        Rechazo: {v.motivoRechazo}
                      </p>
                    )}
                  </div>

                  {/* Desglose */}
                  <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(v.subtotal)}</span>
                    </div>
                    {v.descuentoGlobal > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento:</span>
                        <span>-{formatCurrency(v.descuentoGlobal)}</span>
                      </div>
                    )}
                    {v.cargosExtra > 0 && (
                      <div className="flex justify-between">
                        <span>Cargos extra:</span>
                        <span>+{formatCurrency(v.cargosExtra)}</span>
                      </div>
                    )}
                    {v.iva > 0 && (
                      <div className="flex justify-between">
                        <span>IVA ({config.tasaIva}%):</span>
                        <span>{formatCurrency(v.iva)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-1 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(v.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2 ml-4">
                  {v.estado === 'borrador' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleEnviar(v.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Enviar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAprobar(v.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePresupuesto(v.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </>
                  )}
                  
                  {v.estado === 'enviado' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => handleAprobar(v.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRechazar(v.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </>
                  )}

                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear nueva versión */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Versión de Presupuesto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Subtotal (ítems del trabajo)</Label>
              <Input 
                value={formatCurrency(subtotal)} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div>
              <Label>Descuento Global</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={descuentoGlobal}
                onChange={(e) => setDescuentoGlobal(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Cargos Extra</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={cargosExtra}
                onChange={(e) => setCargosExtra(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            {config.usarIva && (
              <div>
                <Label>IVA ({config.tasaIva}%)</Label>
                <Input 
                  value={formatCurrency(iva)} 
                  disabled 
                  className="bg-muted"
                />
              </div>
            )}

            <div className="pt-2 border-t">
              <Label>Total</Label>
              <Input
                value={formatCurrency(total)}
                disabled
                className="bg-muted font-bold text-lg"
              />
            </div>

            <div>
              <Label>Términos y Condiciones (opcional)</Label>
              <Textarea
                value={terminosCondiciones}
                onChange={(e) => setTerminosCondiciones(e.target.value)}
                placeholder="Ej: Pago 50% adelantado, 50% al finalizar..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearNuevaVersion}>
              Crear Versión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
