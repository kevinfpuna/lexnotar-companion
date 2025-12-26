import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { clienteSchema, ClienteFormData } from '@/lib/validations';
import { Cliente, TipoCliente } from '@/types';
import { Loader2 } from 'lucide-react';

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tiposCliente: TipoCliente[];
  onSubmit: (data: ClienteFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<Cliente>;
  mode?: 'create' | 'edit';
}

export function ClienteForm({
  open,
  onOpenChange,
  tiposCliente,
  onSubmit,
  isLoading = false,
  defaultValues,
  mode = 'create',
}: ClienteFormProps) {
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipoClienteId: defaultValues?.tipoClienteId || '',
      nombreCompleto: defaultValues?.nombreCompleto || '',
      documentoIdentidad: defaultValues?.documentoIdentidad || '',
      telefono: defaultValues?.telefono || '',
      email: defaultValues?.email || '',
      domicilio: defaultValues?.domicilio || '',
      notasInternas: defaultValues?.notasInternas || '',
      datosCustom: defaultValues?.datosCustom || {},
    },
  });

  const handleSubmit = async (data: ClienteFormData) => {
    await onSubmit(data);
    if (mode === 'create') {
      form.reset();
    }
    onOpenChange(false);
  };

  const selectedTipoId = form.watch('tipoClienteId');
  const selectedTipo = tiposCliente.find(t => t.id === selectedTipoId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipoClienteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cliente *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={mode === 'edit'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposCliente.filter(t => t.activo).map((tipo) => (
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

            <FormField
              control={form.control}
              name="nombreCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo / Razón Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez o Empresa S.A." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentoIdentidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento de Identidad *</FormLabel>
                  <FormControl>
                    <Input placeholder="CI, RUC o Pasaporte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="+595 981 123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="domicilio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domicilio</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom fields based on tipo */}
            {selectedTipo && Object.keys(selectedTipo.camposCustom).length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Datos adicionales</h4>
                <div className="space-y-3">
                  {Object.entries(selectedTipo.camposCustom).map(([key, config]) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`datosCustom.${key}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {config.placeholder || key}
                            {config.obligatorio && ' *'}
                          </FormLabel>
                          <FormControl>
                            {config.tipo === 'select' ? (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {config.opciones?.map((op) => (
                                    <SelectItem key={op} value={op}>
                                      {op}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : config.tipo === 'textarea' ? (
                              <Textarea {...field} />
                            ) : (
                              <Input 
                                type={config.tipo === 'number' ? 'number' : config.tipo === 'date' ? 'date' : 'text'} 
                                {...field} 
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notasInternas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Internas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas privadas sobre el cliente..." 
                      {...field} 
                    />
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
                {mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
