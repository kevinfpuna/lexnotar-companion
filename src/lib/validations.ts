import { z } from 'zod';

// Helper para sanitizar strings (remover caracteres peligrosos)
const sanitizeString = (str: string) => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .trim();
};

// Transformador de sanitización
const sanitizedString = (schema: z.ZodString) => 
  schema.transform(sanitizeString);

// Phone validation for Paraguay format (flexible)
const phoneRegex = /^[\d\s\+\-\(\)]{6,20}$/;

// Email regex más estricto
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Documento de identidad (alfanumérico con guiones)
const documentoRegex = /^[a-zA-Z0-9\-\.]{3,20}$/;

// Validación de URL segura
const safeUrlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

// Cliente validation schema
export const clienteSchema = z.object({
  tipoClienteId: z.string().min(1, 'Seleccione un tipo de cliente'),
  nombreCompleto: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.\,\-\']+$/, 'El nombre contiene caracteres no permitidos')
    .transform(sanitizeString),
  documentoIdentidad: z.string()
    .min(1, 'El documento es requerido')
    .max(50, 'El documento es demasiado largo')
    .regex(documentoRegex, 'Formato de documento inválido'),
  telefono: z.string()
    .min(1, 'El teléfono es requerido')
    .max(30, 'El teléfono es demasiado largo')
    .regex(phoneRegex, 'Formato de teléfono inválido'),
  email: z.string()
    .max(100, 'El email es demasiado largo')
    .refine((val) => val === '' || emailRegex.test(val), 'Ingrese un email válido')
    .or(z.literal('')),
  domicilio: z.string()
    .max(300, 'El domicilio es demasiado largo')
    .transform(sanitizeString)
    .optional(),
  notasInternas: z.string()
    .max(1000, 'Las notas son demasiado largas')
    .transform(sanitizeString)
    .optional(),
  datosCustom: z.record(z.any()).optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

// Trabajo validation schema
export const trabajoSchema = z.object({
  clienteId: z.string().min(1, 'Seleccione un cliente'),
  tipoTrabajoId: z.string().min(1, 'Seleccione un tipo de trabajo'),
  nombreTrabajo: z.string()
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(200, 'El nombre es demasiado largo')
    .transform(sanitizeString),
  descripcionTrabajo: z.string()
    .max(500, 'La descripción es demasiado larga')
    .transform(sanitizeString)
    .optional(),
  fechaInicio: z.date({ required_error: 'La fecha de inicio es requerida' }),
  fechaFinEstimada: z.date({ required_error: 'La fecha estimada es requerida' }),
  presupuestoInicial: z.number()
    .min(0, 'El presupuesto debe ser mayor o igual a 0')
    .max(999999999, 'El presupuesto excede el límite permitido'),
  notasInternas: z.string()
    .max(1000, 'Las notas son demasiado largas')
    .transform(sanitizeString)
    .optional(),
}).refine((data) => data.fechaFinEstimada >= data.fechaInicio, {
  message: 'La fecha fin debe ser posterior a la fecha de inicio',
  path: ['fechaFinEstimada'],
});

export type TrabajoFormData = z.infer<typeof trabajoSchema>;

// Item validation schema
export const itemSchema = z.object({
  nombreItem: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo')
    .transform(sanitizeString),
  descripcionItem: z.string()
    .max(500, 'La descripción es demasiado larga')
    .transform(sanitizeString)
    .optional(),
  costoTotal: z.number()
    .min(0, 'El costo debe ser mayor o igual a 0')
    .max(999999999, 'El costo excede el límite permitido'),
  diasEstimados: z.number()
    .min(0, 'Los días deben ser mayor o igual a 0')
    .max(365, 'Los días estimados no pueden exceder un año'),
});

export type ItemFormData = z.infer<typeof itemSchema>;

// Pago validation schema
export const pagoSchema = z.object({
  trabajoId: z.string().min(1, 'Seleccione un trabajo'),
  itemId: z.string().optional(),
  monto: z.number()
    .min(1, 'El monto debe ser mayor a 0')
    .max(999999999, 'El monto excede el límite permitido'),
  fechaPago: z.date({ required_error: 'La fecha de pago es requerida' })
    .refine((date) => date <= new Date(), 'La fecha de pago no puede ser futura'),
  metodoPago: z.enum(['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'], {
    required_error: 'Seleccione un método de pago',
  }),
  referenciaPago: z.string()
    .max(100, 'La referencia es demasiado larga')
    .regex(/^[a-zA-Z0-9\-\_\s]*$/, 'La referencia contiene caracteres no permitidos')
    .optional(),
  notasPago: z.string()
    .max(500, 'Las notas son demasiado largas')
    .transform(sanitizeString)
    .optional(),
});

export type PagoFormData = z.infer<typeof pagoSchema>;

// Evento validation schema
export const eventoSchema = z.object({
  trabajoId: z.string().optional(),
  tituloEvento: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo')
    .transform(sanitizeString),
  tipoEvento: z.enum(['Inicio', 'Fin estimada', 'Fin real', 'Recordatorio', 'Cita personal', 'Vencimiento'], {
    required_error: 'Seleccione un tipo de evento',
  }),
  fechaEvento: z.date({ required_error: 'La fecha es requerida' }),
  descripcion: z.string()
    .max(500, 'La descripción es demasiado larga')
    .transform(sanitizeString)
    .optional(),
  recordatorioHorasAntes: z.number().min(0).max(168).optional(),
});

export type EventoFormData = z.infer<typeof eventoSchema>;

// Documento validation schema (mock - no real upload)
export const documentoSchema = z.object({
  nombreArchivo: z.string()
    .min(1, 'El nombre del archivo es requerido')
    .max(200, 'El nombre es demasiado largo')
    .regex(/^[a-zA-Z0-9\-\_\.\s]+$/, 'El nombre contiene caracteres no permitidos'),
  tipoDocumento: z.enum(['CI', 'Poder', 'Título', 'Contrato', 'Presupuesto', 'Acta', 'Sentencia', 'Comprobante pago', 'Otro'], {
    required_error: 'Seleccione un tipo de documento',
  }),
  clienteId: z.string().optional(),
  trabajoId: z.string().optional(),
  itemId: z.string().optional(),
  pesoKb: z.number().min(0).max(50000, 'El archivo excede el tamaño máximo permitido').optional(),
});

export type DocumentoFormData = z.infer<typeof documentoSchema>;

// Configuración validation schema
export const configuracionSchema = z.object({
  iva: z.number().min(0).max(100, 'El IVA debe estar entre 0 y 100'),
  diasAlerta: z.number().min(1).max(365, 'Los días de alerta deben estar entre 1 y 365'),
  moneda: z.string().min(1).max(10),
  formatoFecha: z.string().min(1).max(20),
  sonidoNotificaciones: z.boolean(),
  pushNotificaciones: z.boolean(),
  tema: z.enum(['light', 'dark', 'system']),
});

export type ConfiguracionFormData = z.infer<typeof configuracionSchema>;
