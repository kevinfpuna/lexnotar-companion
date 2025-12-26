import { z } from 'zod';

// Phone validation for Paraguay format
const phoneRegex = /^(\+595|0)?\s?9\d{2}\s?\d{3}\s?\d{3}$/;

// Cliente validation schema
export const clienteSchema = z.object({
  tipoClienteId: z.string().min(1, 'Seleccione un tipo de cliente'),
  nombreCompleto: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre es demasiado largo'),
  documentoIdentidad: z.string()
    .min(1, 'El documento es requerido')
    .max(50, 'El documento es demasiado largo'),
  telefono: z.string()
    .min(1, 'El teléfono es requerido')
    .max(30, 'El teléfono es demasiado largo'),
  email: z.string()
    .email('Ingrese un email válido')
    .max(100, 'El email es demasiado largo')
    .or(z.literal('')),
  domicilio: z.string().max(300, 'El domicilio es demasiado largo').optional(),
  notasInternas: z.string().max(1000, 'Las notas son demasiado largas').optional(),
  datosCustom: z.record(z.any()).optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

// Trabajo validation schema
export const trabajoSchema = z.object({
  clienteId: z.string().min(1, 'Seleccione un cliente'),
  tipoTrabajoId: z.string().min(1, 'Seleccione un tipo de trabajo'),
  nombreTrabajo: z.string()
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(200, 'El nombre es demasiado largo'),
  descripcionTrabajo: z.string().max(500, 'La descripción es demasiado larga').optional(),
  fechaInicio: z.date({ required_error: 'La fecha de inicio es requerida' }),
  fechaFinEstimada: z.date({ required_error: 'La fecha estimada es requerida' }),
  presupuestoInicial: z.number()
    .min(0, 'El presupuesto debe ser mayor o igual a 0'),
  notasInternas: z.string().max(1000, 'Las notas son demasiado largas').optional(),
}).refine((data) => data.fechaFinEstimada >= data.fechaInicio, {
  message: 'La fecha fin debe ser posterior a la fecha de inicio',
  path: ['fechaFinEstimada'],
});

export type TrabajoFormData = z.infer<typeof trabajoSchema>;

// Item validation schema
export const itemSchema = z.object({
  nombreItem: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo'),
  descripcionItem: z.string().max(500, 'La descripción es demasiado larga').optional(),
  costoTotal: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
  diasEstimados: z.number().min(0, 'Los días deben ser mayor o igual a 0'),
});

export type ItemFormData = z.infer<typeof itemSchema>;

// Pago validation schema
export const pagoSchema = z.object({
  trabajoId: z.string().min(1, 'Seleccione un trabajo'),
  itemId: z.string().optional(),
  monto: z.number()
    .min(1, 'El monto debe ser mayor a 0'),
  fechaPago: z.date({ required_error: 'La fecha de pago es requerida' }),
  metodoPago: z.enum(['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'], {
    required_error: 'Seleccione un método de pago',
  }),
  referenciaPago: z.string().max(100, 'La referencia es demasiado larga').optional(),
  notasPago: z.string().max(500, 'Las notas son demasiado largas').optional(),
});

export type PagoFormData = z.infer<typeof pagoSchema>;

// Evento validation schema
export const eventoSchema = z.object({
  trabajoId: z.string().optional(),
  tituloEvento: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo'),
  tipoEvento: z.enum(['Inicio', 'Fin estimada', 'Fin real', 'Recordatorio', 'Cita personal', 'Vencimiento'], {
    required_error: 'Seleccione un tipo de evento',
  }),
  fechaEvento: z.date({ required_error: 'La fecha es requerida' }),
  descripcion: z.string().max(500, 'La descripción es demasiado larga').optional(),
  recordatorioHorasAntes: z.number().min(0).max(168).optional(),
});

export type EventoFormData = z.infer<typeof eventoSchema>;

// Documento validation schema (mock - no real upload)
export const documentoSchema = z.object({
  nombreArchivo: z.string()
    .min(1, 'El nombre del archivo es requerido')
    .max(200, 'El nombre es demasiado largo'),
  tipoDocumento: z.enum(['CI', 'Poder', 'Título', 'Contrato', 'Presupuesto', 'Acta', 'Sentencia', 'Comprobante pago', 'Otro'], {
    required_error: 'Seleccione un tipo de documento',
  }),
  clienteId: z.string().optional(),
  trabajoId: z.string().optional(),
  itemId: z.string().optional(),
  pesoKb: z.number().min(0).optional(),
});

export type DocumentoFormData = z.infer<typeof documentoSchema>;
