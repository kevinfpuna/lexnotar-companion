import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trabajoSchema, type TrabajoFormData } from '@/lib/validations';
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
import { Cliente, TipoTrabajo, Item } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2, Plus, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrabajoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
  tiposTrabajo: TipoTrabajo[];
  onSubmit: (data: TrabajoFormData, items: Partial<Item>[]) => Promise<void>;
  isLoading?: boolean;
}

export function TrabajoForm({
  open,
  onOpenChange,
  clientes,
  tiposTrabajo,
  onSubmit,
  isLoading,
}: TrabajoFormProps) {
  const [step, setStep] = useState(1);
  const [customItems, setCustomItems] = useState<Partial<Item>[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const form = useForm<TrabajoFormData>({
    resolver: zodResolver(trabajoSchema),
    defaultValues: {
      clienteId: '',
      tipoTrabajoId: '',
      nombreTrabajo: '',
      descripcionTrabajo: '',
      fechaInicio: new Date(),
      fechaFinEstimada: new Date(),
      presupuestoInicial: 0,
      notasInternas: '',
    },
  });

  const selectedTipoId = form.watch('tipoTrabajoId');
  const selectedTipo = tiposTrabajo.find((t) => t.id === selectedTipoId);

  // Load predefined steps when type is selected
  useEffect(() => {
    if (selectedTipo && customItems.length === 0) {
      const items = selectedTipo.pasosPredefinidos.map((paso) => ({
        nombreItem: paso.nombre,
        descripcionItem: paso.descripcion,
        diasEstimados: paso.diasEstimados,
        costoTotal: paso.costoEstimado || 0,
      }));
      setCustomItems(items);
    }
  }, [selectedTipo]);

  const handleStep1Next = async () => {
    const isValid = await form.trigger([
      'clienteId',
      'tipoTrabajoId',
      'nombreTrabajo',
      'fechaInicio',
      'fechaFinEstimada',
      'presupuestoInicial',
    ]);
    if (isValid) setStep(2);
  };

  const handleFormSubmit = async (data: TrabajoFormData) => {
    await onSubmit(data, customItems);
    form.reset();
    setCustomItems([]);
    setStep(1);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setCustomItems([]);
      setStep(1);
    }
    onOpenChange(open);
  };

  const addNewItem = () => {
    setCustomItems((prev) => [
      ...prev,
      {
        nombreItem: '',
        descripcionItem: '',
        costoTotal: 0,
        diasEstimados: 0,
      },
    ]);
    setEditingItemIndex(customItems.length);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setCustomItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
    if (editingItemIndex === index) {
      setEditingItemIndex(null);
    }
  };

  const totalCosto = customItems.reduce((sum, item) => sum + (item.costoTotal || 0), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Nuevo Trabajo - Paso {step} de 2
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.filter(c => c.estado === 'activo').map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nombreCompleto}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoTrabajoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Trabajo *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setCustomItems([]);
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposTrabajo.filter(t => t.activo).map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
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
                name="nombreTrabajo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Trabajo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Poder especial para Juan - Banco X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcionTrabajo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalles del trabajo..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Inicio *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: es })
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
                  name="fechaFinEstimada"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha Fin Estimada *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: es })
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
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="presupuestoInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto Inicial (Gs.) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notasInternas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Internas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas privadas..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleStep1Next}>
                  Siguiente: Configurar Pasos
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pasos del Trabajo</h3>
              <Button variant="outline" size="sm" onClick={addNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Paso
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {customItems.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 bg-muted/30"
                >
                  {editingItemIndex === index ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Nombre del paso"
                        value={item.nombreItem}
                        onChange={(e) => updateItem(index, 'nombreItem', e.target.value)}
                      />
                      <Textarea
                        placeholder="Descripción"
                        value={item.descripcionItem}
                        onChange={(e) => updateItem(index, 'descripcionItem', e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Costo (Gs.)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.costoTotal || 0}
                            onChange={(e) => updateItem(index, 'costoTotal', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Días estimados</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.diasEstimados || 0}
                            onChange={(e) => updateItem(index, 'diasEstimados', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingItemIndex(null)}
                      >
                        Listo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {index + 1}. {item.nombreItem || '(Sin nombre)'}
                        </p>
                        {item.descripcionItem && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.descripcionItem}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Costo: {(item.costoTotal || 0).toLocaleString('es-PY')} Gs. | {item.diasEstimados || 0} días
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingItemIndex(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {customItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay pasos definidos.</p>
                  <p className="text-sm">Agregue pasos manualmente o seleccione un tipo de trabajo.</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Total de pasos:</span>
                <span className="font-medium">{customItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo total estimado:</span>
                <span className="font-semibold">{totalCosto.toLocaleString('es-PY')} Gs.</span>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button
                onClick={form.handleSubmit(handleFormSubmit)}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Trabajo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}