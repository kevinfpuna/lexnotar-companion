import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { pagoSchema, PagoFormData } from '@/lib/validations';
import { Trabajo, Item, MetodoPago } from '@/types';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/mockData';

const metodosPago: MetodoPago[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'];

interface PagoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trabajos: Trabajo[];
  items?: Item[];
  onSubmit: (data: PagoFormData) => Promise<void>;
  isLoading?: boolean;
  defaultTrabajoId?: string;
  getClienteNombre?: (clienteId: string) => string;
}

export function PagoForm({
  open,
  onOpenChange,
  trabajos,
  items = [],
  onSubmit,
  isLoading = false,
  defaultTrabajoId,
  getClienteNombre,
}: PagoFormProps) {
  const form = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      trabajoId: defaultTrabajoId || '',
      itemId: '',
      monto: 0,
      fechaPago: new Date(),
      metodoPago: 'Efectivo',
      referenciaPago: '',
      notasPago: '',
    },
  });

  const selectedTrabajoId = form.watch('trabajoId');
  const selectedTrabajo = trabajos.find(t => t.id === selectedTrabajoId);
  const trabajoItems = items.filter(i => i.trabajoId === selectedTrabajoId && i.saldo > 0);

  const handleSubmit = async (data: PagoFormData) => {
    // Warning if monto exceeds saldo
    if (selectedTrabajo && data.monto > selectedTrabajo.saldoPendiente) {
      // Still allow but with warning - validation doesn't block
    }
    
    await onSubmit(data);
    form.reset({
      trabajoId: defaultTrabajoId || '',
      itemId: '',
      monto: 0,
      fechaPago: new Date(),
      metodoPago: 'Efectivo',
      referenciaPago: '',
      notasPago: '',
    });
    onOpenChange(false);
  };

  // Filter trabajos with balance
  const trabajosConSaldo = trabajos.filter(t => 
    t.saldoPendiente > 0 && t.estado !== 'Cancelado' && t.estado !== 'Completado'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="trabajoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trabajo *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!!defaultTrabajoId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione trabajo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trabajosConSaldo.map((trabajo) => (
                        <SelectItem key={trabajo.id} value={trabajo.id}>
                          <span className="flex items-center justify-between gap-2">
                            <span>{trabajo.nombreTrabajo}</span>
                            <span className="text-muted-foreground text-xs">
                              (Saldo: {formatCurrency(trabajo.saldoPendiente)})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTrabajo && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><span className="text-muted-foreground">Cliente:</span> {getClienteNombre?.(selectedTrabajo.clienteId) || 'N/A'}</p>
                <p><span className="text-muted-foreground">Saldo pendiente:</span> <span className="font-semibold text-destructive">{formatCurrency(selectedTrabajo.saldoPendiente)}</span></p>
              </div>
            )}

            {trabajoItems.length > 0 && (
              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paso específico (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pago general al trabajo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Pago general</SelectItem>
                        {trabajoItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.numeroPaso}. {item.nombreItem} (Saldo: {formatCurrency(item.saldo)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metodosPago.map((metodo) => (
                          <SelectItem key={metodo} value={metodo}>
                            {metodo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fechaPago"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Pago *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenciaPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia / Comprobante</FormLabel>
                  <FormControl>
                    <Input placeholder="Nro. transferencia, cheque, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notasPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observaciones del pago..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Pago
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
